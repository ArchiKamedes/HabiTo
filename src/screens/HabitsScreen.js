import React, { useState, useEffect, useMemo } from 'react'; // 1. Dodajemy useMemo
import { View, Text, StyleSheet, ScrollView, Pressable, FlatList, Alert } from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import AddFolderModal from '../components/AddFolderModal';
import HabitItem from '../components/HabitItem'; // Upewnij się, że masz poprawny HabitItem

// 2. Importujemy narzędzia Firebase (w tym 'setDoc' do zapisywania postępów)
import { db, auth } from '../firebaseConfig';
import { collection, query, onSnapshot, doc, setDoc, orderBy } from 'firebase/firestore';

// 3. Definicja jak będziemy zapisywać postęp
// Chcemy zapisywać postęp dla KAŻDEJ kopii nawyku osobno
// Kluczem będzie dokument na dany dzień, np. "2025-11-16"
// Wewnątrz niego będą pola, np. "habitID_0: true", "habitID_1: true"
const getTodayDateString = (date) => {
  return date.toISOString().split('T')[0]; // "2025-11-16"
};

const HabitsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme(); 
  const styles = getStyles(theme);
  const user = auth.currentUser;
  
  const today = new Date();
  const todayDayID = today.getDay(); // Dziś (Niedziela = 0, Poniedziałek = 1, ...)
  const todayDateString = getTodayDateString(today); // Dzisiejsza data jako string
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowDateString = getTodayDateString(tomorrow);
  
  // --- Stany ---
  const [isFolderModalVisible, setIsFolderModalVisible] = useState(false);
  
  // 4. Poprawione stany
  const [rawHabits, setRawHabits] = useState([]); // Przechowuje "definicje" nawyków
  const [completions, setCompletions] = useState({}); // Przechowuje statusy wykonania na dziś

  // --- 5. Pobieranie DEFINICJI nawyków ---
  useEffect(() => {
    if (!user) return; 
    const habitsCollectionRef = collection(db, 'users', user.uid, 'habits');
    const q = query(habitsCollectionRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const habitsData = [];
      querySnapshot.forEach((doc) => {
        habitsData.push({ ...doc.data(), id: doc.id });
      });
      setRawHabits(habitsData); // Używamy setRawHabits
    });

    return () => unsubscribe();
  }, [user]);

  // --- 6. Pobieranie POSTĘPÓW na dziś ---
  useEffect(() => {
    if (!user) return;
    // Ścieżka do dokumentu przechowującego postępy z dzisiejszego dnia
    const docRef = doc(db, 'users', user.uid, 'habitCompletions', todayDateString);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setCompletions(docSnap.data()); // Np. { "habitID_0": true, "habitID_1": false }
      } else {
        setCompletions({}); // Jeśli nie ma dokumentu, nie ma postępów
      }
    });
    return () => unsubscribe();
  }, [user, todayDateString]); // Uruchom ponownie, jeśli zmieni się dzień

  // --- 7. Logika "Eksplodowania" (kopiowania) nawyków ---
  // Używamy useMemo, aby ta skomplikowana logika nie uruchamiała się przy każdym renderze
  const displayableItems = useMemo(() => {
    const todayItems = [];

    for (const habit of rawHabits) {
      // 1. Sprawdź, czy nawyk jest aktywny dzisiaj
      let isActiveToday = false;
      if (habit.repeatMode === 'Codziennie') {
        isActiveToday = true;
      } else if (habit.repeatMode === 'Co X dni') {
        // (Uproszczona logika, wymagałaby daty startowej)
        isActiveToday = true; // Na razie zakładamy, że tak
      } else if (habit.repeatMode === 'Wybierz dni') {
        if (habit.selectedWeekdays && habit.selectedWeekdays.includes(todayDayID)) {
          isActiveToday = true;
        }
      }

      if (!isActiveToday) continue; // Pomiń ten nawyk, nie jest na dziś

      // 2. Znajdź odpowiednie godziny
      let timesToRender = [];
      if (habit.timeMode === 'Taka sama godzina' && habit.notificationTimes) {
        // notificationTimes to tablica [Timestamp(12:30), Timestamp(15:30)]
        timesToRender = habit.notificationTimes; 
      } else if (habit.timeMode === 'Różne godziny' && habit.notificationTimes[todayDayID]) {
        // notificationTimes to obiekt { 1: [Timestamp(...)], 3: [Timestamp(...)] }
        timesToRender = habit.notificationTimes[todayDayID];
      }
      
      // 3. "Eksploduj" (skopiuj) nawyk dla każdej godziny
      timesToRender.forEach((time, index) => {
        // Unikalne ID dla tego bloku czasu (np. "habitID_0", "habitID_1")
        const completionId = `${habit.id}_${index}`; 
        
        todayItems.push({
          ...habit, // Skopiuj wszystkie dane (name, icon, color)
          time: time, // Nadpisz konkretną godziną
          completionId: completionId, // Unikalne ID dla 'HabitItem'
          isCompleted: completions[completionId] || false, // Sprawdź status wykonania
        });
      });
    }
    
    // 4. Sortuj finalną listę po godzinie
    todayItems.sort((a, b) => a.time.toDate().getTime() - b.time.toDate().getTime());
    return todayItems;

  }, [rawHabits, completions, todayDayID]); // Przelicz tylko, gdy zmienią się te dane


  // --- 8. Poprawiona funkcja odhaczania ---
  const handleToggleHabit = async (completionId, currentStatus) => {
    if (!user) return;
    
    // Ścieżka do dokumentu przechowującego wykonania z DANEGO DNIA
    const docRef = doc(db, 'users', user.uid, 'habitCompletions', todayDateString);
    
    try {
      // Używamy 'setDoc' z 'merge: true', aby zaktualizować tylko ten jeden wpis
      await setDoc(docRef, {
        [completionId]: !currentStatus // Np. { "habitID_0": true }
      }, { merge: true }); // 'merge: true' jest kluczowe!
      
    } catch (error) {
      console.error("Błąd podczas aktualizacji nawyku: ", error);
    }
  };

  return (
    <ScrollView 
      style={styles.mainContainer}
      contentContainerStyle={{ 
          paddingTop: insets.top + 80, 
          paddingBottom: insets.bottom + 100 
      }}
    >
      {/* --- Twój układ (Top Row) --- */}
      <View style={styles.topRowContainer}>
        <View style={styles.titleHabitContainer}>
          <Text style={styles.titleHabitText}>Nawyki</Text>
        </View>
        <Pressable 
          style={({ pressed }) => [styles.HabitAddContainer, {transform: [{ scale: pressed ? 0.85 : 1 }]}]}
          onPress={() => navigation.getParent().navigate('HabitAdd')} 
        >
          <View style={styles.HabitAddShape}> 
            <FontAwesome5 name='plus' size={24} color={theme.colors.primary} />
          </View>
        </Pressable>
      </View>

      {/* --- Twój układ (Folders Row) --- */}
      <View style={styles.foldersContainer}>
        <View style={styles.foldersChoiceContainer}>
          <Text style={styles.placeholderText}>Folders Choice</Text>
        </View>
        <Pressable style={({ pressed }) => [styles.foldersAddContainer, {transform: [{ scale: pressed ? 0.85 : 1 }]}]} onPress={() => setIsFolderModalVisible(true)}>
          <View style={styles.folderAddShape}> 
            <FontAwesome5 name='plus' size={24} color={theme.colors.primary} /> 
          </View>
        </Pressable>
      </View>

      {/* --- Twój układ (Days Row) --- */}
      <View style={styles.daysContainer}>
        <View style={styles.titleTodayContainer}>
          <Text style={styles.SubTytlesText}>Dzisiejsze</Text>
        </View>
        <View style={styles.daysDateContainer}>
          <Text style={styles.dateText}>{today.toLocaleDateString('pl-PL',{ day: 'numeric', month: 'numeric', year: 'numeric'})}</Text>
        </View>
      </View>

      {/* --- 9. Zaktualizowany kontener 'Habit Today' --- */}
      <View style={styles.HabitTodayContainer}>
        <FlatList
          data={displayableItems} // Używamy "rozwiniętej" listy
          keyExtractor={(item) => item.completionId}
          renderItem={({ item }) => (
            <HabitItem 
              item={item} // Przekazujemy "rozwinięty" nawyk (już z konkretną godziną)
              onToggle={() => handleToggleHabit(item.completionId, item.isCompleted)}
            />
          )}
          ListEmptyComponent={<Text style={styles.emptyListText}>Brak nawyków na dziś!</Text>}
          scrollEnabled={false} // Ważne: Mamy już ScrollView nadrzędny
        />
      </View>

      {/* --- Twój układ (Future Title) --- */}
      <View style={styles.titleFutureContainer}>
        <Text style={styles.SubTytlesText}>Jutrzejsze</Text>
      </View>

      {/* --- Twój układ (Future Container) --- */}
      <View style={styles.HabitFutureContainer}>
        <Text style={styles.placeholderText}>...wkrótce</Text>
      </View>

      {/* Twój Modal (bez zmian) */}
      <AddFolderModal visible={isFolderModalVisible} onClose={() => setIsFolderModalVisible(false)} defaultFolderType="habit"/>
    
    </ScrollView> 
  );
};

// --- Twoje Style (Dodaję tylko 'emptyListText') ---
const getStyles = (theme) => StyleSheet.create({
  // ... (wszystkie Twoje style stąd)
  mainContainer: {
    flex: 1, 
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.m, 
  },
  topRowContainer: {
    flexDirection: 'row',
    alignItems: 'center', 
    marginBottom: theme.spacing.m,
  },
  foldersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  titleHabitContainer: {
    padding: theme.spacing.s,
  },
  HabitAddContainer: {
    padding: theme.spacing.s,
  },
  foldersChoiceContainer: {
    flex: 1, 
    padding: theme.spacing.m,
    borderWidth: 1,
    borderColor: 'black',
    marginRight: theme.spacing.s,
  },
  foldersAddContainer: {
    padding: theme.spacing.s,
  },
  titleTodayContainer: {
    padding: theme.spacing.s,
  },
  daysDateContainer: {
    flex: 1, 
    padding: theme.spacing.s,
    marginLeft: theme.spacing.s,
  },
  HabitTodayContainer: {
    padding: theme.spacing.m,
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    marginBottom: theme.spacing.l,
    minHeight: 100, // Zmniejszyłem minHeight, aby szybciej zobaczyć efekt
    elevation: 3,
  },
  titleFutureContainer: {
    padding: theme.spacing.s,
    marginBottom: theme.spacing.s,
    alignSelf: 'flex-start', 
  },
  HabitFutureContainer: {
    padding: theme.spacing.m,
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    minHeight: 100, 
    marginBottom: theme.spacing.l, 
    elevation: 3,
  },
  HabitAddShape:{
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: theme.colors.primary, // Zmienione na 'primary'
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
  },
  folderAddShape:{
    width: 75,
    height: 45,
    borderRadius: 20,
    backgroundColor: theme.colors.primary, // Zmienione na 'primary'
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
  },
  placeholderText: {
    color: theme.colors.text,  
    fontSize: 12,
  },
  titleHabitText:{
    color: theme.colors.text, 
    fontSize: 32,
    fontFamily: 'TitilliumWeb_400Regular',
  },
  SubTytlesText:{
    color: theme.colors.text,  
    fontSize: 22,
    fontFamily: 'TitilliumWeb_400Regular',
  },
  dateText:{
    color: theme.colors.text, 
    fontSize: 22,
    fontFamily: 'TitilliumWeb_700Bold',
  },
  // 👇 NOWY STYL 👇
  emptyListText: {
    color: theme.colors.inactive,
    textAlign: 'center',
    padding: theme.spacing.l,
    fontFamily: 'TitilliumWeb_400Regular',
  },
});

export default HabitsScreen;