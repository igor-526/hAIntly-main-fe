import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

const projectRoot = process.cwd();
const fixtureRoot = await mkdtemp(path.join(projectRoot, ".format-ignore-regression-"));
const ignoredSource = "const ignored={value:'unchanged'}\n";

try {
  const githubFile = path.join(fixtureRoot, ".github", "fixture.js");
  const helmFile = path.join(fixtureRoot, "nested", ".helm", "fixture.js");
  const controlFile = path.join(fixtureRoot, "control.js");

  await mkdir(path.dirname(githubFile), { recursive: true });
  await mkdir(path.dirname(helmFile), { recursive: true });
  await writeFile(githubFile, ignoredSource);
  await writeFile(helmFile, ignoredSource);
  await writeFile(controlFile, "const control={value:'formatted'}\n");

  const prettier = spawnSync(process.execPath, ["node_modules/prettier/bin/prettier.cjs", "--write", fixtureRoot], {
    cwd: projectRoot,
    encoding: "utf8",
  });

  assert.equal(prettier.status, 0, `Prettier failed:\n${prettier.stdout}${prettier.stderr}`);
  assert.equal(await readFile(githubFile, "utf8"), ignoredSource);
  assert.equal(await readFile(helmFile, "utf8"), ignoredSource);
  assert.equal(await readFile(controlFile, "utf8"), 'const control = { value: "formatted" };\n');
} finally {
  await rm(fixtureRoot, { recursive: true, force: true });
}
