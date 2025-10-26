import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { auth } from './src/firebaseConfig'; // Ścieżka do skopiowanego pliku
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import RootStack from './src/navigation/RootStack';
import { ThemeProvider } from './src/context/ThemeContext';

export default function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

return (
    <ThemeProvider>
      <NavigationContainer>
        <RootStack />
      </NavigationContainer>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});