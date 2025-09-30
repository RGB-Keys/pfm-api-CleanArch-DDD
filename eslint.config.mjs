import js from '@eslint/js'
import prettier from 'eslint-plugin-prettier'
import tseslint from 'typescript-eslint'

export default tseslint.config(
	js.configs.recommended,
	...tseslint.configs.recommended,

	{
		files: ['**/*.ts'],
		ignores: [
			'vite.config.ts',
			'.eslintrc.js',
			'build',
			'dist',
			'node_modules',
		],
		plugins: {
			prettier,
		},
		languageOptions: {
			parserOptions: {
				project: ['./tsconfig.json'],
			},
		},
		rules: {
			'prettier/prettier': 'error',
			'@typescript-eslint/no-unused-vars': ['error', {
				args: 'all',
				argsIgnorePattern: '^_',
				caughtErrors: 'all',
				caughtErrorsIgnorePattern: '^_',
				destructuredArrayIgnorePattern: '^_',
				varsIgnorePattern: '^_',
				ignoreRestSiblings: true,
			}],
		},
	},
)
