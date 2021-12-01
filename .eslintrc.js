module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import', 'simple-import-sort', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/no-parameter-properties': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    'import/no-unresolved': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
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
    'max-len': ['warn', { code: 170, tabWidth: 2, ignoreUrls: true }],
    'prettier/prettier': 'warn',
  },
  overrides: [
    {
      files: '**/*.ts',
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
      files: '**/*.js',
      env: {
        node: true,
      },
    },
  ],
};
