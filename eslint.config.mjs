import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import sonarjs from "eslint-plugin-sonarjs";
import unicorn from "eslint-plugin-unicorn";

const inlineHandlerRestrictions = [
  { selector: "JSXAttribute[name.name=/^on[A-Z]/] JSXExpressionContainer > ArrowFunctionExpression[body.type='BlockStatement'][body.length>2]", message: "Сложный JSX handler должен быть именованной функцией." },
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: { sonarjs, unicorn },
    rules: {
      "no-duplicate-imports": "error",
      "no-console": ["error", { allow: ["warn", "error"] }],
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", ignoreRestSiblings: true }],
      "@typescript-eslint/no-explicit-any": ["error", { fixToUnknown: true, ignoreRestArgs: true }],
      "@typescript-eslint/ban-ts-comment": "error",
      "unicorn/no-abusive-eslint-disable": "error",
      "unicorn/no-useless-undefined": "error",
      "sonarjs/no-identical-functions": "error",
      "sonarjs/cognitive-complexity": ["error", 30],
      "complexity": ["error", 20],
      "max-lines": ["error", { max: 400, skipBlankLines: true, skipComments: true }],
      "max-lines-per-function": ["error", { max: 200, skipBlankLines: true, skipComments: true, IIFEs: true }],
      "max-statements": ["error", 60],
      "react/jsx-no-bind": ["error", { allowArrowFunctions: true, allowFunctions: false, allowBind: false, ignoreRefs: true }],
      "no-restricted-syntax": ["error", ...inlineHandlerRestrictions],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
