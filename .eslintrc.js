module.exorts = {
  root: true,
  env: {
    node: true,
    jest: true,
    browser: true,
  },
  extends: ['plugin:@typescript-eslint/recommended', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  rules: {
    'no-console': 0,
    semi: 0,
    '@typescript-eslint/no-explicit-any': 0,
  },
};
