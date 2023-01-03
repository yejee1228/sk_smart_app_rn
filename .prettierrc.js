module.exports = {
  bracketSpacing: false,
  jsxBracketSameLine: true,
  singleQuote: true,
  trailingComma: 'all',
  arrowParens: 'avoid',
  'prettier/prettier': [
    'error',
    {singleQuote: true, parser: 'flow', endOfLine: 'auto'},
  ],
};
