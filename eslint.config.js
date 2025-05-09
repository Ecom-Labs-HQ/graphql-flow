import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

import eslintConfigPrettier from "eslint-config-prettier";

/** @type {import('eslint').Linter.Config[]} */
export default [
    /* Basic config */
    {
        files: ["**/*.ts"],
    },
    {
        ignores: ["**/dist/"],
    },
    {
        languageOptions: {
            globals: globals.node,
        },
    },

    /* Recommended plugins */
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,

    /* Disable stylistic settings */
    eslintConfigPrettier,
];
