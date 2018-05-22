module.exports = {
  "plugins": ["vue"],
  "extends": ["google", "plugin:vue/recommended"],
  "rules": {
    "indent": ["error", 2, {"MemberExpression": 0}],
    "no-invalid-this": 0,
    "require-jsdoc": 0,
    "linebreak-style": ["error", "unix"],
    "quotes": ["error", "single"],
    "quote-props": ["error", "as-needed"],
    "semi": ["error", "always"],
    "max-len": 0,
    "brace-style": ["error", "1tbs", { "allowSingleLine": true }],
    "vue/require-prop-types": 0
  },
  "parserOptions": {
    "sourceType": "module"
  }
};
