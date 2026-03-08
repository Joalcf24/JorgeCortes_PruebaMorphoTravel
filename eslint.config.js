// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const eslintConfigPrettier = require('eslint-config-prettier');
const simpleImportSort = require('eslint-plugin-simple-import-sort');
const unusedImports = require('eslint-plugin-unused-imports');
const rxjsx = require('eslint-plugin-rxjs-x');
const sonarjs = require('eslint-plugin-sonarjs');

module.exports = tseslint.config(
	{
		ignores: ['.eslintcache', 'dist', 'out-tsc', 'coverage', 'node_modules', '.angular'],
		files: ['**/*.ts'],
		plugins: {
			'simple-import-sort': simpleImportSort,
			'unused-imports': unusedImports,
		},
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: __dirname,
			},
		},
		extends: [
			eslint.configs.recommended,
			...tseslint.configs.recommended,
			...tseslint.configs.recommendedTypeChecked,
			...tseslint.configs.stylisticTypeChecked,
			...angular.configs.tsRecommended,
			rxjsx.configs.recommended,
			sonarjs.configs.recommended,
		],
		processor: angular.processInlineTemplates,
		rules: {
			'@angular-eslint/directive-selector': [
				'error',
				{
					type: 'attribute',
					prefix: 'app',
					style: 'camelCase',
				},
			],
			'@angular-eslint/component-selector': [
				'error',
				{
					type: 'element',
					prefix: 'app',
					style: 'kebab-case',
				},
			],
			'simple-import-sort/imports': [
				'warn',
				{
					groups: [
						['^@angular', '^rxjs', '^zone\\.js'],
						['^@?\\w'],
						['^\\u0000'],
						['^\\.\\.(?!/?$)', '^\\.\\./?$'],
						['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
						['^.+\\.s?css$'],
					],
				},
			],
			'simple-import-sort/exports': 'warn',
			'unused-imports/no-unused-imports': 'error',
			'unused-imports/no-unused-vars': [
				'warn',
				{
					vars: 'all',
					varsIgnorePattern: '^_',
					args: 'after-used',
					argsIgnorePattern: '^_',
				},
			],
		},
	},
	{
		ignores: ['.eslintcache', 'dist', 'out-tsc', 'coverage', 'node_modules', '.angular'],
		files: ['**/*.html'],
		extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
		rules: {},
	},
	eslintConfigPrettier
);
