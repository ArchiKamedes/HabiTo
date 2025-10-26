import React, { createContext, useState, useContext } from 'react';
import { StatusBar } from 'expo-status-bar';

// --- 1. Definicje naszych motywów ---
// Wyciągnąłem kolory, o które prosiłaś
const lightTheme = {
  mode: 'light',
  colors: {
    background: '#F5F5F5', // Tło ekranów (lekko szare)
    card: '#FFFFFF',       // Tło pasków nawigacji (białe)
    text: '#111111',       // Kolor tekstu
    primary: '#3391f2',    // Twój niebieski blask
    active: '#0d316f',       // Kolor aktywnej ikony
    inactive: '#878787',     // Kolor nieaktywnej ikony
  },
  spacing: {
    s: 8,
    m: 16, // <-- I że 'm' jest tutaj
    l: 24,
  },
};

// Stwórzmy też od razu tryb ciemny
const darkTheme = {
  mode: 'dark',
  colors: {
    background: '#121212', // Tło ekranów (ciemne)
    card: '#1E1E1E',       // Tło pasków nawigacji (ciemnoszare)
    text: '#E0E0E0',       // Kolor tekstu
    primary: '#3391f2',    // Niebieski blask (zostaje ten sam)
    active: '#FFFFFF',       // Kolor aktywnej ikony (biały)
    inactive: '#878787',     // Kolor nieaktywnej ikony (zostaje)
  },
  spacing: {
    s: 8,
    m: 16, // <-- I że 'm' jest tutaj
    l: 24,
  },
};

// --- 2. Stworzenie Kontekstu ---
const ThemeContext = createContext();

// --- 3. Stworzenie "Dostawcy" (Providera) ---
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Funkcja do przełączania motywu
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  // Wybór aktywnego motywu
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {/* Automatycznie zmienia kolor zegara i baterii na górze */}
      <StatusBar style={isDarkMode ? 'light' : 'dark'} /> 
      {children}
    </ThemeContext.Provider>
  );
};

// --- 4. Stworzenie "Haka" (Hook) do łatwego użycia ---
export const useTheme = () => useContext(ThemeContext);