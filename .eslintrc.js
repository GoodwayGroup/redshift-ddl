module.exports = {
    "extends": "goodway/node",
    "env": {
        "es6": true
    },
    "parserOptions": {
        "sourceType": "module"
    },
    "rules": {
        "max-len": ["warn", {
            "code": 160,
            "ignoreUrls": true,
            "ignoreComments": false,
            "ignoreRegExpLiterals": true,
            "ignoreStrings": true,
            "ignoreTemplateLiterals": true,
            "ignoreTrailingComments": true
        }],
        "no-restricted-syntax": ["error", "ForInStatement", "LabeledStatement", "WithStatement"]
    }
};
