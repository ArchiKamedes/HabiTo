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
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();

const MainTabNavigator = ({ navigation }) => {
  const { theme } = useTheme(); 
  const styles = getStyles(theme);
  
  return (
    <View style={{ flex: 1 }}>  

      <CustomHeader navigation={navigation} />

    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarStyle: styles.myTabBar, 
        tabBarLabelStyle: styles.myLabel, 
        headerShown: false,
        
        tabBarShowLabel: !theme.isAccessibilityMode,

        tabBarActiveTintColor: theme.colors.active, 
        tabBarInactiveTintColor: theme.colors.inactive,

        tabBarIconStyle: theme.isAccessibilityMode ? { width: 60, height: 60 } : undefined,
        tabBarItemStyle: theme.isAccessibilityMode ? { justifyContent: 'center', alignItems: 'center' } : undefined,
        
        tabBarIcon: ({ focused, color, size }) => {
          const customSize = theme.isAccessibilityMode ? 45 : size;

          if (route.name === 'Tasks') {
            return <FontAwesome5 name='tasks' size={customSize} color={color} />;
          } 
          
          else if (route.name === 'Habits') {
            return <MaterialCommunityIcons name='head-heart-outline' size={customSize} color={color} />;
          } 
          
          else if (route.name === 'Plant') {
            return <FontAwesome5 name='seedling' size={customSize} color={color} />;
          } 
          
          else if (route.name === 'Calendar') {
            return <FontAwesome5 name='calendar-alt' size={customSize} color={color} />;
          }
        },
      })}
    >
      <Tab.Screen name="Tasks" component={TasksScreen} options={{ title: 'Tasks' }} />
      <Tab.Screen name="Habits" component={HabitsScreen} options={{ title: 'Habits' }} />
      <Tab.Screen name="Plant" component={PlantScreen} options={{ title: 'Plant' }} />
      <Tab.Screen name="Calendar" component={CalendarScreen} options={{ title: 'Calendar' }} />

      <Tab.Screen name="Home" component={HomeScreen} options={{tabBarButton: () => null, tabBarItemStyle: { display: 'none' }}} />
    </Tab.Navigator>
    </View>
  );
};

const getStyles = (theme) => {
  if (theme.isAccessibilityMode) {
    return StyleSheet.create({
      myTabBar: {
        position: 'absolute', 
        backgroundColor: theme.colors.card, 
        
        borderColor: theme.colors.text, 
        borderTopColor: theme.colors.text,

        height: 100, 
        paddingBottom: 0, 
        paddingTop: 0,
        elevation: 0,

        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderTopWidth: 6, 

        borderLeftWidth: 2,
        borderRightWidth: 2,
      },
      myLabel: {
        fontSize: 0, 
      }
    });
  }

  return StyleSheet.create({
    myTabBar: {
      position: 'absolute', 

      backgroundColor: theme.colors.card, 
      borderColor: theme.colors.primary, 
      borderTopColor: theme.colors.primary,

      height: 85,
      paddingBottom: 10,
      elevation: 5,

      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      borderTopWidth: 4,

      borderLeftWidth: 1,
      borderRightWidth: 1,
    },

    myLabel: {
      fontSize: 12,
      fontWeight: '600',
    }
  });
};

export default MainTabNavigator;