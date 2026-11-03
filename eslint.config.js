// @ts-check
import comments from '@eslint-community/eslint-plugin-eslint-comments/configs';
import js from '@eslint/js';
import boundaries from 'eslint-plugin-boundaries';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** Node built-ins and I/O libraries forbidden in pure packages (engine, catalog, shared types). */
const IO_MODULES = [
  'node:*',
  'fs',
  'fs/*',
  'path',
  'http',
  'https',
  'net',
  'child_process',
  'os',
  'pg',
  'kysely',
  '@aws-sdk/*',
  'aws-lambda',
  'react',
  'react-dom',
];

export default tseslint.config(
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/cdk.out/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  comments.recommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: { ...globals.node },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-ignore': true,
          'ts-nocheck': true,
          'ts-check': false,
          'ts-expect-error': 'allow-with-description',
        },
      ],
      // `as` is forbidden; a justified exception needs an eslint-disable comment WITH description.
      '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'never' }],
      '@eslint-community/eslint-comments/require-description': ['error', { ignore: [] }],
      '@eslint-community/eslint-comments/no-unlimited-disable': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: false }],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'decimal.js',
              message: 'Import Decimal from @platform/shared-types (isolated, configured clone).',
            },
          ],
        },
      ],
    },
  },

  // ---- Monorepo boundaries -------------------------------------------------
  {
    files: ['apps/**/*.{ts,tsx}', 'packages/**/*.ts', 'infra/**/*.ts'],
    plugins: { boundaries },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          noWarnOnMultipleProjects: true,
          project: ['apps/*/tsconfig.json', 'packages/*/tsconfig.json', 'infra/tsconfig.json'],
        },
      },
      'boundaries/include': ['apps/**/*', 'packages/**/*', 'infra/**/*'],
      'boundaries/elements': [
        { type: 'shared-types', pattern: 'packages/shared-types', mode: 'folder' },
        { type: 'rules-catalog', pattern: 'packages/rules-catalog', mode: 'folder' },
        { type: 'tax-engine', pattern: 'packages/tax-engine', mode: 'folder' },
        {
          type: 'api-module',
          pattern: 'apps/api/src/modules/*',
          mode: 'folder',
          capture: ['module'],
        },
        { type: 'api-platform', pattern: 'apps/api/src/platform', mode: 'folder' },
        { type: 'api', pattern: 'apps/api', mode: 'folder' },
        { type: 'web', pattern: 'apps/web', mode: 'folder' },
        { type: 'infra', pattern: 'infra', mode: 'folder' },
      ],
    },
    rules: {
      'boundaries/no-unknown': 'error',
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          message: '${file.type} must not import ${dependency.type} (see CLAUDE.md, "Fronteiras")',
          rules: [
            { from: 'rules-catalog', allow: ['shared-types'] },
            { from: 'tax-engine', allow: ['shared-types', 'rules-catalog'] },
            { from: 'api-platform', allow: ['shared-types'] },
            {
              from: 'api-module',
              allow: ['shared-types', 'rules-catalog', 'tax-engine', 'api-platform', 'api-module'],
            },
            {
              from: 'api',
              allow: ['shared-types', 'rules-catalog', 'tax-engine', 'api-platform', 'api-module'],
            },
            { from: 'web', allow: ['shared-types'] },
          ],
        },
      ],
      // Other modules (and the app) reach a module only through its public index.ts.
      'boundaries/entry-point': [
        'error',
        {
          default: 'disallow',
          rules: [
            { target: ['api-module'], allow: 'index.ts' },
            { target: ['shared-types', 'rules-catalog', 'tax-engine'], allow: 'src/index.ts' },
            { target: ['api-platform', 'api', 'web', 'infra'], allow: '**' },
          ],
        },
      ],
    },
  },

  // ---- Purity: the engine, the catalog and shared types do no I/O ----------
  {
    files: ['packages/*/src/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'decimal.js',
              message: 'Import Decimal from @platform/shared-types (isolated, configured clone).',
            },
          ],
          patterns: [{ group: IO_MODULES, message: 'Pure packages must not perform I/O.' }],
        },
      ],
      'no-restricted-globals': [
        'error',
        { name: 'fetch', message: 'Pure packages must not perform I/O.' },
        { name: 'process', message: 'Pure packages must not read the environment.' },
        { name: 'console', message: 'Pure packages must not log; return data instead.' },
        { name: 'setTimeout', message: 'Pure packages are synchronous and deterministic.' },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "NewExpression[callee.name='Date'][arguments.length=0]",
          message: 'Non-deterministic: receive the current date as an input.',
        },
        {
          selector: "CallExpression[callee.object.name='Date'][callee.property.name='now']",
          message: 'Non-deterministic: receive the current date as an input.',
        },
        {
          selector: "CallExpression[callee.object.name='Math'][callee.property.name='random']",
          message: 'Non-deterministic.',
        },
      ],
    },
  },
  {
    files: ['packages/shared-types/src/primitives/decimal.ts'],
    rules: { 'no-restricted-imports': 'off' },
  },

  // ---- Layering inside API modules: domain never imports infrastructure ----
  {
    files: ['apps/api/src/modules/*/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/infrastructure/**', '**/http/**', ...IO_MODULES],
              message: 'Domain code must not depend on infrastructure.',
            },
          ],
        },
      ],
    },
  },

  // ---- Web ------------------------------------------------------------------
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    languageOptions: { globals: { ...globals.browser } },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },

  // ---- Plain JS config files are not type-checked ---------------------------
  {
    files: ['**/*.js'],
    ...tseslint.configs.disableTypeChecked,
  },
);
