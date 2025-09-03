module.exports = {
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:import/recommended',
    'plugin:jsdoc/recommended',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['import', 'jsdoc', 'prettier'],
  rules: {
    // Prettier integration
    'prettier/prettier': 'error',
    
    // Code quality
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'error',
    
    // Import rules
    'import/no-unresolved': 'off', // For vanilla JS
    'import/extensions': 'off',
    
    // JSDoc rules
    'jsdoc/require-jsdoc': [
      'warn',
      {
        publicOnly: true,
        require: {
          FunctionDeclaration: true,
          MethodDefinition: true,
          ClassDeclaration: true,
        },
      },
    ],
    'jsdoc/require-param-description': 'off',
    'jsdoc/require-returns-description': 'off',
    'jsdoc/require-param-type': 'off',
    'jsdoc/require-returns': 'off',
    
    // Best practices
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    
    // Performance
    'no-loop-func': 'error',
    'no-new-object': 'error',
    
    // Readability
    'max-len': ['warn', { code: 120, ignoreUrls: true }],
    'max-lines-per-function': ['warn', { max: 80, skipBlankLines: true }],
    'complexity': ['warn', 15],
  },
  overrides: [
    {
      files: ['frontend/modern-app.js'],
      env: {
        browser: true,
        es2022: true,
      },
      globals: {
        L: 'readonly', // Leaflet
        Chart: 'readonly', // Chart.js
      },
      rules: {
        'max-lines-per-function': 'off', // Allow longer functions for main app
        'complexity': 'off', // Allow complex logic for main app
      },
    },
    {
      files: ['frontend/**/*.js'],
      env: {
        browser: true,
        es2022: true,
      },
      globals: {
        L: 'readonly', // Leaflet
        Chart: 'readonly', // Chart.js
        CONFIG: 'readonly', // Config object
      },
    },
    {
      files: ['backend/**/*.js'],
      env: {
        node: true,
        es2022: true,
      },
      rules: {
        'max-lines-per-function': 'off', // Allow longer functions for backend
        'complexity': 'off', // Allow complex logic for backend
      },
    },
  ],
};
