module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
        'plugin:@typescript-eslint/recommended',
        'prettier',
        'prettier/@typescript-eslint',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript'
    ],
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
    },
    rules: {
        '@typescript-eslint/no-parameter-properties': 'off',
        '@typescript-eslint/no-use-before-define': 'off',
        'prettier/prettier': 'warn',
        'import/no-unresolved': 'off',
        'camelcase': 'warn',
        'simple-import-sort/sort': 'warn',
        'sort-imports': 'off',
        "import/first": "warn",
        "import/newline-after-import": "warn",
        "import/no-duplicates": "warn",
        'import/no-absolute-path': 'warn',
        'import/no-unused-modules': 'warn',
        'import/no-deprecated': 'warn',
        'import/no-self-import': 'error'
    },
    plugins: [
        '@typescript-eslint',
        'prettier',
        'import',
        'simple-import-sort'
    ],
    overrides: [{
        'files': '**/*.ts',
        'rules': {
            'import/order': ['off', {
                'newlines-between': 'always'
            }],
        }
    }]
}
