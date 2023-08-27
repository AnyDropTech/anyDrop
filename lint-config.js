const fs = require('node:fs')
const path = require('node:path')

const packages = fs.readdirSync(path.resolve(__dirname, 'packages'))

module.exports = {
  parserPreset: {
    parserOpts: {
      headerPattern:
        /^(?<type>.*\s\w*)(?:\((?<scope>.*)\))?!?:\s(?<subject>(?:(?!#).)*(?:(?!\s).))$/,
      headerCorrespondence: ['type', 'subject'],
    },
  },
  rules: {
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [2, 'always'],
    'header-max-length': [2, 'always', 72],
    'scope-case': [2, 'always', 'lower-case'],
    'scope-enum': [
      2,
      'always',
      ['other', ...packages],
    ],
    'subject-case': [
      2,
      'never',
      ['sentence-case', 'start-case', 'pascal-case', 'upper-case'],
    ],
    'subject-empty': [2, 'never'],
    'subject-exclamation-mark': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'type-enum': [
      2,
      'always',
      [
        '🎉 init',
        '✨ feat',
        '🐛 fix',
        '💄 ui',
        '🌈 style',
        '📝 docs',
        '🦄 refactor',
        '🎈 perf',
        '🔖 release',
        '✅ test',
        '🌐 i18n',
        '💩 poo',
        '🍱 assets',
        '🐳 docker',
        '🔧 chore',
        '⏪ revert',
        '👷 build',
      ],
    ],
  },
}
