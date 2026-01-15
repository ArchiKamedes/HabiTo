// jest.setup.js
jest.mock('@expo/vector-icons', () => ({
  FontAwesome5: '',
  Ionicons: '',
  Feather: '',
}));

module.exports = {}; // Dodaj to na końcu, żeby plik był poprawnym modułem