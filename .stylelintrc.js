// .stylelintrc.js
/** @type {import('stylelint').Config} */
module.exports = {
	customSyntax: 'postcss-scss',
	extends: [
		'stylelint-config-standard-scss',
		'stylelint-config-clean-order',
		'stylelint-prettier/recommended',
		'stylelint-config-prettier-scss',
	],
	plugins: ['stylelint-scss', 'stylelint-order'],
	rules: {
		'color-no-invalid-hex': true,
		'declaration-block-no-duplicate-properties': true,
		'block-no-empty': true,
		'no-empty-source': null,
		'prettier/prettier': null,
	},
};
