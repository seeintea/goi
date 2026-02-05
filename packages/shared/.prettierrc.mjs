/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  arrowParens: "always",
  bracketSameLine: false,
  objectWrap: "preserve",
  bracketSpacing: true,
  semi: false,
  experimentalOperatorPosition: "end",
  experimentalTernaries: false,
  singleQuote: false,
  jsxSingleQuote: false,
  quoteProps: "as-needed",
  trailingComma: "all",
  singleAttributePerLine: true,
  htmlWhitespaceSensitivity: "css",
  vueIndentScriptAndStyle: false,
  proseWrap: "preserve",
  insertPragma: false,
  requirePragma: false,
  tabWidth: 2,
  useTabs: false,
  embeddedLanguageFormatting: "auto",
  printWidth: 120,
  plugins: ["@prettier/plugin-oxc"],
  overrides: [
    {
      files: "**/*.{js,mjs,cjs,jsx}",
      options: {
        plugins: ["@prettier/plugin-oxc"],
        parser: "oxc",
      },
    },
    {
      files: "**/*.{ts,mts,cts,tsx}",
      options: {
        plugins: ["@prettier/plugin-oxc"],
        parser: "oxc-ts",
      },
    },
  ],
}

export default config
