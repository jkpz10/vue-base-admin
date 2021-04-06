module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: 'vuetify',
  rules: {
    indent: ['error', 2],
    'no-console': 'off',
    'no-debugger': 'off',
    'vuetify/grid-unknown-attributes': 'off',
    'vue/max-attributes-per-line': 'off',
    'vue/script-indent': ['error', 2, {
      baseIndent: 0,
      switchCase: 0,
      ignores: [],
    }],
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
}
