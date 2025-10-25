import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigationState, useRoute } from '@react-navigation/native';
import SettingsScreen from '../screens/SettingsScreen';
import HomeScreen from '../screens/HomeScreen';

const CustomHeader = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const rootState = useNavigationState(state => state);

  const isSettingsActive = rootState.routes[rootState.index].name === 'Settings';
  const isHomeActive = route.name === 'Home';

  const activeColor = '#0d316f'; 
  const inactiveColor = '#878787'; 

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      

      <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Home')} >
      <FontAwesome5 name="home" size={26} color={isHomeActive ? activeColor : inactiveColor} />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Settings')} >
        <Ionicons name="settings" size={26} color={isSettingsActive ? activeColor : inactiveColor} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute', 
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1, 

    backgroundColor: 'white',
    height: 110, 
    

    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,

    borderBottomWidth: 3, 
    borderTopColor: 'transparent',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#3391f2', 

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

export default CustomHeader;