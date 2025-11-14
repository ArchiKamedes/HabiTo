import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MainTabNavigator from './MainTabNavigator';
import FocusScreen from '../screens/FocusScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TaskAddScreen from '../screens/TaskAddScreen';

const Stack = createStackNavigator();

const RootStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainApp"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Focus"
        component={FocusScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerShown: false }} 
      />

      <Stack.Screen 
        name="TaskAdd" 
        component={TaskAddScreen}
        options={{ presentation: 'modal' }} // To sprawi, że wysunie się od dołu
      />
    </Stack.Navigator>
  );

  
};

export default RootStack;