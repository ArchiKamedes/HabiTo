import { StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.background, // Tło całego ekranu
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: theme.colors.card, 
    padding: 15,
    borderRadius: 10,
  },
  text: {
    fontSize: 18,
    color: theme.colors.text,
  },
});
