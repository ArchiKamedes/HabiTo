module.exports = {
  root: true,
  extends: [
    '@react-native-community', // Standardowe reguły React Native
    'plugin:react-native-a11y/all', // Twoje nowe reguły dostępności
  ],
  plugins: ['react-native-a11y'],
};