import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import TaskItem from '../components/TaskItem';
import HabitItem from '../components/HabitItem';
import { db, auth } from '../firebaseConfig';
import { 
  collection, query, onSnapshot, doc, updateDoc, deleteDoc, orderBy, 
  arrayUnion, arrayRemove 
} from 'firebase/firestore';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const user = auth.currentUser;
  const styles = getStyles(theme);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayString = today.toISOString().split('T')[0];

  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);

  useEffect(() => {
    if (!user) return;
    const tasksCollectionRef = collection(db, 'users', user.uid, 'tasks');
    const q = query(tasksCollectionRef, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setTasks(tasksData);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const habitsCollectionRef = collection(db, 'users', user.uid, 'habits');
    const q = query(habitsCollectionRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const habitsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setHabits(habitsData);
      checkMissedDays(habitsData, user.uid);
    });
    return () => unsubscribe();
  }, [user]);

  const todayTasks = useMemo(() => {
    return tasks.filter(task => {
      if (task.dueDate && typeof task.dueDate.toDate === 'function') {
        const taskDate = task.dueDate.toDate();
        taskDate.setHours(0, 0, 0, 0); 
        return taskDate.getTime() === today.getTime();
      }
      return false;
    });
  }, [tasks]);

  const handleToggleComplete = async (taskId, currentStatus) => {
    if (!user) return;
    const taskDocRef = doc(db, 'users', user.uid, 'tasks', taskId);
    try {
      await updateDoc(taskDocRef, { completed: !currentStatus });
    } catch (error) { console.error(error); }
  };

  const handleToggleSubtask = async (taskId, subtaskIndex, currentStatus) => {
    if (!user) return;
    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (!taskToUpdate) return;

    const newSubtasks = taskToUpdate.subtasks.map((subtask, index) => {
      if (index === subtaskIndex) {
        return { ...subtask, completed: !currentStatus };
      }
      return subtask;
    });

    const taskDocRef = doc(db, 'users', user.uid, 'tasks', taskId);
    try {
      await updateDoc(taskDocRef, { subtasks: newSubtasks });
    } catch (error) { console.error(error); }
  };

  const checkMissedDays = async (currentHabits, userId) => {
    currentHabits.forEach(async (habit) => {
      if (!habit.createdAt) return;

      const createdDate = habit.createdAt.toDate();
      createdDate.setHours(0,0,0,0);
      
      let iterDate = new Date(createdDate);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const datesToMarkAsMissed = [];

      while (iterDate <= yesterday) {
        const iterDateString = iterDate.toISOString().split('T')[0];
        const dayOfWeek = iterDate.getDay();

        let shouldBeDone = false;
        if (habit.repeatMode === 'Codziennie') shouldBeDone = true;
        else if (habit.repeatMode === 'Wybierz dni' && habit.selectedWeekdays) {
          shouldBeDone = habit.selectedWeekdays.includes(dayOfWeek);
        }

        if (shouldBeDone) {
          const isDone = habit.completedDates?.includes(iterDateString);
          const isSkipped = habit.skippedDates?.includes(iterDateString);
          const isAlreadyMissed = habit.missedDates?.includes(iterDateString);

          if (!isDone && !isSkipped && !isAlreadyMissed) {
            datesToMarkAsMissed.push(iterDateString);
          }
        }
        iterDate.setDate(iterDate.getDate() + 1);
      }

      if (datesToMarkAsMissed.length > 0) {
        const habitRef = doc(db, 'users', userId, 'habits', habit.id);
        try {
          await updateDoc(habitRef, {
            missedDates: arrayUnion(...datesToMarkAsMissed)
          });
        } catch (e) { console.error(e); }
      }
    });
  };

  const handleToggleHabit = async (habitId, currentCompletedDates = []) => {
    if (!user) return;
    const habitDocRef = doc(db, 'users', user.uid, 'habits', habitId);
    const isCompletedToday = currentCompletedDates.includes(todayString);

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
    } catch (error) { console.error(error); }
  };

  const handleSkipHabit = async (habitId) => {
    if (!user) return;
    const habitDocRef = doc(db, 'users', user.uid, 'habits', habitId);
    try {
      await updateDoc(habitDocRef, {
        skippedDates: arrayUnion(todayString),
        completedDates: arrayRemove(todayString),
        missedDates: arrayRemove(todayString)
      });
    } catch (error) { console.error(error); }
  };

  const openHabitModal = (habit) => {
    setSelectedHabit(habit);
    setModalVisible(true);
  };

  const handleDeleteHabit = async () => {
    if (!selectedHabit || !user) return;
    Alert.alert("Usuń nawyk", "Na pewno?", [
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

  const handleEditHabit = () => {
    setModalVisible(false);
    navigation.navigate('HabitAdd', { habitToEdit: selectedHabit });
  };

  const todayHabits = useMemo(() => {
    const dayOfWeek = today.getDay();
    let filtered = habits.filter(habit => {
      let isToday = false;
      if (habit.repeatMode === 'Codziennie') isToday = true;
      else if (habit.repeatMode === 'Wybierz dni' && habit.selectedWeekdays) {
        isToday = habit.selectedWeekdays.includes(dayOfWeek);
      }
      return isToday;
    });
    filtered.sort((a, b) => {
       const aDone = a.completedDates?.includes(todayString);
       const bDone = b.completedDates?.includes(todayString);
       if (aDone === bDone) return 0;
       return aDone ? 1 : -1;
    });
    return filtered;
  }, [habits, todayString]);

  const renderLeftActions = (progress, dragX) => (
    <View 
      style={styles.leftAction}
      accessible={true}
      accessibilityLabel="Anuluj nawyk na dzisiaj"
      accessibilityRole="button"
    >
      <Ionicons name="close-circle-outline" size={30} color="#FFF" />
      <Text style={styles.actionText}>Anuluj</Text>
    </View>
  );

  const renderHabitItem = ({ item }) => {
    const isCompleted = item.completedDates?.includes(todayString);
    const isSkipped = item.skippedDates?.includes(todayString);
    const displayItem = { ...item, isCompleted: isCompleted };
    
    let accessibilityStatus = "do zrobienia";
    if (isCompleted) accessibilityStatus = "wykonany";
    if (isSkipped) accessibilityStatus = "anulowany";

    return (
      <Swipeable
        renderLeftActions={renderLeftActions}
        onSwipeableOpen={() => handleSkipHabit(item.id)}
        enabled={!isSkipped && !isCompleted} 
      >
        <TouchableOpacity 
          onPress={() => openHabitModal(item)} 
          activeOpacity={0.8}
          accessible={true}
          accessibilityLabel={`Nawyk ${item.habitName}. Status: ${accessibilityStatus}.`}
          accessibilityHint="Kliknij dwukrotnie, aby zobaczyć szczegóły. Przesuń w prawo, aby anulować nawyk na dzisiaj."
          accessibilityRole="button"
        >
          <View style={[isSkipped && styles.skippedItem]}>
            <HabitItem 
              item={displayItem} 
              onToggle={() => handleToggleHabit(item.id, item.completedDates)} 
            />
            {isSkipped && (
              <View style={styles.skippedOverlay}>
                <Text style={styles.skippedText}>ANULOWANY</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingTop: insets.top + 50, paddingBottom: 100 }}>
        
        <View style={styles.titleContainer}>
          <Text style={styles.titleText} accessibilityRole="header">Nawyki</Text>
        </View>
        <View style={styles.elementsContainer}>
          <FlatList
            data={todayHabits}
            keyExtractor={(item) => item.id}
            renderItem={renderHabitItem}
            ListEmptyComponent={
              <Text style={styles.emptyListText} accessible={true}>Brak nawyków zaplanowanych na dzisiaj.</Text>
            }
            scrollEnabled={false}
          />
        </View>
        
        <View style={styles.titleContainer}>
          <Text style={styles.titleText} accessibilityRole="header">Zadania</Text>
        </View>
        <View style={styles.elementsContainer}>
          <FlatList
            data={todayTasks} 
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
               <TaskItem 
                 item={item}
                 onToggleComplete={handleToggleComplete}
                 onToggleSubtask={handleToggleSubtask}
               /> 
            )}
            ListEmptyComponent={
              <Text style={styles.emptyListText} accessible={true}>Brak zadań na dzisiaj!</Text>
            }
            scrollEnabled={false}
          />
        </View>

        <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
          <Pressable 
            style={styles.modalOverlay} 
            onPress={() => setModalVisible(false)}
            accessible={true}
            accessibilityLabel="Zamknij okno szczegółów nawyku"
            accessibilityRole="button"
          >
            <View 
              style={styles.modalContent}
              accessible={true}
              accessibilityViewIsModal={true}
            >
              {selectedHabit && (
                <>
                  <View style={[styles.modalIconCircle, { backgroundColor: selectedHabit.color || theme.colors.primary }]}>
                     <FontAwesome5 name={selectedHabit.icon || 'star'} size={30} color="white" />
                  </View>
                  <Text style={styles.modalTitle} accessibilityRole="header">{selectedHabit.habitName}</Text>
                  
                  <View 
                    style={styles.statsContainer}
                    accessible={true}
                    accessibilityLabel={`Statystyki nawyku. Wykonane: ${selectedHabit.completedDates?.length || 0} razy. Pominięte: ${selectedHabit.skippedDates?.length || 0} razy. Niewykonane: ${selectedHabit.missedDates?.length || 0} razy.`}
                  >
                    <View style={styles.statBox}>
                      <Text style={styles.statLabel}>Wykonane</Text>
                      <Text style={styles.statNumber}>{selectedHabit.completedDates?.length || 0}</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statLabel}>Pominięte</Text>
                      <Text style={styles.statNumber}>{selectedHabit.skippedDates?.length || 0}</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statLabel}>Niewykonane</Text>
                      <Text style={styles.statNumber}>{selectedHabit.missedDates?.length || 0}</Text>
                    </View>
                  </View>

                  <View style={styles.modalButtonsContainer}>
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.editButton]} 
                      onPress={handleEditHabit}
                      accessible={true}
                      accessibilityLabel="Edytuj nawyk"
                      accessibilityRole="button"
                    >
                      <Ionicons name="pencil" size={20} color="white" />
                      <Text style={styles.modalButtonText}>Edytuj</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.deleteButton]} 
                      onPress={handleDeleteHabit}
                      accessible={true}
                      accessibilityLabel="Usuń nawyk"
                      accessibilityRole="button"
                    >
                      <Ionicons name="trash" size={20} color="white" />
                      <Text style={styles.modalButtonText}>Usuń</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </Pressable>
        </Modal>

      </ScrollView>
    </GestureHandlerRootView>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.m, 
  },
  titleContainer: {
    padding: theme.spacing.s,
    marginTop: theme.spacing.m,
  },
  titleText:{
    color: theme.colors.text, 
    fontSize: 28,
    fontFamily: 'TitilliumWeb_400Regular',
  },
  elementsContainer: {
    padding: theme.spacing.m,
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    marginBottom: theme.spacing.l,
    minHeight: 100, 
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyListText: {
    color: theme.colors.inactive,
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    fontFamily: 'TitilliumWeb_400Regular',
  },
  leftAction: {
    backgroundColor: '#FF4500', 
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 20,
    borderRadius: 16,
    marginBottom: theme.spacing.m,
    height: '100%', 
    flex: 1,
  },
  actionText: {
    color: 'white',
    fontWeight: '600',
    paddingHorizontal: 10,
  },
  skippedItem: {
    opacity: 0.5,
  },
  skippedOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skippedText: {
    color: '#FF4500',
    fontWeight: 'bold',
    fontSize: 14,
    transform: [{ rotate: '-10deg' }],
    borderWidth: 2,
    borderColor: '#FF4500',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    elevation: 5,
  },
  modalIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: 'TitilliumWeb_700Bold',
    color: theme.colors.text,
    marginBottom: 10,
  },
  statsContainer: {
    width: '100%',
    padding: 10,
    backgroundColor: theme.colors.background,
    borderRadius: 10,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: { 
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.inactive,
    marginBottom: 5,
    fontFamily: 'TitilliumWeb_400Regular',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '45%',
  },
  editButton: {
    backgroundColor: theme.colors.primary,
  },
  deleteButton: {
    backgroundColor: '#FF4500',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default HomeScreen;