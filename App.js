import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './src/firebaseConfig';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { ActivityIndicator, View } from 'react-native';

import WelcomeScreen from './src/screens/WelcomeScreen';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import SettingsScreen from './src/screens/SettingsScreen';
import TaskAddScreen from './src/screens/TaskAddScreen';
import HabitAddScreen from './src/screens/HabitAddScreen';

const Stack = createNativeStackNavigator();

const ThemeSync = ({ children }) => {
  const { toggleAccessibilityMode } = useTheme();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUserSettings = async () => {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.isVisuallyImpaired) {
              toggleAccessibilityMode(true);
            } else {
              toggleAccessibilityMode(false);
            }
          }
        } catch (error) {
          console.log(error);
        }
      }
    };
    fetchUserSettings();
  }, [user]);

  return children;
};

const RootNavigator = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }}>
        {user ? (
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="TaskAdd" component={TaskAddScreen} />
            <Stack.Screen name="HabitAdd" component={HabitAddScreen} />
          </>
        ) : (
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <ThemeSync>
        <RootNavigator />
      </ThemeSync>
    </ThemeProvider>
  );
}