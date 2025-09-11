module.exports = {
	extends: [
		'./node_modules/rocket-boots-eslint/eslint-config.cjs',
	],
	rules: {
		// your custom rules here
		'max-lines': ['error', { max: 2000, skipComments: true }],
		'arrow-body-style': ['off', 'as-needed'],
		// 'no-param-reassign': ['error', { props: false }],
		'no-param-reassign': ['error', { props: false }],
		// 'no-console': [],
		'one-var': ['off'],
		'no-plusplus': ['off'],
		'prefer-template': ['off'],
		'default-param-last': ['off'],
		'no-multi-assign': ['off'],
	},
	parserOptions: {
		ecmaVersion: 2021,
		sourceType: 'module',
	},
};
