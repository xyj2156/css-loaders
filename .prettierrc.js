export default {
  // CSS 相关配置
  singleQuote: true,
  semi: true,
  tabWidth: 2,
  useTabs: false,
  trailingComma: 'all',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
  endOfLine: 'lf',
  // CSS 特定配置
  overrides: [
    {
      files: '*.css',
      options: {
        parser: 'css',
        singleQuote: true,
        tabWidth: 2,
        printWidth: 100,
        singleAttributePerLine: true,
      },
    },
    {
      files: '*.scss',
      options: {
        parser: 'scss',
        singleQuote: true,
        tabWidth: 2,
        printWidth: 100,
        singleAttributePerLine: true,
      },
    },
  ],
};
