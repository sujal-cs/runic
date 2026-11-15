import { db } from "../db/index.js";
import { problems } from "../db/schema.js";

const LEETCODE_GRAPHQL = "https://leetcode.com/graphql";

async function gql(query: string, variables: any = {}) {
  const res = await fetch(LEETCODE_GRAPHQL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0",
      Referer: "https://leetcode.com",
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`LeetCode HTTP ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

const LIST_QUERY = `
  query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
    problemsetQuestionList: questionList(categorySlug: $categorySlug, limit: $limit, skip: $skip, filters: $filters) {
      total: totalNum
      questions: data {
        frontendQuestionId: questionFrontendId
        title
        titleSlug
        difficulty
        isPaidOnly
        topicTags { name }
        acRate
      }
    }
  }
`;

const DETAIL_QUERY = `
  query questionData($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      questionFrontendId
      title
      titleSlug
      content
      difficulty
      exampleTestcases
      metaData
      codeSnippets { lang langSlug code }
      topicTags { name }
      hints
    }
  }
`;

function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

function parseConstraints(html: string): string[] {
  // LeetCode wraps constraints in a <ul> following a "Constraints:" label.
  const match = html.match(/Constraints:<\/strong><\/p>\s*<ul>(.*?)<\/ul>/is);
  if (!match) return [];
  return [...match[1].matchAll(/<li>(.*?)<\/li>/gis)].map((m) => decodeEntities(m[1].replace(/<[^>]+>/g, "").trim()));
}

function parseExpectedOutputs(html: string): string[] {
  // LeetCode renders examples as paragraphs with "Output:" followed by a <code> value.
  const outputs: string[] = [];
  const matches = [...html.matchAll(/Output:<\/strong>\s*<code>(.*?)<\/code>/gis)];
  for (const m of matches) {
    outputs.push(m[1].replace(/<[^>]+>/g, "").trim());
  }
  if (outputs.length === 0) {
    const fallback = [...html.matchAll(/Output:<\/strong>\s*(.*?)(?:<\/p>|$)/gis)];
    for (const m of fallback) {
      const val = m[1].replace(/<[^>]+>/g, "").trim();
      if (val) outputs.push(val);
    }
  }
  return outputs;
}

function parseTestCases(exampleTestcases: string, metaData: string, html: string): any[] {
  let paramsCount = 1;
  try {
    const meta = JSON.parse(metaData);
    if (Array.isArray(meta.params)) paramsCount = meta.params.length || 1;
  } catch {
    // Fall back to one parameter per test case.
  }
  const lines = exampleTestcases.trim().split(/\r?\n/);
  const expectedOutputs = parseExpectedOutputs(html);
  const cases: any[] = [];
  let caseIndex = 0;
  for (let i = 0; i + paramsCount <= lines.length; i += paramsCount) {
    const chunk = lines.slice(i, i + paramsCount);
    cases.push({ input: chunk.join("\n"), expected: expectedOutputs[caseIndex] ?? null });
    caseIndex++;
  }
  return cases;
}

async function main() {
  const targetCount = 30;
  const collected: any[] = [];
  let skip = 0;
  while (collected.length < targetCount) {
    const data = await gql(LIST_QUERY, {
      categorySlug: "",
      limit: 50,
      skip,
      filters: {},
    });
    const qs = data.problemsetQuestionList.questions;
    for (const q of qs) {
      if (q.isPaidOnly) continue;
      collected.push(q);
      if (collected.length >= targetCount) break;
    }
    skip += qs.length;
    if (qs.length === 0) break;
  }

  console.log(`Collected ${collected.length} problem slugs`);

  for (const q of collected) {
    try {
      const detail = await gql(DETAIL_QUERY, { titleSlug: q.titleSlug });
      const d = detail.question;
      const snippets: Record<string, string> = {};
      for (const s of d.codeSnippets || []) snippets[s.langSlug] = s.code;

      const constraints = parseConstraints(d.content || "");
      const testCases = parseTestCases(d.exampleTestcases || "", d.metaData || "{}", d.content || "");

      await db
        .insert(problems)
        .values({
          frontendId: d.questionFrontendId,
          title: d.title,
          slug: d.titleSlug,
          difficulty: d.difficulty,
          description: d.content || "",
          examples: [],
          constraints,
          testCases,
          codeSnippets: snippets,
          tags: (d.topicTags || []).map((t: any) => t.name),
          acceptanceRate: String(q.acRate),
        })
        .onConflictDoUpdate({
          target: problems.slug,
          set: {
            title: d.title,
            difficulty: d.difficulty,
            description: d.content || "",
            constraints,
            testCases,
            codeSnippets: snippets,
            tags: (d.topicTags || []).map((t: any) => t.name),
            acceptanceRate: String(q.acRate),
            updatedAt: new Date(),
          },
        });
      console.log(`Ingested: ${d.questionFrontendId} ${d.title}`);
      await new Promise((r) => setTimeout(r, 400));
    } catch (err) {
      console.error(`Failed ${q.titleSlug}:`, err);
    }
  }

  console.log("Ingestion complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
