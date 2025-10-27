import React, { createContext, useState, useContext } from 'react';
import { StatusBar } from 'expo-status-bar';

const lightTheme = {
  mode: 'light',
  colors: {
    background: '#F5F5F5', // Tło ekranów (lekko szare)
    card: '#FFFFFF',       // Tło pasków nawigacji (białe)
    text: '#111111',       // Kolor tekstu
    primary: '#3391f2',    // Twój niebieski blask
    active: '#0d316f',       // Kolor aktywnej ikony
    inactive: '#878787',     // Kolor nieaktywnej ikony
    plus: '#F5F5F5',
  },
  spacing: {
    s: 8,
    m: 16, 
    l: 24,
    n: -10, //negative
  },
};

const darkTheme = {
  mode: 'dark',
  colors: {
    background: '#121212', // Tło ekranów (ciemne)
    card: '#1E1E1E',       // Tło pasków nawigacji (ciemnoszare)
    text: '#E0E0E0',       // Kolor tekstu
    primary: '#3391f2',    // Niebieski blask (zostaje ten sam)
    active: '#FFFFFF',       // Kolor aktywnej ikony (biały)
    inactive: '#878787',     // Kolor nieaktywnej ikony (zostaje)
    plus: '#1b1b1cff', 
  },
  spacing: {
    s: 8,
    m: 16, 
    l: 24,
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} /> 
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);