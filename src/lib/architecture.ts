import { posix } from "node:path";

export type SourceFile = { path: string; content: string };

const importPattern = /(?:from\s+|import\s*)["']([^"']+)["']/g;
const sharedRoots = new Set(["api", "contexts", "hooks", "lib", "test", "types", "ui"]);

function sourcePath(path: string) {
  const normalized = path.replaceAll("\\", "/");
  return normalized.startsWith("src/") ? normalized.slice(4) : normalized.split("/src/")[1];
}

function importTarget(owner: string, specifier: string) {
  if (specifier.startsWith("@/")) return specifier.slice(2);
  if (specifier.startsWith(".")) return posix.normalize(posix.join(posix.dirname(owner), specifier));
  return null;
}

function imports(owner: string, content: string) {
  return [...content.matchAll(importPattern)]
    .map((match) => importTarget(owner, match[1]))
    .filter((target): target is string => target !== null);
}

function dependencyViolations(path: string, content: string) {
  const violations: string[] = [];
  const [root, feature] = path.split("/");
  for (const targetPath of imports(path, content)) {
    const [targetRoot, targetFeature] = targetPath.split("/");
    if (sharedRoots.has(root) && ["features", "app"].includes(targetRoot)) violations.push(`${path}: shared-слой импортирует ${targetRoot}`);
    if (root === "features" && targetRoot === "features" && feature !== targetFeature) violations.push(`${path}: feature-to-feature import`);
    if (root === "features" && path.endsWith(".tsx") && !path.endsWith(".test.tsx") && targetRoot === "api") violations.push(`${path}: feature UI обходит service/hook и импортирует API boundary`);
  }
  return violations;
}

function routeViolations(path: string, content: string) {
  if (!/^app\/(?:.+\/)?page\.tsx$/.test(path)) return [];
  const violations: string[] = [];
  const featureImports = imports(path, content).filter((target) => target.startsWith("features/"));
  if (featureImports.length !== 1) violations.push(`${path}: route page должна импортировать одну feature`);
  if (/\b(?:fetch|useState|useEffect|apiRequest)\b/.test(content)) violations.push(`${path}: orchestration в routing-слое`);
  return violations;
}

export function architectureViolations(files: SourceFile[]): string[] {
  const violations: string[] = [];
  for (const file of files) {
    const path = sourcePath(file.path);
    if (!path) {
      if (/\.(?:ts|tsx|js|jsx)$/.test(file.path) && !/(?:next|vitest|eslint)\.config\.|next-env\.d\.ts$/.test(file.path)) violations.push(`${file.path}: исходник находится вне src`);
      continue;
    }
    violations.push(...dependencyViolations(path, file.content), ...routeViolations(path, file.content));
  }
  return violations;
}
