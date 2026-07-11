import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import eslintPluginPrettier from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      js,
      prettier: eslintPluginPrettier,
    },
    extends: ["js/recommended"],
    rules: {
      "prettier/prettier": "error",
    },
  },

  tseslint.configs.recommended,

  eslintConfigPrettier,
]);
