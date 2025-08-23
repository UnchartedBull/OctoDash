import { fileURLToPath, URL } from 'node:url';

import { fixupConfigRules, fixupPluginRules, includeIgnoreFile } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import _import from 'eslint-plugin-import';
import prettier from 'eslint-plugin-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import ts from 'typescript-eslint';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  includeIgnoreFile(gitignorePath),
  {
    ignores: ['**/docs/js/lib/'],
  },
  ...fixupConfigRules(
    compat.extends(
      'eslint:recommended',
      'plugin:@typescript-eslint/eslint-recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:import/errors',
      'plugin:import/warnings',
      'plugin:import/typescript',
    ),
  ),
  {
    plugins: {
      '@typescript-eslint': fixupPluginRules(ts.plugin),
      import: fixupPluginRules(_import),
      'simple-import-sort': simpleImportSort,
      prettier,
    },

    languageOptions: {
      parser: ts.parser,
      ecmaVersion: 2020,
      sourceType: 'module',
    },

    rules: {
      '@typescript-eslint/no-parameter-properties': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      'import/no-unresolved': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          caughtErrors: 'none',
        },
      ],
      camelcase: 'warn',
      'simple-import-sort/imports': 'warn',
      'sort-imports': 'off',
      'import/first': 'warn',
      'import/newline-after-import': 'warn',
      'import/no-duplicates': 'warn',
      'import/no-absolute-path': 'warn',
      'import/no-unused-modules': 'warn',
      'import/no-deprecated': 'warn',
      'import/no-self-import': 'error',

      'max-len': [
        'warn',
        {
          code: 170,
          tabWidth: 2,
          ignoreUrls: true,
        },
      ],

      'prettier/prettier': 'warn',
    },
  },
  {
    files: ['**/*.ts'],

    rules: {
      'import/order': [
        'off',
        {
          'newlines-between': 'always',
        },
      ],
    },
  },
  {
    files: ['octoprint_octodash/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ko: 'readonly',
        $: 'readonly',
        PNotify: 'readonly',
        OCTOPRINT_VIEWMODELS: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-this-alias': 'off',
    },
  },
  {
    files: ['src/**/*.js'],

    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ['**/docs/js/*.js'],

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jquery,
      },
    },
  },
];
