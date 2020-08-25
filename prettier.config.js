module.exports = {
  tabWidth: 2,
  printWidth: 120,
  proseWrap: 'preserve',
  semi: false,
  singleQuote: true,
  quoteProps: 'preserve',
  trailingComma: 'es5',
  arrowParens: 'avoid',
  overrides: [
    {
      files: '{**/.vscode/*.json,**/tsconfig.json,**/tsconfig.*.json}',
      options: {
        parser: 'json5',
        quoteProps: 'preserve',
        singleQuote: false,
        trailingComma: 'all',
      },
    },
  ],
};
