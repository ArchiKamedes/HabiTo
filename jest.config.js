module.exports = {
  // KLUCZOWE: Używamy czystego React Native, omijając błędy Expo na Windowsie
  preset: 'react-native',
  
  setupFiles: ['./jest.setup.js'],
  
  // To musimy zostawić, żeby biblioteki takie jak Firebase działały
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|firebase|@firebase|three|@react-three)'
  ],
  
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};