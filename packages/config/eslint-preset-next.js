module.exports = {
  plugins: ["@typescript-eslint", "prettier", "eslint-comments", "promise", "unicorn"],
  extends: [
    "next/core-web-vitals",
    "airbnb",
    "airbnb-typescript",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "plugin:eslint-comments/recommended",
    "plugin:promise/recommended",
    "plugin:unicorn/recommended",
    "prettier",
  ],
  env: {
    node: true,
    browser: true,
  },
  settings: {
    next: {
      rootDir: ["apps/*", "packages/*"],
    },
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
        project: ["tsconfig.json", "package/tsconfig.json"],
      },
      typescript: {
        alwaysTryTypes: true,
        project: ["tsconfig.json", "package/tsconfig.json"],
      },
    },
  },
  rules: {
    "@next/next/no-html-link-for-pages": "off",
    // Too restrictive, writing ugly code to defend against a very unlikely scenario: https://eslint.org/docs/rules/no-prototype-builtins
    "no-prototype-builtins": "off",
    // https://basarat.gitbooks.io/typescript/docs/tips/defaultIsBad.html
    "import/prefer-default-export": "off",
    "import/no-default-export": "error",
    "import/no-cycle": "off",
    // Use function hoisting to improve code readability
    "no-use-before-define": ["error", { functions: false, classes: true, variables: true }],
    // Allow most functions to rely on type inference. If the function is exported, then `@typescript-eslint/explicit-module-boundary-types` will ensure it's typed.
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-use-before-define": [
      "error",
      {
        functions: false,
        classes: true,
        variables: true,
        typedefs: true,
      },
    ],
    // Uncomment below if using an older version of node. Only works on node version ^16
    // "unicorn/prefer-node-protocol": "off",
    // Common abbreviations are known and readable
    "unicorn/prevent-abbreviations": "off",
    // Airbnb prefers forEach
    "unicorn/no-array-for-each": "off",
    // It's not accurate in the monorepo style
    "import/no-extraneous-dependencies": "off",
    "unicorn/no-null": "off",
    "unicorn/prefer-node-protocol": "off",
    "react/jsx-props-no-spreading": "off",
    "react/react-in-jsx-scope": "off",
    "react/function-component-definition": "off",
    "react/prop-types": "off",
  },
  overrides: [
    {
      files: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
      env: {
        jest: true,
      },
      rules: {
        "@typescript-eslint/no-non-null-assertion": "off",
      },
      extends: ["plugin:testing-library/react", "plugin:jest/recommended"],
    },
    {
      files: ["*.js"],
      rules: {
        // Allow "require()" in JavaScript files.
        "@typescript-eslint/no-var-requires": "off",
        "unicorn/prefer-module": "off",
      },
    },
    {
      files: ["*.{tsx,jsx}"],
      rules: {
        "unicorn/filename-case": "off",
      },
    },
    {
      files: ["**/pages/**/*.{tsx,jsx}"],
      rules: {
        "import/no-default-export": "off",
        "import/prefer-default-export": "error",
      },
    },
    {
      files: ["**/*.stories.{ts,js,tsx,jsx,md,mdx}"],
      rules: {
        "import/no-default-export": "off",
      },
    },
    {
      files: ["*.{ts,js}"],
      rules: {
        "valid-jsdoc": [
          "error",
          {
            requireParamDescription: false,
            requireReturnDescription: false,
            requireReturn: false,
            prefer: { returns: "return" },
          },
        ],
        "require-jsdoc": [
          "error",
          {
            require: {
              ArrowFunctionExpression: true,
              ClassDeclaration: true,
              FunctionDeclaration: true,
              FunctionExpression: true,
              MethodDefinition: true,
            },
          },
        ],
      },
    },
  ],
  ignorePatterns: ["**/.*.js", "**/*.json", "node_modules", ".next", "public"],
};
