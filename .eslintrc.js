module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/essential',
    'eslint:recommended'
  ],
  parserOptions: {
    parser: 'babel-eslint'
  },
  rules: {
    'no-console': process.env.VITE_ENV === 'pro' ? 'warn' : 'off',
    'no-debugger': process.env.VITE_ENV === 'pro' ? 'warn' : 'off'
  }
}
