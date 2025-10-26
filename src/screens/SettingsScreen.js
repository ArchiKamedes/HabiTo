import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useTheme } from '../context/ThemeContext'; // <-- Importujemy motyw
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const SettingsScreen = () => {
  // Pobieramy motyw ORAZ funkcję do jego zmiany
  const { theme, toggleTheme } = useTheme(); 
  const styles = getStyles(theme);
  const insets = useSafeAreaInsets();
  
  const isDarkMode = theme.mode === 'dark';

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <Text style={styles.title}>Ustawienia</Text>
      
      <View style={styles.row}>
        <Text style={styles.text}>Tryb Ciemny</Text>
        <Switch
            value={isDarkMode}
            onValueChange={toggleTheme} // <-- Przełącznik!
            thumbColor={isDarkMode ? theme.colors.primary : "#f4f3f4"}
            trackColor={{ false: "#767577", true: theme.colors.primary }}
        />
      </View>
      
    </View>
  );
};

// Funkcja generująca style
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
    backgroundColor: theme.colors.card, // Tło wiersza
    padding: 15,
    borderRadius: 10,
  },
  text: {
    fontSize: 18,
    color: theme.colors.text,
  },
});

export default SettingsScreen;