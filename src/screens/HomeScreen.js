import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const HomeScreen = () => {
    const { theme } = useTheme(); 
    const styles = getStyles(theme);
  return (
    <View style={styles.container}>
      <Text style={styles.text}>HomeScreen Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  text: {
    fontSize: 24,
  },
});

export default HomeScreen;