module.exports = {
  root: true,
  extends: [
    '@react-native-community',
    'plugin:react-native-a11y/all',
  ],
  plugins: ['react-native-a11y'],
  rules: {

    'prettier/prettier': 0,
    'no-trailing-spaces': 0,
    'quotes': 0,
    'jsx-quotes': 0,     
    'react-native/no-inline-styles': 0,
    'comma-dangle': 0,
    'eol-last': 0,
    'semi': 0,
    'curly': 0,                  
    'no-shadow': 0,             
    'no-unused-vars': 0,         
    'react-hooks/exhaustive-deps': 0, 
    'no-undef': 0,                 
  },
};