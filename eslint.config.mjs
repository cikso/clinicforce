import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".trigger/**",
    "node_modules/**",
    "supabase/**",
    "scripts/**",
    "public/**",
  ]),
  {
    rules: {
      "@next/next/no-img-element": "warn",
      "@next/next/no-page-custom-font": "warn",
      "no-unused-vars": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "no-unused-expressions": "warn",
      "jsx-a11y/alt-text": "warn",
    },
  },
]);

export default eslintConfig;
