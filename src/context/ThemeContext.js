import React, { createContext, useState, useContext } from 'react';
import { StatusBar } from 'expo-status-bar';

const spacing = {
  s: 8,
  m: 16,
  l: 24,
  n: -10,
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
    },
    spacing,
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState('light-blue');

  const theme = themes[themeName];

  const setTheme = (name) => {
    if (themes[name]) {
      setThemeName(name);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themeName }}>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);