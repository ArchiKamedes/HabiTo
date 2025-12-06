
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import TaskItem from '../components/TaskItem';
import AddFolderModal from '../components/AddFolderModal';
import { db, auth } from '../firebaseConfig';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';


const TasksScreen = ({ navigation }) => { 
  const insets = useSafeAreaInsets();
  const { theme } = useTheme(); 
  const styles = getStyles(theme);
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('pl-PL',{ day: 'numeric', month: 'numeric', year: 'numeric'});
  const user = auth.currentUser;
  const [isFolderModalVisible, setIsFolderModalVisible] = useState(false);
  const [tasks, setTasks] = useState([]); 
  const [subtasks, setSubtasks] = useState([]);
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

  // --- 3. Funkcja do zaznaczania GŁÓWNEGO zadania (UPDATE) ---
  const handleToggleComplete = async (taskId, currentStatus) => {
    if (!user) return;
    const taskDocRef = doc(db, 'users', user.uid, 'tasks', taskId);
    try {
      await updateDoc(taskDocRef, {
        completed: !currentStatus 
      });
    } catch (error) {
      console.error("Błąd podczas aktualizacji zadania: ", error);
    }
  };

  // --- 4. Funkcja do zaznaczania PODZADANIA (UPDATE) ---
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
      console.error("Błąd podczas aktualizacji podzadania: ", error);
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
      <View style={styles.topRowContainer}>
        <View style={styles.titleTaskContainer}>
          <Text style={styles.titleTaskText}>Zadania</Text>
        </View>
        <Pressable 
          style={({ pressed }) => [styles.foldersAddContainer, {transform: [{ scale: pressed ? 0.85 : 1 }]}]}
          onPress={() => navigation.getParent().navigate('TaskAdd')} >
          <View style={styles.taskAddShape}> 
            <FontAwesome5 name='plus' size={24} color={theme.colors.plus} /> 
          </View>
        </Pressable>
      </View>

      {/* Folders Row*/}
      <View style={styles.foldersContainer}>
        <View style={styles.foldersChoiceContainer}>
          <Text style={styles.placeholderText}>Folders Choice</Text>
        </View>
        <Pressable style={({ pressed }) => [styles.foldersAddContainer, {transform: [{ scale: pressed ? 0.85 : 1 }]}]}onPress={() => setIsFolderModalVisible(true)}>
          <View style={styles.folderAddShape}> 
            <FontAwesome5 name='plus' size={24} color={theme.colors.primary} /> 
          </View>
        </Pressable>
      </View>

      {/*Days Row */}
      <View style={styles.daysContainer}>
        <View style={styles.titleTodayContainer}>
          <Text style={styles.SubTytlesText}>Dzisiejsze</Text>
        </View>
        {/*today-date*/}
        <View style={styles.daysDateContainer}>
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>
      </View>

      {/*Tasks Today Area */}
     <View style={styles.tasksTodayContainer}>
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
            <Text style={styles.emptyListText}>Nie masz żadnych zadań na dziś!</Text>
          }
          scrollEnabled={false}
        />
      </View>

      {/*Title Future */}
      <View style={styles.titleFutureContainer}>
        <Text style={styles.SubTytlesText}>Przyszłe</Text>
      </View>

      {/*Tasks Future Area */}
      <View style={styles.tasksFutureContainer}>
         <FlatList
          data={futureTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskItem
              item={item}
              onToggleComplete={handleToggleComplete}
              onToggleSubtask={handleToggleSubtask}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.emptyListText}>Nie masz jeszcze żadnych zadań!</Text>
          }
          scrollEnabled={false}
        />
      </View>

      <AddFolderModal visible={isFolderModalVisible} onClose={() => setIsFolderModalVisible(false)} defaultFolderType="task"/>

    </ScrollView> 
  );
};

const getStyles = (theme) => StyleSheet.create({
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
 
  titleTaskContainer: {
    padding: theme.spacing.s,
  },
  taskAddContainer: {
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
  tasksTodayContainer: {
    padding: theme.spacing.m,
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    marginBottom: theme.spacing.l,
    marginTop: theme.spacing.n,
    minHeight: 200, 
    elevation: 3,

  },
  titleFutureContainer: {
    padding: theme.spacing.s,
    marginBottom: theme.spacing.s,
    alignSelf: 'flex-start', 
  },
  tasksFutureContainer: {
    padding: theme.spacing.m,
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    minHeight: 200, 
    marginBottom: theme.spacing.l, 
    marginTop: theme.spacing.n,
    elevation: 3,
  },

  //SHAPES
  taskAddShape:{
  width: 45,
  height: 45,
  borderRadius: 25,
  backgroundColor: theme.colors.active,
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 10,
  },

  folderAddShape:{
  width: 75,
  height: 45,
  borderRadius: 20,
  backgroundColor: theme.colors.active,
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 10,
  },

  placeholderText: {
    color: theme.colors.text,  
    fontSize: 12,
  },
  titleTaskText:{
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
    fontFamily: 'TitilliumWeb_700Bold,',
  },
});

export default TasksScreen; 