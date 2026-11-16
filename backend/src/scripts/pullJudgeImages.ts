import { LANGUAGES } from "../shared/languages.js";
import { dockerAvailable, ensureImage } from "../worker/docker.js";

// Pull every execution image the judge may need. Run this once after cloning
// (or after changing a JUDGE_IMAGE_* variable) so the first submission does not
// pay the download cost.
async function main(): Promise<void> {
  if (!(await dockerAvailable())) {
    console.error("Docker daemon is not reachable. Start Docker and retry.");
    process.exit(1);
  }

  const images = [...new Set(LANGUAGES.map((definition) => definition.image))];
  let failures = 0;

  for (const image of images) {
    const ready = await ensureImage(image);
    console.log(`${ready ? "ok  " : "FAIL"} ${image}`);
    if (!ready) failures += 1;
  }

  if (failures > 0) {
    console.error(`${failures} image(s) could not be pulled.`);
    process.exit(1);
  }
  console.log("All judge images are ready.");
}

main().catch((err) => {
  console.error("Failed to prepare judge images:", err);
  process.exit(1);
});
