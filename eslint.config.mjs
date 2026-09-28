import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Plain-CommonJS bootstrap scripts invoked directly via `node scripts/*.js`
    // (e.g. the dev/build/start Node-version wrapper) — these run before any
    // TS/ESM tooling and intentionally use require(), so the app's TS lint
    // rules don't apply to them.
    "scripts/**",
  ]),
]);

export default eslintConfig;
