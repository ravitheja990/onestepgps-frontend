module.exports = {
    env: {
        browser: true,
        node: true,
    },
    extends: [
        "eslint:recommended",
        "plugin:vue/essential",
    ],
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
    },
    globals: {
        google: "readonly", // Declare google as a global variable
    },
    rules: {
        "no-console": "warn",
        "no-debugger": "warn",
    },
};

