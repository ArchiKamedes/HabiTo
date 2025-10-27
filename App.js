import 'react-native-gesture-handler';
import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { auth } from './src/firebaseConfig'; // Ścieżka do skopiowanego pliku
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import RootStack from './src/navigation/RootStack';
import { ThemeProvider } from './src/context/ThemeContext';
import { useFonts, TitilliumWeb_400Regular, TitilliumWeb_700Bold } from '@expo-google-fonts/titillium-web'; // <-- 1. Import
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  let [fontsLoaded, fontError] = useFonts({
    TitilliumWeb_400Regular, // Wersja zwykła
    TitilliumWeb_700Bold,   // Wersja pogrubiona
  });

  const onLayoutRootView = useCallback(async () => {
    // Hide splash screen only when BOTH fonts are loaded AND Firebase is ready
    if ((fontsLoaded || fontError) && !isLoading) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, isLoading]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        signInAnonymously(auth).catch((error) => {
          console.error("Błąd logowania anonimowego:", error);
        });
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []); 

  if ((!fontsLoaded && !fontError) || isLoading) {
    return null;
  }

return (
  <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
    <ThemeProvider>
      <NavigationContainer>
        <RootStack />
      </NavigationContainer>
    </ThemeProvider>
  </View>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});