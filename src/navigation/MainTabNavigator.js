import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TasksScreen from '../screens/TasksScreen';
import HabitsScreen from '../screens/HabitsScreen';
import PlantScreen from '../screens/PlantScreen';
import CalendarScreen from '../screens/CalendarScreen';
import CustomHeader from '../navigation/CustomHeader';
import HomeScreen from '../screens/HomeScreen';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  
  return (
    <View style={{ flex: 1 }}>  
      <CustomHeader />

    <Tab.Navigator
      initialRouteName="HomeScreen"
      screenOptions={({ route }) => ({
        tabBarStyle: styles.myTabBar, 
        tabBarLabelStyle: styles.myLabel, 
        headerShown: false,

        tabBarActiveTintColor: '#0d316f', 
        tabBarInactiveTintColor: '#878787',   
        
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
          
          else if (route.name === 'Calendar') {
            return <FontAwesome5 name='calendar-alt' size={size} color={color} />;
          }
        },
      })}
    >
      <Tab.Screen name="Tasks" component={TasksScreen} options={{ title: 'Tasks' }} />
      <Tab.Screen name="Habits" component={HabitsScreen} options={{ title: 'Habits' }} />
      <Tab.Screen name="Plant" component={PlantScreen} options={{ title: 'Plant' }} />
      <Tab.Screen name="Calendar" component={CalendarScreen} options={{ title: 'Calendar' }} />
    </Tab.Navigator>
    </View>
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

    borderTopWidth: 4,
    borderTopColor: '#3391f2', 

    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#3391f2', 
  },

  myLabel: {
    fontSize: 12,
    fontWeight: '600',
  }
});

export default MainTabNavigator;