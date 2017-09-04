module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    // "extends": "eslint:recommended",
    "plugins": [
      "html",
      "vue"
    ],
    "extends": "google",
    "rules": {
        "indent": [1, 4, {"MemberExpression": 0}
        ],
        "no-invalid-this": 0,
        "require-jsdoc": 0,
        "linebreak-style": ["error", "unix"],
        "quotes": ["error", "single"],
        "quote-props": ["error", "always"],
        "semi": ["error", "always"],
        "max-len": 0,
        "brace-style": ["error", "1tbs", { "allowSingleLine": true }]
    },
    "parserOptions": {
        "sourceType": "module"
    }
};
