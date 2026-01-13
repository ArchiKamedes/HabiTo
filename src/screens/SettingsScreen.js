import React from 'react';
import { View, Text, Switch, TouchableOpacity, Pressable } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getStyles } from '../styles/SettingsScreen.styles';
import { Ionicons } from '@expo/vector-icons';

const SettingsScreen = ({ navigation }) => {
  const { theme, setTheme, themeName } = useTheme();
  const styles = getStyles(theme);
  const insets = useSafeAreaInsets();

  const currentMode = themeName.split('-')[0];
  const currentColor = themeName.split('-')[1];
  const isDarkMode = currentMode === 'dark';

  const handleModeChange = (value) => {
    const newMode = value ? 'dark' : 'light';
    setTheme(`${newMode}-${currentColor}`);
  };

  const handleColorChange = (color) => {
    setTheme(`${currentMode}-${color}`);
  };

  const colorOptions = [
    { key: 'blue', color: '#3391f2', label: 'Niebieski' },
    { key: 'green', color: '#2ecc71', label: 'Zielony' },
    { key: 'purple', color: '#9b59b6', label: 'Fioletowy' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
          accessible={true}
          accessibilityLabel="Wróć"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Ustawienia</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Wygląd</Text>
        
        <View style={styles.row}>
          <Text style={styles.text}>Tryb Ciemny</Text>
          <Switch
            value={isDarkMode}
            onValueChange={handleModeChange}
            thumbColor={isDarkMode ? theme.colors.primary : "#f4f3f4"}
            trackColor={{ false: "#767577", true: theme.colors.primary }}
          />
        </View>

        <Text style={[styles.text, { marginTop: 20, marginBottom: 10 }]}>Kolor wiodący</Text>
        <View style={styles.colorsContainer}>
          {colorOptions.map((option) => (
            <Pressable
              key={option.key}
              onPress={() => handleColorChange(option.key)}
              style={[
                styles.colorCircle,
                { backgroundColor: option.color },
                currentColor === option.key && styles.selectedColor
              ]}
              accessible={true}
              accessibilityLabel={`Wybierz kolor ${option.label}`}
              accessibilityState={{ selected: currentColor === option.key }}
              accessibilityRole="button"
            >
              {currentColor === option.key && (
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              )}
            </Pressable>
          ))}
        </View>
      </View>
      
    </View>
  );
};
export default SettingsScreen;