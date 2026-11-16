import {
  pgTable,
  serial,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  numeric,
  integer,
  index,
} from "drizzle-orm/pg-core";

// Users are the only identity store; sessions live in Redis via express-session.
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: varchar("username", { length: 32 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: varchar("display_name", { length: 64 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const problems = pgTable(
  "problems",
  {
    id: serial("id").primaryKey(),
    frontendId: varchar("frontend_id", { length: 16 }).notNull().unique(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    difficulty: varchar("difficulty", { length: 16 }).notNull(),
    description: text("description").notNull(),
    examples: jsonb("examples").notNull().default([]),
    constraints: jsonb("constraints").notNull().default([]),
    testCases: jsonb("test_cases").notNull().default([]),
    codeSnippets: jsonb("code_snippets").notNull().default({}),
    tags: jsonb("tags").notNull().default([]),
    acceptanceRate: numeric("acceptance_rate"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    difficultyIdx: index("idx_problems_difficulty").on(table.difficulty),
    tagsIdx: index("idx_problems_tags").using("gin", table.tags),
  }),
);

export const submissions = pgTable(
  "submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    problemId: integer("problem_id").notNull().references(() => problems.id, { onDelete: "cascade" }),
    language: varchar("language", { length: 32 }).notNull(),
    code: text("code").notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    runtimeMs: integer("runtime_ms"),
    result: jsonb("result"),
    // Platform-level explanation (judge unavailable, worker crash, ...). Test
    // case output lives in `result`.
    message: text("message"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("idx_submissions_user").on(table.userId),
    userCreatedIdx: index("idx_submissions_user_created").on(table.userId, table.createdAt),
    problemIdx: index("idx_submissions_problem").on(table.problemId),
    statusIdx: index("idx_submissions_status").on(table.status),
  }),
);
