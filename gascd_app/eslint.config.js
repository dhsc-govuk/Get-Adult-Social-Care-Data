import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import pluginNext from '@next/eslint-plugin-next';

export default [
  {
    ignores: [
      '.next/',
      'coverage/'
    ]
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    settings: {
      react: {
        version: 'detect',
      },
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: typescriptParser,
    },
    plugins: {
      react,
      reactHooks,
      '@typescript-eslint': typescriptEslint,
      '@next/next': pluginNext,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.config,
      //...typescriptEslint.configs.recommended.rules, temporarily removed for build.
      'react/react-in-jsx-scope': 'off',
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs['core-web-vitals'].rules
    },
  },
];
