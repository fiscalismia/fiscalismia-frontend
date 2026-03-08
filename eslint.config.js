import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';
import jsdocPlugin from 'eslint-plugin-jsdoc';
import reactPlugin from 'eslint-plugin-react';

export default defineConfig([
  globalIgnores(['**/dist/**', 'build/']),

  {
    files: ['**/*.ts', '**/*.tsx', '**/*.jsx'],
    ignores: ['vite.config.ts'],

    plugins: {
      '@typescript-eslint': tseslint.plugin,
      jsdoc: jsdocPlugin,
      react: reactPlugin
    },
    extends: [
      js.configs.recommended, // eslint:recommended
      tseslint.configs.recommended, // TS-eslint recommended (includes eslint-recommended disables)
      eslintConfigPrettier // disables rules that conflict with Prettier
    ],

    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: 2020,
        sourceType: 'module',
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      },
      // The `globals` package provides objects like `globals.browser`
      // whose keys are global variable names (window, document, etc.)
      globals: {
        ...globals.browser, // window, document, navigator, etc.
        ...globals.es2021, // Atomics, SharedArrayBuffer, etc. (covers es6+)
        ...globals.node, // process, require, __dirname, etc.
        module: true
      }
    },

    // 'detect' reads React version for React-Plugin from package.json
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      quotes: ['error', 'single'],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true
        }
      ],

      'no-console': 'error',
      'jsdoc/check-alignment': 'error',
      'jsdoc/check-param-names': 'error',
      'jsdoc/check-types': 'error',
      'jsdoc/require-param': 'error',
      'jsdoc/require-returns': 'error',
      'jsdoc/require-jsdoc': [
        'warn',
        {
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
            FunctionExpression: true
          }
        }
      ]
    }
  }
]);
