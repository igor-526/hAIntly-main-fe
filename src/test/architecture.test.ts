import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { architectureViolations, type SourceFile } from "@/lib/architecture";

function sourceFiles(root: string): SourceFile[] {
  return readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.(?:ts|tsx|js|jsx)$/.test(entry.name))
    .map((entry) => join(entry.parentPath, entry.name))
    .filter((path) => !path.includes("/node_modules/") && !path.includes("/.next/"))
    .map((path) => ({
      path: relative(root, path),
      content: readFileSync(path, "utf8"),
    }));
}

describe("направленные зависимости", () => {
  it("принимает текущее дерево src", () => expect(architectureViolations(sourceFiles(process.cwd()))).toEqual([]));
  it("отклоняет alias и relative обходы границ, прямой API из UI и внешний source", () => {
    const invalid: SourceFile[] = [
      {
        path: "src/ui/card.tsx",
        content: `import "@/${"features"}/auth/ui/auth-form"`,
      },
      {
        path: "src/features/auth/ui/page.tsx",
        content: `import "@/${"features"}/workspace/home-page"`,
      },
      {
        path: "src/ui/relative-card.tsx",
        content: `import "../${"features"}/auth/ui/auth-form"`,
      },
      {
        path: "src/features/auth/ui/relative-page.tsx",
        content: `import "../../${"workspace"}/home-page"`,
      },
      {
        path: "src/features/auth/ui/form.tsx",
        content: `import { apiRequest } from "@/${"api"}/main-be"`,
      },
      { path: "legacy.ts", content: "export const legacy = true" },
    ];
    expect(architectureViolations(invalid)).toHaveLength(6);
  });
});
