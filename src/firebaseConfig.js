import { initializeApp } from "firebase/app";
// ZMIANA 1: Importujemy nowe funkcje
import { initializeAuth, getReactNativePersistence } from 'firebase/auth'; 
import { getFirestore } from "firebase/firestore";
// ZMIANA 2: Importujemy AsyncStorage
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Twoja konfiguracja (wklejona z poprzedniego kroku)
const firebaseConfig = {
  apiKey: "AIzaSyAKJU8AQ1lcmqjA1BrRI8dH3ffm5lq_Dns",
  authDomain: "habito-fce25.firebaseapp.com",
  projectId: "habito-fce25",
  storageBucket: "habito-fce25.appspot.com", // Poprawiłem to za Ciebie na poprawny format
  messagingSenderId: "981371045813",
  appId: "1:981371045813:web:a4336c60f9dc62c9527bfc",
  measurementId: "G-WF0SFE8FXX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ZMIANA 3: Inicjalizujemy Auth z 'persistence' (trwałością)
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Eksportujemy bazę danych tak jak wcześniej
export const db = getFirestore(app);
