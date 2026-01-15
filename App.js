import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore'; // ZMIANA: używamy onSnapshot
import { auth, db } from './src/firebaseConfig';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { ActivityIndicator, View } from 'react-native';

import WelcomeScreen from './src/screens/WelcomeScreen';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import SettingsScreen from './src/screens/SettingsScreen';
import TaskAddScreen from './src/screens/TaskAddScreen';
import HabitAddScreen from './src/screens/HabitAddScreen';

const Stack = createNativeStackNavigator();

// --- NAPRAWIONY KOMPONENT THEMESYNC ---
const ThemeSync = ({ children }) => {
  // Pobieramy też aktualny stan motywu, żeby nie przełączać go w kółko
  const { theme, toggleAccessibilityMode } = useTheme(); 
  const [user, setUser] = useState(null);

  // 1. Nasłuchujemy na logowanie użytkownika (naprawa problemu z null)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return unsubscribe;
  }, []);

  // 2. Nasłuchujemy na zmiany w bazie danych (Real-time)
  useEffect(() => {
    if (!user) return;

    // Używamy onSnapshot zamiast getDoc -> motyw zmieni się od razu po zmianie w ustawieniach
    const unsubFirestore = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const shouldBeBlind = data.isVisuallyImpaired || false;
        
        // Sprawdzamy czy musimy zmienić tryb (zakładając, że w theme masz flagę isAccessibilityMode)
        // Jeśli Twój Context nie udostępnia flagi, po prostu wywołaj toggle z parametrem
        
        // WAŻNE: Upewnij się, że Twoja funkcja toggleAccessibilityMode w ThemeContext
        // potrafi przyjąć parametr true/false (np. setMode(value)).
        // Jeśli działa tylko jako przełącznik (odwraca stan), ten kod trzeba lekko zmienić.
        
        // Zakładam tutaj, że zaktualizowałeś Context lub funkcja przyjmuje argument:
        toggleAccessibilityMode(shouldBeBlind); 
      }
    }, (error) => {
      console.log("Błąd pobierania ustawień motywu:", error);
    });

    return () => unsubFirestore();
  }, [user]); 

  return children;
};

// --- RESZTA KODU BEZ ZMIAN (ROOTNAVIGATOR) ---
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