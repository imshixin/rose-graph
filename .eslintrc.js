/*
 * @Author: imsixn
 * @Date: 2022-04-26 10:16:40
 * @LastEditors: imsixn
 * @LastEditTime: 2022-04-30 21:41:06
 * @Description: file content
 */
module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-unused-vars':1
  }
}
