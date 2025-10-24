import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TasksScreen from '../screens/TasksScreen';
import HabitsScreen from '../screens/HabitsScreen';
import PlantScreen from '../screens/PlantScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen 
        name="Tasks" 
        component={TasksScreen} 
        options={{ title: 'Tasks' }} 
      />
      <Tab.Screen 
        name="Habits" 
        component={HabitsScreen} 
        options={{ title: 'Habits' }} 
      />
      <Tab.Screen 
        name="Plant" 
        component={PlantScreen} 
        options={{ title: 'Plant' }} 
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: 'Ustawienia' }} 
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;