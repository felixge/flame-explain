module.exports = {
  tabWidth: 4,
  printWidth: 120,
  proseWrap: "preserve",
  semi: false,
  quoteProps: "preserve",
  trailingComma: "es5",
  arrowParens: "avoid",
  overrides: [
    {
      files: "{*.js?(on),*.y?(a)ml,.*.js?(on),.*.y?(a)ml,*.md,.prettierrc,.stylelintrc,.babelrc}",
      options: {
        tabWidth: 2,
      },
    },
    {
      files: "{**/.vscode/*.json,**/tsconfig.json,**/tsconfig.*.json}",
      options: {
        parser: "json5",
        quoteProps: "preserve",
        singleQuote: false,
        trailingComma: "all",
      },
    },
  ],
}
