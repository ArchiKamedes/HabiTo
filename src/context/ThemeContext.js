import React, { createContext, useState, useContext } from 'react';
import { StatusBar } from 'expo-status-bar';

const spacing = {
  s: 8,
  m: 16,
  l: 24,
  n: -10,
  r: 16,
};

const accessibilitySpacing = {
  s: 12,
  m: 24,
  l: 32,
  n: 0,
  r: 24,
};

const themes = {
  'light-blue': {
    mode: 'light',
    colors: {
      background: '#F5F5F5',
      card: '#FFFFFF',
      text: '#111111',
      primary: '#3391f2',
      active: '#0d316f',
      inactive: '#878787',
      plus: '#F5F5F5',
      text2: '#F5F5F5',
      placeholderText: '#dfdfdfff',
      border: '#E0E0E0', 
    },
    spacing,
  },
  'light-green': {
    mode: 'light',
    colors: {
      background: '#F5F5F5',
      card: '#FFFFFF',
      text: '#111111',
      primary: '#2ecc71',
      active: '#1e8449',
      inactive: '#878787',
      plus: '#F5F5F5',
      text2: '#F5F5F5',
      placeholderText: '#dfdfdfff',
      border: '#E0E0E0',
    },
    spacing,
  },
  'light-purple': {
    mode: 'light',
    colors: {
      background: '#F5F5F5',
      card: '#FFFFFF',
      text: '#111111',
      primary: '#9b59b6',
      active: '#6c3483',
      inactive: '#878787',
      plus: '#F5F5F5',
      text2: '#F5F5F5',
      placeholderText: '#dfdfdfff',
      border: '#E0E0E0',
    },
    spacing,
  },
  'dark-blue': {
    mode: 'dark',
    colors: {
      background: '#121212',
      card: '#1E1E1E',
      text: '#E0E0E0',
      primary: '#3391f2',
      active: '#FFFFFF',
      inactive: '#878787',
      plus: '#1b1b1cff',
      text2: '#F5F5F5',
      placeholderText: '#dfdfdfff',
      border: '#333333',
    },
    spacing,
  },
  'dark-green': {
    mode: 'dark',
    colors: {
      background: '#121212',
      card: '#1E1E1E',
      text: '#E0E0E0',
      primary: '#2ecc71',
      active: '#FFFFFF',
      inactive: '#878787',
      plus: '#1b1b1cff',
      text2: '#F5F5F5',
      placeholderText: '#dfdfdfff',
      border: '#333333',
    },
    spacing,
  },
  'dark-purple': {
    mode: 'dark',
    colors: {
      background: '#121212',
      card: '#1E1E1E',
      text: '#E0E0E0',
      primary: '#9b59b6',
      active: '#FFFFFF',
      inactive: '#878787',
      plus: '#1b1b1cff',
      text2: '#F5F5F5',
      placeholderText: '#dfdfdfff',
      border: '#333333',
    },
    spacing,
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState('light-blue');
  
  // 1. DODANY STAN: Tutaj przechowujemy informację czy tryb jest włączony
  const [isAccessibilityMode, setIsAccessibilityMode] = useState(false);

  const baseTheme = themes[themeName] || themes['light-blue'];

  const theme = {
    ...baseTheme,
    // 2. PRZEKAZANIE DO MOTYWU: Dzięki temu MainTabNavigator to widzi
    isAccessibilityMode, 
    spacing: isAccessibilityMode ? accessibilitySpacing : baseTheme.spacing,
    colors: baseTheme.colors,
  };

  const setTheme = (name) => {
    if (themes[name]) {
      setThemeName(name);
    }
  };

  const toggleAccessibilityMode = (value) => {
    setIsAccessibilityMode(value);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themeName, isAccessibilityMode, toggleAccessibilityMode }}>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);