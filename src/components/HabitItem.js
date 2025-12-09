import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, Modal, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { db, auth } from '../firebaseConfig';
import { collection, query, onSnapshot, orderBy, doc, deleteDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

const HabitsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const insets = useSafeAreaInsets();
  const user = auth.currentUser;

  // Dzisiejsza data (do checkboxa)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayString = today.toISOString().split('T')[0];

  const [habits, setHabits] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);

  // --- 1. POBIERANIE (PROSTA LISTA) ---
  useEffect(() => {
    if (!user) return;
    const habitsRef = collection(db, 'users', user.uid, 'habits');
    const q = query(habitsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setHabits(data);
    });
    return () => unsubscribe();
  }, [user]);

  // --- 2. FILTROWANIE (Tylko wyszukiwarka) ---
  const filteredHabits = useMemo(() => {
    return habits.filter(h => 
      h.habitName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [habits, searchQuery]);

  // --- 3. LOGIKA CHECKBOXA ---
  const handleToggleHabit = async (habit) => {
    if (!user) return;
    const habitDocRef = doc(db, 'users', user.uid, 'habits', habit.id);
    const isCompletedToday = habit.completedDates?.includes(todayString);

    try {
      if (isCompletedToday) {
        await updateDoc(habitDocRef, { completedDates: arrayRemove(todayString) });
      } else {
        await updateDoc(habitDocRef, {
          completedDates: arrayUnion(todayString),
          skippedDates: arrayRemove(todayString),
          missedDates: arrayRemove(todayString)
        });
      }
    } catch (error) {
      console.error("Błąd togglowania:", error);
    }
  };

  // --- 4. AKCJE MODALA ---
  const openModal = (habit) => {
    setSelectedHabit(habit);
    setModalVisible(true);
  };

  const handleEdit = () => {
    setModalVisible(false);
    // Przekazujemy nawyk do edycji. Upewnij się, że HabitAddScreen to obsługuje!
    navigation.navigate('HabitAdd', { habitToEdit: selectedHabit });
  };

  const handleDelete = async () => {
    if (!selectedHabit || !user) return;
    Alert.alert("Usuń nawyk", "Czy na pewno?", [
      { text: "Anuluj", style: "cancel" },
      { 
        text: "Usuń", style: "destructive", 
        onPress: async () => {
          await deleteDoc(doc(db, 'users', user.uid, 'habits', selectedHabit.id));
          setModalVisible(false);
        }
      }
    ]);
  };

  // --- 5. RENDEROWANIE ELEMENTU ---
  
  // Akcja Swipe (np. Usuwanie) - opcjonalne, jeśli chcesz to mieć na liście
  const renderRightActions = (progress, dragX, item) => {
    return (
      <TouchableOpacity 
        style={styles.deleteAction} 
        onPress={() => {
          setSelectedHabit(item);
          handleDelete(); // Wywołuje alert usuwania
        }}
      >
        <Ionicons name="trash-outline" size={24} color="white" />
      </TouchableOpacity>
    );
  };

  const renderHabitItem = ({ item }) => {
    const isCompletedToday = item.completedDates?.includes(todayString);

    return (
      <Swipeable
        renderRightActions={(p, d) => renderRightActions(p, d, item)}
        containerStyle={styles.swipeContainer} // Ważne dla układu!
      >
        <TouchableOpacity 
          style={[styles.habitCard, { borderColor: item.color || theme.colors.primary }]}
          onPress={() => openModal(item)}
          activeOpacity={0.8}
        >
          {/* IKONA */}
          <View style={[styles.iconBox, { backgroundColor: item.color || theme.colors.primary }]}>
            <FontAwesome5 name={item.icon || 'star'} size={20} color="white" />
          </View>
          
          {/* NAZWA (BEZ STATYSTYK) */}
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{item.habitName}</Text>
            <Text style={styles.folderName}>{item.folder || 'Ogólne'}</Text>
          </View>

          {/* CHECKBOX */}
          <Pressable 
            onPress={(e) => {
              e.stopPropagation();
              handleToggleHabit(item);
            }}
            style={[
              styles.checkbox, 
              isCompletedToday && { backgroundColor: item.color || theme.colors.primary, borderColor: item.color || theme.colors.primary }
            ]}
          >
            {isCompletedToday && <Ionicons name="checkmark" size={18} color="white" />}
          </Pressable>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        
        {/* NAGŁÓWEK */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Wszystkie Nawyki</Text>
          <TouchableOpacity onPress={() => navigation.navigate('HabitAdd')} style={styles.addButton}>
            <Ionicons name="add" size={28} color="white" />
          </TouchableOpacity>
        </View>

        {/* WYSZUKIWARKA */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={theme.colors.inactive} style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Szukaj..."
            placeholderTextColor={theme.colors.inactive}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* LISTA PŁASKA (BEZ FOLDERÓW) */}
        <FlatList
          data={filteredHabits}
          keyExtractor={(item) => item.id}
          renderItem={renderHabitItem}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Brak nawyków.</Text>
          }
        />

        {/* MODAL EDYCJI / USUWANIA */}
        <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
          <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
            <View style={styles.modalContent}>
              {selectedHabit && (
                <>
                  <View style={[styles.modalIconCircle, { backgroundColor: selectedHabit.color }]}>
                     <FontAwesome5 name={selectedHabit.icon} size={30} color="white" />
                  </View>
                  <Text style={styles.modalTitle}>{selectedHabit.habitName}</Text>
                  
                  {/* PRZYCISKI AKCJI */}
                  <View style={styles.modalButtons}>
                     <TouchableOpacity style={[styles.actionBtn, {backgroundColor: theme.colors.primary}]} onPress={handleEdit}>
                        <Ionicons name="pencil" size={18} color="white" style={{marginRight: 8}}/>
                        <Text style={styles.btnText}>Edytuj</Text>
                     </TouchableOpacity>
                     
                     <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#FF4500'}]} onPress={handleDelete}>
                        <Ionicons name="trash" size={18} color="white" style={{marginRight: 8}}/>
                        <Text style={styles.btnText}>Usuń</Text>
                     </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </Pressable>
        </Modal>

      </View>
    </GestureHandlerRootView>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.m,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'TitilliumWeb_700Bold',
    color: theme.colors.text,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    width: 45, height: 45,
    borderRadius: 22.5,
    justifyContent: 'center', alignItems: 'center',
    elevation: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchIcon: { marginRight: 10 },
  searchInput: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 16,
    fontFamily: 'TitilliumWeb_400Regular',
  },
  // KAFELEK
  swipeContainer: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden', // Ważne przy swipe
  },
  habitCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2, 
    elevation: 2,
  },
  iconBox: {
    width: 44, height: 44,
    borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 15,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    color: theme.colors.text,
    fontFamily: 'TitilliumWeb_700Bold',
  },
  folderName: {
    fontSize: 12,
    color: theme.colors.inactive,
    fontFamily: 'TitilliumWeb_400Regular',
    marginTop: 2,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.colors.inactive,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginLeft: 10,
  },
  // SWIPE ACTION
  deleteAction: {
    backgroundColor: '#FF4500',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderRadius: 16, // Żeby pasowało do karty
  },
  emptyText: {
    color: theme.colors.inactive,
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  // MODAL
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalContent: {
    width: '80%', backgroundColor: theme.colors.card,
    borderRadius: 20, padding: 25, alignItems: 'center',
    elevation: 5,
  },
  modalIconCircle: {
    width: 60, height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center', marginBottom: 15,
  },
  modalTitle: {
    fontSize: 22, color: theme.colors.text,
    fontFamily: 'TitilliumWeb_700Bold', marginBottom: 25,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row', justifyContent: 'space-between', width: '100%',
  },
  actionBtn: {
    flexDirection: 'row',
    paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, width: '45%', 
    alignItems: 'center', justifyContent: 'center',
  },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});

export default HabitsScreen;