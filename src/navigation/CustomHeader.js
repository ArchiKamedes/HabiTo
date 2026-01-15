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
  const rootState = useNavigationState(state => state);

  const rootRoute = rootState.routes[rootState.index];
  const isSettingsActive = rootRoute.name === 'Settings';

  let isHomeActive = false;
  if (rootRoute.name === 'MainApp' && rootRoute.state) {
    const tabState = rootRoute.state;
    const activeTabName = tabState.routes[tabState.index].name;
    isHomeActive = activeTabName === 'Home';
  }

  const activeColor = theme.colors.active; 
  const inactiveColor = theme.colors.inactive;
  const iconSize = theme.isAccessibilityMode ? 45 : 26;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
      <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('MainApp', { screen: 'Home' })}>
      <FontAwesome5 name="home" size={iconSize} color={isHomeActive ? activeColor : inactiveColor} />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Settings')} >
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