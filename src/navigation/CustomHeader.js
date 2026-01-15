import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigationState } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

const CustomHeader = ({ navigation }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const insets = useSafeAreaInsets();
  
  // Bezpieczne pobieranie stanu nawigacji
  const routes = useNavigationState(state => state?.routes || []);
  const index = useNavigationState(state => state?.index || 0);
  
  const currentRoute = routes[index];
  const currentRouteName = currentRoute?.name;

  const isSettingsActive = currentRouteName === 'Settings';

  let isHomeActive = false;
  // POPRAWKA 1: Sprawdzamy 'MainTabs' zamiast 'MainApp'
  if (currentRouteName === 'MainTabs') {
    if (currentRoute.state) {
        const tabIndex = currentRoute.state.index;
        const activeTabName = currentRoute.state.routes[tabIndex].name;
        isHomeActive = activeTabName === 'Home';
    } else {
        // Jeśli stan jest pusty, to znaczy że jesteśmy na ekranie startowym (Home)
        isHomeActive = true; 
    }
  }

  const activeColor = theme.colors.active || theme.colors.primary;
  const inactiveColor = theme.colors.inactive || '#888';
  const iconSize = theme.isAccessibilityMode ? 45 : 26;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
      <TouchableOpacity 
        style={styles.iconButton} 
        // POPRAWKA 2: Nawigujemy do 'MainTabs', a w nim do ekranu 'Home'
        onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })} 
        accessible={true}
        accessibilityLabel="Strona główna"
        accessibilityHint="Przenosi do ekranu głównego z listą nawyków"
        accessibilityRole="button"
      >
        <FontAwesome5 name="home" size={iconSize} color={isHomeActive ? activeColor : inactiveColor} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.iconButton} 
        onPress={() => navigation.navigate('Settings')} 
        accessible={true}
        accessibilityLabel="Ustawienia"
        accessibilityHint="Otwiera ekran ustawień aplikacji"
        accessibilityRole="button"
      >
        <Ionicons name="settings" size={iconSize} color={isSettingsActive ? activeColor : inactiveColor} />
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (theme) => {
  if (theme.isAccessibilityMode) {
    return StyleSheet.create({
      container: {
        position: 'absolute', 
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1, 
        backgroundColor: theme.colors.card,   
        borderColor: theme.colors.text,      
        height: 120, 
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        borderBottomWidth: 6, 
        borderTopColor: 'transparent', 
        borderLeftWidth: 2,
        borderRightWidth: 2,
        flexDirection: 'row',
        justifyContent: 'space-between', 
        alignItems: 'flex-end', 
        paddingHorizontal: 25, 
        paddingBottom: 15, 
      },
      iconButton: {
        padding: 5,
        justifyContent: 'center',
        alignItems: 'center',
        width: 60,
        height: 60,
      },
    });
  }

  return StyleSheet.create({
    container: {
      position: 'absolute', 
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1, 
      backgroundColor: theme.colors.card,   
      borderColor: theme.colors.primary,      
      height: 110, 
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      borderBottomWidth: 3, 
      borderTopColor: 'transparent', 
      borderLeftWidth: 1,
      borderRightWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between', 
      alignItems: 'flex-end', 
      paddingHorizontal: 25, 
      paddingBottom: 15, 
    },
    iconButton: {
      padding: 5,
    },
  });
};

export default CustomHeader;