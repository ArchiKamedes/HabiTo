import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { signInAnonymously } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { signOut } from 'firebase/auth';

const WelcomeScreen = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = getStyles(theme);

  const handleLogout = () => {
  signOut(auth).catch(error => console.log('Error logging out: ', error));};

  const [name, setName] = useState('');
  const [isVisuallyImpaired, setIsVisuallyImpaired] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (name.trim() === '') {
      Alert.alert('Błąd', 'Proszę podać swoje imię.');
      return;
    }
    if (isVisuallyImpaired === null) {
      Alert.alert('Błąd', 'Proszę zaznaczyć odpowiedź dotyczącą widoczności.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        name: name.trim(),
        isVisuallyImpaired: isVisuallyImpaired,
        createdAt: serverTimestamp(),
        isAnonymous: true
      });

    } catch (error) {
      console.error(error);
      Alert.alert('Błąd', 'Nie udało się utworzyć profilu. Sprawdź połączenie z internetem.');
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="leaf" size={60} color={theme.colors.primary} />
        </View>
        
        <Text 
          style={styles.title}
          accessible={true}
          accessibilityRole="header"
        >
          Witaj w Aplikacji
        </Text>
        
        <Text style={styles.subtitle} accessible={true}>
          Skonfigurujmy Twój profil, aby dostosować aplikację do Twoich potrzeb.
        </Text>

        <View style={styles.formGroup}>
          <Text style={styles.label} accessible={true}>Jak masz na imię?</Text>
          <TextInput
            style={styles.input}
            placeholder="Wpisz imię..."
            placeholderTextColor={theme.colors.inactive}
            value={name}
            onChangeText={setName}
            accessible={true}
            accessibilityLabel="Pole tekstowe: wpisz swoje imię"
          />
        </View>

        <View style={styles.formGroup}>
          <Text 
            style={styles.label} 
            accessible={true}
            accessibilityLabel="Pytanie: Czy jesteś osobą niewidomą lub słabowidzącą?"
          >
            Czy jesteś osobą niewidomą lub słabowidzącą?
          </Text>
          
          <View style={styles.row}>
            <TouchableOpacity
              style={[
                styles.optionButton, 
                isVisuallyImpaired === true && styles.optionButtonSelected
              ]}
              onPress={() => setIsVisuallyImpaired(true)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Tak, jestem osobą z utrudnieniem widzenia"
              accessibilityState={{ selected: isVisuallyImpaired === true }}
            >
              <Text style={[
                styles.optionText, 
                isVisuallyImpaired === true && styles.optionTextSelected
              ]}>TAK</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionButton, 
                isVisuallyImpaired === false && styles.optionButtonSelected
              ]}
              onPress={() => setIsVisuallyImpaired(false)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Nie, nie mam problemów z widzeniem"
              accessibilityState={{ selected: isVisuallyImpaired === false }}
            >
              <Text style={[
                styles.optionText, 
                isVisuallyImpaired === false && styles.optionTextSelected
              ]}>NIE</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleStart}
          disabled={loading}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={loading ? "Tworzenie konta, proszę czekać" : "Rozpocznij korzystanie z aplikacji"}
          accessibilityHint="Zapisuje twoje dane i przechodzi do ekranu głównego"
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>Rozpocznij</Text>
          )}
        </TouchableOpacity>

      </View>
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontFamily: 'TitilliumWeb_700Bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'TitilliumWeb_400Regular',
    color: theme.colors.inactive,
    textAlign: 'center',
    marginBottom: 40,
  },
  formGroup: {
    marginBottom: 30,
  },
  label: {
    fontSize: 18,
    fontFamily: 'TitilliumWeb_700Bold',
    color: theme.colors.text,
    marginBottom: 15,
  },
  input: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 15,
    fontSize: 18,
    color: theme.colors.text,
    fontFamily: 'TitilliumWeb_400Regular',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionButton: {
    flex: 0.48,
    backgroundColor: theme.colors.card,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  optionButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  optionText: {
    fontSize: 18,
    fontFamily: 'TitilliumWeb_700Bold',
    color: theme.colors.text,
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
    elevation: 5,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'TitilliumWeb_700Bold',
  },
});

export default WelcomeScreen;