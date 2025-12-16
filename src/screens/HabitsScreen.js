import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Pressable, Modal, Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { db, auth } from '../firebaseConfig';
import { collection, query, onSnapshot, orderBy, doc, deleteDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import HabitItem from '../components/HabitItem';

const HabitsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const insets = useSafeAreaInsets();
  const user = auth.currentUser;

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('pl-PL',{ day: 'numeric', month: 'numeric', year: 'numeric'});
  const todayString = currentDate.toISOString().split('T')[0];
  const dayOfWeek = currentDate.getDay();

  const [habits, setHabits] = useState([]);
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

  const todayHabits = useMemo(() => {
    return habits.filter(habit => {
      if (habit.repeatMode === 'Codziennie') return true;
      if (habit.repeatMode === 'Wybierz dni' && habit.selectedWeekdays) {
        return habit.selectedWeekdays.includes(dayOfWeek);
      }
      return false;
    });
  }, [habits, dayOfWeek]);

  const allHabits = useMemo(() => {
    return habits;
  }, [habits]);

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

  const getFrequencyText = (habit) => {
    if (!habit) return '';
    if (habit.repeatMode === 'Codziennie') return 'Codziennie';
    if (habit.repeatMode === 'Co X dni') return `Co ${habit.repeatValueX || '?'} dni`;
    if (habit.repeatMode === 'Wybierz dni' && habit.selectedWeekdays) {
        const daysMap = ['Nd', 'Pn', 'Wt', 'Śr', 'Czw', 'Pt', 'Sb'];
        const days = habit.selectedWeekdays
            .slice()
            .sort((a, b) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b)) 
            .map(d => daysMap[d]);
        return days.join(', ');
    }
    return habit.repeatMode;
  };

  const getTimeText = (habit) => {
    if (!habit) return '';
    let timeVal = null;

    if (habit.notificationTimes) {
        if (Array.isArray(habit.notificationTimes) && habit.notificationTimes.length > 0) {
            timeVal = habit.notificationTimes[0];
        } else if (typeof habit.notificationTimes === 'object') {
             const keys = Object.keys(habit.notificationTimes);
             if(keys.length > 0 && habit.notificationTimes[keys[0]].length > 0) {
                 timeVal = habit.notificationTimes[keys[0]][0];
             }
        }
    }
    
    if (timeVal && timeVal.toDate) {
        return timeVal.toDate().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    }
    if (timeVal) {
        return new Date(timeVal).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    }

    return 'Cały dzień';
  };

  const renderHabitItem = ({ item }) => {
    const isCompletedToday = item.completedDates?.includes(todayString);
    const itemForDisplay = { ...item, isCompleted: isCompletedToday };

    return (
      <TouchableOpacity 
        style={styles.itemWrapper}
        onPress={() => openModal(item)}
        activeOpacity={0.8}
        accessible={true}
        accessibilityLabel={`Nawyk ${item.habitName}. Folder: ${item.folder}. Status: ${isCompletedToday ? 'zrobione' : 'do zrobienia'}.`}
        accessibilityHint="Kliknij dwukrotnie, aby otworzyć szczegóły, edytować lub usunąć."
        accessibilityRole="button"
      >
        <HabitItem 
          item={itemForDisplay}
          onToggle={() => handleToggleHabit(item)}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
    <ScrollView 
      style={styles.mainContainer}
      contentContainerStyle={{ 
          paddingTop: insets.top + 40, 
          paddingBottom: insets.bottom + 50

      }}
    >
      <View style={styles.topRowContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle} accessibilityRole="header">Nawyki</Text>
        </View>
        <Pressable 
          style={({ pressed }) => [styles.addButtonContainer, {transform: [{ scale: pressed ? 0.85 : 1 }]}]}
          onPress={() => navigation.navigate('HabitAdd')} 
          accessible={true}
          accessibilityLabel="Dodaj nowy nawyk"
          accessibilityRole="button"
        >
          <View style={styles.addShape}> 
            <FontAwesome5 name='plus' size={24} color="white" /> 
          </View>
        </Pressable>
      </View>

      <View style={styles.foldersContainer}>
        <View style={styles.foldersChoiceContainer}>
          <Text style={styles.placeholderText}>Folders Choice</Text>
        </View>
        <Pressable 
          style={({ pressed }) => [styles.addButtonContainer, {transform: [{ scale: pressed ? 0.85 : 1 }]}]} 
          accessible={true}
          accessibilityLabel="Dodaj nowy folder"
          accessibilityRole="button"
        >
          <View style={styles.folderAddShape}> 
            <FontAwesome5 name='plus' size={24} color={theme.colors.primary} /> 
          </View>
        </Pressable>
      </View>

      <View style={styles.dateRowContainer}>
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitleText} accessibilityRole="header">Dzisiejsze</Text>
        </View>
        <View style={styles.dateContainer}>
          <Text style={styles.dateText} accessibilityLabel={`Data: ${formattedDate}`}>{formattedDate}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.listContainer}>
          <FlatList
            data={todayHabits}
            keyExtractor={(item) => item.id}
            renderItem={renderHabitItem}
            ListEmptyComponent={
              <Text style={styles.emptyText} accessible={true}>Brak nawyków na dziś.</Text>
            }
            scrollEnabled={false}
          />
        </View>

        <View style={[styles.dateRowContainer, { marginTop: 25 }]}>
          <View style={styles.subtitleContainer}>
            <Text style={styles.subtitleText} accessibilityRole="header">Wszystkie</Text>
          </View>
        </View>

        <View style={styles.listContainer}>
          <FlatList
            data={allHabits}
            keyExtractor={(item) => item.id}
            renderItem={renderHabitItem}
            ListEmptyComponent={
              <Text style={styles.emptyText} accessible={true}>Brak nawyków.</Text>
            }
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setModalVisible(false)} 
          accessible={true} 
          accessibilityLabel="Zamknij okno szczegółów"
          accessibilityRole="button"
        >
          <View style={styles.modalContent} accessible={true} accessibilityViewIsModal={true}>
            {selectedHabit && (
              <>
                <View style={[styles.modalIconCircle, { backgroundColor: selectedHabit.color }]}>
                   <FontAwesome5 name={selectedHabit.icon} size={30} color="white" />
                </View>
                <Text style={styles.modalTitle} accessibilityRole="header">{selectedHabit.habitName}</Text>
                
                <View style={styles.detailsContainer} accessible={true} accessibilityLabel="Szczegóły nawyku">
                  
                  <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Folder:</Text>
                      <Text style={styles.detailValue}>{selectedHabit.folder || 'Brak'}</Text>
                  </View>

                  <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Tryb:</Text>
                      <Text style={styles.detailValue}>{getFrequencyText(selectedHabit)}</Text>
                  </View>

                  <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Godzina:</Text>
                      <Text style={styles.detailValue}>{getTimeText(selectedHabit)}</Text>
                  </View>

                  <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Cel:</Text>
                      <Text style={styles.detailValue}>{selectedHabit.timesPerDay} razy dziennie</Text>
                  </View>

                </View>

                <View style={styles.modalButtons}>
                   <TouchableOpacity 
                      style={[styles.actionBtn, {backgroundColor: theme.colors.primary}]} 
                      onPress={handleEdit}
                      accessible={true}
                      accessibilityLabel="Edytuj nawyk"
                      accessibilityRole="button"
                   >
                      <Text style={styles.btnText}>Edytuj</Text>
                   </TouchableOpacity>
                   
                   <TouchableOpacity 
                      style={[styles.actionBtn, {backgroundColor: '#FF4500'}]} 
                      onPress={handleDelete}
                      accessible={true}
                      accessibilityLabel="Usuń nawyk"
                      accessibilityRole="button"
                   >
                      <Text style={styles.btnText}>Usuń</Text>
                   </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
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
  dateRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  titleContainer: {
    padding: theme.spacing.s,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: 'TitilliumWeb_400Regular',
    color: theme.colors.text,
  },
  addButtonContainer: {
    padding: theme.spacing.s,
  },
  addShape: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  folderAddShape: {
    width: 75,
    height: 45,
    borderRadius: 20,
    backgroundColor: theme.colors.active, 
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  foldersChoiceContainer: {
    flex: 1, 
    padding: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.text,
    marginRight: theme.spacing.s,
  },
  placeholderText: {
    color: theme.colors.text,  
    fontSize: 12,
  },
  subtitleContainer: {
    padding: theme.spacing.s,
  },
  subtitleText: {
    color: theme.colors.text,  
    fontSize: 22,
    fontFamily: 'TitilliumWeb_400Regular',
  },
  dateContainer: {
    flex: 1, 
    padding: theme.spacing.s,
    marginLeft: theme.spacing.s,
  },
  dateText: {
    color: theme.colors.text, 
    fontSize: 22,
    fontFamily: 'TitilliumWeb_700Bold',
  },
  listContainer: {
    padding: theme.spacing.m,
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    minHeight: 100, 
    elevation: 3,
  },
  itemWrapper: {
    marginBottom: 10,
  },
  emptyText: {
    color: theme.colors.inactive,
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalContent: {
    width: '85%', backgroundColor: theme.colors.card,
    borderRadius: 20, padding: 25, alignItems: 'center',
    elevation: 5,
  },
  modalIconCircle: {
    width: 60, height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center', marginBottom: 15,
  },
  modalTitle: {
    fontSize: 22, color: theme.colors.text,
    fontFamily: 'TitilliumWeb_700Bold', marginBottom: 20,
  },
  detailsContainer: {
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
    paddingBottom: 4,
  },
  detailLabel: {
    fontSize: 16,
    color: theme.colors.inactive,
    fontFamily: 'TitilliumWeb_400Regular',
  },
  detailValue: {
    fontSize: 16,
    color: theme.colors.text,
    fontFamily: 'TitilliumWeb_700Bold',
    maxWidth: '60%',
    textAlign: 'right',
  },
  modalButtons: {
    flexDirection: 'row', justifyContent: 'space-between', width: '100%',
  },
  actionBtn: {
    paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, width: '45%', 
    alignItems: 'center', justifyContent: 'center',
  },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});

export default HabitsScreen;