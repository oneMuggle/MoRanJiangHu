import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  {
    ignores: ['node_modules/**', 'dist/**', 'functions/**', 'scripts/**'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tsparser,
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: {
        window: 'readonly', document: 'readonly', console: 'readonly',
        setTimeout: 'readonly', setInterval: 'readonly', clearTimeout: 'readonly',
        clearInterval: 'readonly', fetch: 'readonly', FormData: 'readonly',
        File: 'readonly', Blob: 'readonly', navigator: 'readonly',
        localStorage: 'readonly', sessionStorage: 'readonly',
        IDBRequest: 'readonly', IDBOpenDBRequest: 'readonly',
        IDBTransaction: 'readonly', IDBDatabase: 'readonly',
        HTMLElement: 'readonly', HTMLDivElement: 'readonly',
        Event: 'readonly', CustomEvent: 'readonly', Promise: 'readonly',
        JSON: 'readonly', Math: 'readonly', Date: 'readonly',
        Array: 'readonly', Object: 'readonly', String: 'readonly',
        Number: 'readonly', Boolean: 'readonly', Symbol: 'readonly',
        Map: 'readonly', Set: 'readonly', WeakMap: 'readonly',
        WeakSet: 'readonly', Reflect: 'readonly', URL: 'readonly',
        URLSearchParams: 'readonly', AbortController: 'readonly',
        AbortSignal: 'readonly', Headers: 'readonly', Request: 'readonly',
        Response: 'readonly', WebSocket: 'readonly',
        TextEncoder: 'readonly', TextDecoder: 'readonly',
        ReadableStream: 'readonly', WritableStream: 'readonly',
        TransformStream: 'readonly', CompressionStream: 'readonly',
        DecompressionStream: 'readonly', btoa: 'readonly', atob: 'readonly',
        isNaN: 'readonly', isFinite: 'readonly',
        parseInt: 'readonly', parseFloat: 'readonly',
        encodeURI: 'readonly', decodeURI: 'readonly',
        encodeURIComponent: 'readonly', decodeURIComponent: 'readonly',
        eval: 'readonly', undefined: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      react,
      'react-hooks': reactHooks,
    },
    rules: {
      '@typescript-eslint/naming-convention': [
        'warn',
        { selector: 'default', format: ['camelCase'], leadingUnderscore: 'allow', trailingUnderscore: 'allow' },
        { selector: 'variable', format: ['camelCase', 'PascalCase'], leadingUnderscore: 'allow', trailingUnderscore: 'allow' },
        { selector: 'function', format: ['camelCase', 'PascalCase'] },
        { selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow' },
        { selector: 'property', format: ['camelCase', 'PascalCase', 'snake_case'] },
        { selector: 'enumMember', format: ['UPPER_CASE', 'PascalCase'] },
      ],
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'no-console': 'warn',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'react-hooks/no-result': 'off',
    },
  },
  {
    files: ['data/**/*.ts', 'models/**/*.ts', 'vite.config.ts'],
    rules: { '@typescript-eslint/naming-convention': 'off', 'no-restricted-syntax': 'off' },
  },
];
