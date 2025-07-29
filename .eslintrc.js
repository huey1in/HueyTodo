module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    electron: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  globals: {
    // Electron globals
    __dirname: 'readonly',
    __filename: 'readonly',
    
    // Application globals
    dataManager: 'readonly',
    notificationManager: 'readonly',
    i18n: 'readonly'
  },
  rules: {
    // 代码质量
    'no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_' 
    }],
    'no-console': 'off', // 允许console，因为这是桌面应用
    'no-debugger': 'warn',
    'no-alert': 'warn',
    
    // 代码风格
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    
    // 最佳实践
    'eqeqeq': ['error', 'always'],
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    
    // ES6+
    'prefer-const': 'error',
    'no-var': 'error',
    'prefer-arrow-callback': 'warn',
    'arrow-spacing': 'error',
    
    // 函数
    'func-style': ['error', 'declaration', { 
      allowArrowFunctions: true 
    }],
    'no-unused-expressions': 'error',
    
    // 对象和数组
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'comma-dangle': ['error', 'never'],
    
    // 空格和换行
    'space-before-function-paren': ['error', {
      anonymous: 'never',
      named: 'never',
      asyncArrow: 'always'
    }],
    'keyword-spacing': 'error',
    'space-infix-ops': 'error',
    'no-trailing-spaces': 'error',
    'eol-last': 'error'
  }
};
