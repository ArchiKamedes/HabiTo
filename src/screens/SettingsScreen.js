import React from 'react';
import { View, Text, Switch } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getStyles } from '../styles/SettingsScreen.styles';


const SettingsScreen = () => {
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
export default SettingsScreen;