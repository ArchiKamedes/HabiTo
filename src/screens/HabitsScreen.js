import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, Modal, Pressable, Alert, ScrollView } from 'react-native';
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayString = today.toISOString().split('T')[0];
  const dayOfWeek = today.getDay();

  const [habits, setHabits] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);

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

  const allHabits = useMemo(() => {
    return habits.filter(h => 
      h.habitName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [habits, searchQuery]);

  const todayHabits = useMemo(() => {
    return allHabits.filter(habit => {
      if (habit.repeatMode === 'Codziennie') return true;
      if (habit.repeatMode === 'Wybierz dni' && habit.selectedWeekdays) {
        return habit.selectedWeekdays.includes(dayOfWeek);
      }
      return false;
    });
  }, [allHabits, dayOfWeek]);

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
      console.error(error);
    }
  };

  const openModal = (habit) => {
    setSelectedHabit(habit);
    setModalVisible(true);
  };

  const handleEdit = () => {
    setModalVisible(false);
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

  const renderRightActions = (progress, dragX, item) => {
    return (
      <TouchableOpacity 
        style={styles.deleteAction} 
        onPress={() => {
          setSelectedHabit(item);
          handleDelete();
        }}
        accessible={true}
        accessibilityLabel="Usuń ten nawyk"
        accessibilityRole="button"
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
        containerStyle={styles.swipeContainer}
      >
        <TouchableOpacity 
          style={[styles.habitCard, { borderColor: item.color || theme.colors.primary }]}
          onPress={() => openModal(item)}
          activeOpacity={0.8}
          accessible={true}
          accessibilityLabel={`Nawyk ${item.habitName}, status: ${isCompletedToday ? 'wykonany' : 'niewykonany'}`}
          accessibilityHint="Kliknij dwukrotnie aby zobaczyć szczegóły, przesuń w lewo aby usunąć"
          accessibilityRole="button"
        >
          <View style={[styles.iconBox, { backgroundColor: item.color || theme.colors.primary }]}>
            <FontAwesome5 name={item.icon || 'star'} size={20} color="white" />
          </View>
          
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{item.habitName}</Text>
            <Text style={styles.folderName}>{item.folder || 'Ogólne'}</Text>
          </View>

          <Pressable 
            onPress={(e) => {
              e.stopPropagation();
              handleToggleHabit(item);
            }}
            style={[
              styles.checkbox, 
              isCompletedToday && { backgroundColor: item.color || theme.colors.primary, borderColor: item.color || theme.colors.primary }
            ]}
            accessible={true}
            accessibilityRole="checkbox"
            accessibilityLabel={`Oznacz nawyk ${item.habitName} jako wykonany`}
            accessibilityState={{ checked: isCompletedToday }}
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
        
        <View style={styles.header}>
          <Text style={styles.headerTitle} accessibilityRole="header">Zarządzaj Nawykami</Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('HabitAdd')} 
            style={styles.addButton}
            accessible={true}
            accessibilityLabel="Dodaj nowy nawyk"
            accessibilityRole="button"
          >
            <Ionicons name="add" size={28} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={theme.colors.inactive} style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Szukaj..."
            placeholderTextColor={theme.colors.inactive}
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessible={true}
            accessibilityLabel="Pole wyszukiwania nawyków"
          />
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          
          <View style={styles.sectionHeader}>
             <Text style={styles.sectionTitle} accessibilityRole="header">Na Dziś</Text>
          </View>
          
          {todayHabits.length === 0 ? (
             <Text style={styles.emptyText}>Brak nawyków zaplanowanych na dzisiaj.</Text>
          ) : (
             todayHabits.map(habit => (
                <View key={habit.id}>
                   {renderHabitItem({ item: habit })}
                </View>
             ))
          )}

          <View style={[styles.sectionHeader, { marginTop: 30 }]}>
             <Text style={styles.sectionTitle} accessibilityRole="header">Wszystkie Nawyki</Text>
          </View>

          {allHabits.length === 0 ? (
             <Text style={styles.emptyText}>Nie masz jeszcze żadnych nawyków.</Text>
          ) : (
             allHabits.map(habit => (
                <View key={habit.id}>
                   {renderHabitItem({ item: habit })}
                </View>
             ))
          )}
        </ScrollView>

        <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
          <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)} accessible={false}>
            <View 
              style={styles.modalContent} 
              accessible={true} 
              accessibilityViewIsModal={true}
              accessibilityLabel="Szczegóły nawyku"
            >
              {selectedHabit && (
                <>
                  <View style={[styles.modalIconCircle, { backgroundColor: selectedHabit.color }]}>
                     <FontAwesome5 name={selectedHabit.icon} size={30} color="white" />
                  </View>
                  <Text style={styles.modalTitle} accessibilityRole="header">{selectedHabit.habitName}</Text>
                  
                  <View style={styles.modalButtons}>
                     <TouchableOpacity 
                        style={[styles.actionBtn, {backgroundColor: theme.colors.primary}]} 
                        onPress={handleEdit}
                        accessible={true}
                        accessibilityLabel="Edytuj nawyk"
                        accessibilityRole="button"
                     >
                        <Ionicons name="pencil" size={18} color="white" style={{marginRight: 8}}/>
                        <Text style={styles.btnText}>Edytuj</Text>
                     </TouchableOpacity>
                     
                     <TouchableOpacity 
                        style={[styles.actionBtn, {backgroundColor: '#FF4500'}]} 
                        onPress={handleDelete}
                        accessible={true}
                        accessibilityLabel="Usuń nawyk"
                        accessibilityRole="button"
                     >
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
  sectionHeader: {
    marginBottom: 15,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'TitilliumWeb_700Bold',
    color: theme.colors.text,
  },
  swipeContainer: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
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
  deleteAction: {
    backgroundColor: '#FF4500',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderRadius: 16,
  },
  emptyText: {
    color: theme.colors.inactive,
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
  },
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