import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, ScrollView, TouchableOpacity, Pressable, Modal, Alert } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import TaskItem from '../components/TaskItem';
import AddFolderModal from '../components/AddFolderModal';
import { db, auth } from '../firebaseConfig';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { getStyles } from '.styles/TasksScreen.styles';

const TasksScreen = ({ navigation }) => { 
  const insets = useSafeAreaInsets();
  const { theme } = useTheme(); 
  const styles = getStyles(theme);
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('pl-PL',{ day: 'numeric', month: 'numeric', year: 'numeric'});
  const user = auth.currentUser;
  
  const [isFolderModalVisible, setIsFolderModalVisible] = useState(false);
  const [tasks, setTasks] = useState([]); 
  
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

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

  const futureTasks = useMemo(() => {
    return tasks.filter(task => {
      if (task.dueDate && typeof task.dueDate.toDate === 'function') {
        const taskDate = task.dueDate.toDate();
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() > today.getTime();
      }
      return false;
    });
  }, [tasks]);

  useEffect(() => {
    if (!user) return; 

    const tasksCollectionRef = collection(db, 'users', user.uid, 'tasks');
    const q = query(tasksCollectionRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tasksData = [];
      querySnapshot.forEach((doc) => {
        tasksData.push({ ...doc.data(), id: doc.id });
      });
      setTasks(tasksData); 
    });

    return () => unsubscribe();
  }, [user]);

  const handleToggleComplete = async (taskId, currentStatus) => {
    if (!user) return;
    const taskDocRef = doc(db, 'users', user.uid, 'tasks', taskId);
    try {
      await updateDoc(taskDocRef, {
        completed: !currentStatus 
      });
    } catch (error) {
      console.error(error);
    }
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
      await updateDoc(taskDocRef, {
        subtasks: newSubtasks
      });
    } catch (error) {
      console.error(error);
    }
  };

  const openTaskModal = (task) => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  const handleEditTask = () => {
    setModalVisible(false);
    navigation.getParent().navigate('TaskAdd', { taskToEdit: selectedTask });
  };

  const handleDeleteTask = async (taskToDelete) => {
    const task = taskToDelete || selectedTask;
    if (!task || !user) return;

    Alert.alert("Usuń zadanie", "Czy na pewno chcesz usunąć to zadanie?", [
      { text: "Anuluj", style: "cancel" },
      { 
        text: "Usuń", 
        style: "destructive", 
        onPress: async () => {
          await deleteDoc(doc(db, 'users', user.uid, 'tasks', task.id));
          setModalVisible(false);
        }
      }
    ]);
  };

  const renderLeftActions = (progress, dragX, item) => {
    return (
      <TouchableOpacity 
        style={styles.deleteAction} 
        onPress={() => handleDeleteTask(item)}
        accessible={true}
        accessibilityLabel="Usuń zadanie"
        accessibilityRole="button"
      >
        <Ionicons name="trash-outline" size={24} color="white" />
      </TouchableOpacity>
    );
  };

  const renderTaskItem = ({ item }) => (
    <Swipeable
      renderLeftActions={(p, d) => renderLeftActions(p, d, item)}
      containerStyle={styles.swipeContainer}
    >
      <TouchableOpacity 
        onPress={() => openTaskModal(item)}
        activeOpacity={0.8}
        accessible={true}
        accessibilityLabel={`Zadanie: ${item.name || item.text || "Bez nazwy"}. Status: ${item.completed ? 'wykonane' : 'niewykonane'}`}
        accessibilityHint="Kliknij dwukrotnie, aby edytować lub usunąć. Przesuń w prawo, aby szybko usunąć."
        accessibilityRole="button"
      >
        <TaskItem 
          item={item}
          onToggleComplete={handleToggleComplete}
          onToggleSubtask={handleToggleSubtask}
        />
      </TouchableOpacity>
    </Swipeable>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView 
        style={styles.mainContainer}
        contentContainerStyle={{ 
            paddingTop: insets.top + 80, 
            paddingBottom: insets.bottom + 100 
        }}
      >
        <View style={styles.topRowContainer}>
          <View style={styles.titleTaskContainer}>
            <Text style={styles.titleTaskText} accessibilityRole="header">Zadania</Text>
          </View>
          <Pressable 
            style={({ pressed }) => [styles.foldersAddContainer, {transform: [{ scale: pressed ? 0.85 : 1 }]}]}
            onPress={() => navigation.getParent().navigate('TaskAdd')} 
            accessible={true}
            accessibilityLabel="Dodaj nowe zadanie"
            accessibilityRole="button"
          >
            <View style={styles.taskAddShape}> 
              <FontAwesome5 name='plus' size={24} color={theme.colors.plus} /> 
            </View>
          </Pressable>
        </View>

        <View style={styles.foldersContainer}>
          <View style={styles.foldersChoiceContainer}>
            <Text style={styles.placeholderText}>Folders Choice</Text>
          </View>
          <Pressable 
            style={({ pressed }) => [styles.foldersAddContainer, {transform: [{ scale: pressed ? 0.85 : 1 }]}]} 
            onPress={() => setIsFolderModalVisible(true)}
            accessible={true}
            accessibilityLabel="Dodaj nowy folder"
            accessibilityRole="button"
          >
            <View style={styles.folderAddShape}> 
              <FontAwesome5 name='plus' size={24} color={theme.colors.primary} /> 
            </View>
          </Pressable>
        </View>

        <View style={styles.daysContainer}>
          <View style={styles.titleTodayContainer}>
            <Text style={styles.SubTytlesText} accessibilityRole="header">Dzisiejsze</Text>
          </View>
          <View style={styles.daysDateContainer}>
            <Text style={styles.dateText} accessibilityLabel={`Dzisiejsza data: ${formattedDate}`}>{formattedDate}</Text>
          </View>
        </View>

        <View style={styles.tasksTodayContainer}>
          <FlatList
            data={todayTasks}
            keyExtractor={(item) => item.id}
            renderItem={renderTaskItem}
            ListEmptyComponent={
              <Text style={styles.emptyListText} accessible={true}>Nie masz żadnych zadań na dziś!</Text>
            }
            scrollEnabled={false}
          />
        </View>

        <View style={styles.titleFutureContainer}>
          <Text style={styles.SubTytlesText} accessibilityRole="header">Przyszłe</Text>
        </View>

        <View style={styles.tasksFutureContainer}>
           <FlatList
            data={futureTasks}
            keyExtractor={(item) => item.id}
            renderItem={renderTaskItem}
            ListEmptyComponent={
              <Text style={styles.emptyListText} accessible={true}>Nie masz jeszcze żadnych zadań!</Text>
            }
            scrollEnabled={false}
          />
        </View>

        <AddFolderModal visible={isFolderModalVisible} onClose={() => setIsFolderModalVisible(false)} defaultFolderType="task"/>

        <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
          <Pressable 
            style={styles.modalOverlay} 
            onPress={() => setModalVisible(false)}
            accessible={true}
            accessibilityLabel="Zamknij okno opcji zadania"
            accessibilityRole="button"
          >
            <View 
              style={styles.modalContent}
              accessible={true}
              accessibilityViewIsModal={true}
            >
              {selectedTask && (
                <>
                  <Text style={styles.modalTitle} accessibilityRole="header">{selectedTask.name || selectedTask.text || "Bez nazwy"}</Text>
                  
                  <View style={styles.modalButtonsContainer}>
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.editButton]} 
                      onPress={handleEditTask}
                      accessible={true}
                      accessibilityLabel="Edytuj zadanie"
                      accessibilityRole="button"
                    >
                      <Ionicons name="pencil" size={20} color="white" />
                      <Text style={styles.modalButtonText}>Edytuj</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.deleteButton]} 
                      onPress={() => handleDeleteTask(null)}
                      accessible={true}
                      accessibilityLabel="Usuń zadanie"
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
export default TasksScreen;