import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const PlantScreen = () => {
    const { theme } = useTheme(); 
    const styles = getStyles(theme);

  return (
    <View styles={styles.container}>
      <Text style={styles.text}>PlantScreen</Text>
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background, 
  },
  text: {
    fontSize: 24,
    color: theme.colors.text, 
  },
});

export default PlantScreen;