import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import _import from "eslint-plugin-import";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import prettier from "eslint-plugin-prettier";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [...fixupConfigRules(compat.extends(
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
)), {
    plugins: {
        "@typescript-eslint": fixupPluginRules(typescriptEslint),
        import: fixupPluginRules(_import),
        "simple-import-sort": simpleImportSort,
        prettier,
    },

    languageOptions: {
        parser: tsParser,
        ecmaVersion: 2020,
        sourceType: "module",
    },

    rules: {
        "@typescript-eslint/no-parameter-properties": "off",
        "@typescript-eslint/no-use-before-define": "off",
        "import/no-unresolved": "off",
        "@typescript-eslint/no-unused-vars": "warn",
        camelcase: "warn",
        "simple-import-sort/imports": "warn",
        "sort-imports": "off",
        "import/first": "warn",
        "import/newline-after-import": "warn",
        "import/no-duplicates": "warn",
        "import/no-absolute-path": "warn",
        "import/no-unused-modules": "warn",
        "import/no-deprecated": "warn",
        "import/no-self-import": "error",

        "max-len": ["warn", {
            code: 170,
            tabWidth: 2,
            ignoreUrls: true,
        }],

        "prettier/prettier": "warn",
    },
}, {
    files: ["**/*.ts"],

    rules: {
        "import/order": ["off", {
            "newlines-between": "always",
        }],
    },
}, {
    files: ["**/*.js"],

    languageOptions: {
        globals: {
            ...globals.node,
        },
    },
}];