import React, { useState, useEffect, useMemo } from 'react';
import {  View, Text, TextInput, FlatList, StyleSheet, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import TaskItem from '../components/TaskItem';
import { db, auth } from '../firebaseConfig';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';

const HomeScreen = () => {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme(); 
    const user = auth.currentUser;
    const styles = getStyles(theme);
    const today = new Date();
    const [tasks, setTasks] = useState([]); 
    const [subtasks, setSubtasks] = useState([]);
    today.setHours(0, 0, 0, 0);

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
          await updateDoc(taskDocRef, {
            completed: !currentStatus 
          });
        } catch (error) {
          console.error("Błąd podczas aktualizacji zadania: ", error);
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
            console.error("Błąd podczas aktualizacji podzadania: ", error);
          }
        };

  return (
    <ScrollView  style={styles.container}  
      contentContainerStyle={{ 
          paddingTop: insets.top + 80, 
          paddingBottom: insets.bottom + 100 
      }}>

         <View style={styles.titleContainer}>
        <Text style={styles.titleText}>Nawyki</Text>
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
              <Text style={styles.emptyListText}>Nie masz żadnych zadań na dziś!</Text>
            }
            scrollEnabled={false}
          />
        </View>
        
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>Zadania</Text>
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
              <Text style={styles.emptyListText}>Nie masz żadnych zadań na dziś!</Text>
            }
            scrollEnabled={false}
          />
        </View>

    </ScrollView >
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
  },
    titleText:{
    color: theme.colors.text, 
    fontSize: 32,
    fontFamily: 'TitilliumWeb_400Regular',
  },
    elementsContainer: {
    padding: theme.spacing.m,
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    marginBottom: theme.spacing.l,
    marginTop: theme.spacing.n,
    minHeight: 200, 
    elevation: 3,

  },
});

export default HomeScreen;