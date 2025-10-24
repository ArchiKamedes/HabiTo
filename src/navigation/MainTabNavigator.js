import React from 'react';
import { StyleSheet } from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TasksScreen from '../screens/TasksScreen';
import HabitsScreen from '../screens/HabitsScreen';
import PlantScreen from '../screens/PlantScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: styles.myTabBar, 
        tabBarLabelStyle: styles.myLabel, 
        headerShown: false,

        tabBarActiveTintColor: 'tomato', 
        tabBarInactiveTintColor: 'gray',   
        
        tabBarIcon: ({ focused, color, size }) => {

          if (route.name === 'Tasks') {
            return <FontAwesome5 name='tasks' size={size} color={color} />;
          } 
          
          else if (route.name === 'Habits') {
            return <MaterialCommunityIcons name='head-heart-outline' size={size} color={color} />;
          } 
          
          else if (route.name === 'Plant') {
            return <FontAwesome5 name='seedling' size={size} color={color} />;
          } 
          
          else if (route.name === 'Settings') {
            return <Ionicons name='settings' size={size} color={color} />;
          }
        },
      })}
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

const styles = StyleSheet.create({
  myTabBar: {
    position: 'absolute', 

    backgroundColor: '#FFFFFF',
    height: 85,
    paddingBottom: 10,
    elevation: 5,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,

    borderTopWidth: 3, // Grubość blasku
    borderTopColor: '#3391f2', // Twój kolor
    
    // Musimy też dodać ramki po bokach, inaczej będzie ucięte
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#3391f2', // Ten sam kolor
  },

  myLabel: {
    fontSize: 12,
    fontWeight: '600',
  }
});

export default MainTabNavigator;