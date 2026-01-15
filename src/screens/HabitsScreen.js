import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, Pressable, Modal, Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { db, auth } from '../firebaseConfig';
import { collection, query, onSnapshot, orderBy, doc, deleteDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import HabitItem from '../components/HabitItem';
import AddFolderModal from '../components/AddFolderModal';
import { getStyles } from '../styles/HabitsScreen.styles';
import HabitDetailModal from '../components/HabitDetailModal';

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
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [isFolderModalVisible, setIsFolderModalVisible] = useState(false);

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

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'HabitsFolders'), orderBy('createdAt', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const foldersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFolders(foldersData);
    });
    return () => unsubscribe();
  }, [user]);

  const todayHabits = useMemo(() => {
    return habits.filter(habit => {
      const isFolderMatch = selectedFolder === 'all' || habit.folder === selectedFolder;
      if (!isFolderMatch) return false;

      if (habit.repeatMode === 'Codziennie') return true;
      if (habit.repeatMode === 'Wybierz dni' && habit.selectedWeekdays) {
        return habit.selectedWeekdays.includes(dayOfWeek);
      }
      return false;
    });
  }, [habits, dayOfWeek, selectedFolder]);

  const allHabits = useMemo(() => {
    return habits.filter(habit => {
        return selectedFolder === 'all' || habit.folder === selectedFolder;
    });
  }, [habits, selectedFolder]);

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

  const renderHabitItem = ({ item }) => {
    const isCompletedToday = item.completedDates?.includes(todayString);
    const itemForDisplay = { ...item, isCompleted: isCompletedToday };

    return (
      // Changed TouchableOpacity to View to avoid nesting Pressables which can cause issues with accessibility and events
      // The press logic is handled inside HabitItem component now via onPressDetail
      <View style={styles.itemWrapper}>
        <HabitItem 
          item={itemForDisplay}
          onToggle={() => handleToggleHabit(item)}
          onPressDetail={() => openModal(item)} // Pass the openModal function here
        />
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView 
        contentContainerStyle={{ 
            paddingTop: insets.top + 80, 
            paddingBottom: insets.bottom + 100,
            paddingHorizontal: theme.spacing.m,
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
          <View style={{ flex: 1, marginRight: 10 }}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={[{ id: 'all', name: 'Wszystkie', icon: 'layer-group' }, ...folders]}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingVertical: 5 }}
              renderItem={({ item }) => {
                const isSelected = selectedFolder === (item.id === 'all' ? 'all' : item.name);
                return (
                  <TouchableOpacity
                    style={[
                      styles.folderItem,
                      isSelected && styles.folderItemSelected
                    ]}
                    onPress={() => setSelectedFolder(item.id === 'all' ? 'all' : item.name)}
                    accessible={true}
                    accessibilityLabel={`Filtruj po folderze: ${item.name}`}
                    accessibilityRole="button"
                  >
                    <FontAwesome5 
                      name={item.icon || 'folder'} 
                      size={20} 
                      color={isSelected ? '#fff' : theme.colors.text} 
                    />
                  </TouchableOpacity>
                );
              }}
            />
          </View>
          <Pressable 
            style={({ pressed }) => [styles.addButtonContainer, {transform: [{ scale: pressed ? 0.85 : 1 }]}]} 
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

        <View style={styles.dateRowContainer}>
          <View style={styles.subtitleContainer}>
            <Text style={styles.subtitleText} accessibilityRole="header">Dzisiejsze</Text>
          </View>
          <View style={styles.dateContainer}>
            <Text style={styles.dateText} accessibilityLabel={`Data: ${formattedDate}`}>{formattedDate}</Text>
          </View>
        </View>

        <View style={styles.listContainer}>
          <FlatList
            data={todayHabits}
            keyExtractor={(item) => item.id}
            renderItem={renderHabitItem}
            ListEmptyComponent={
              <Text style={styles.emptyText} accessible={true}>Brak nawyków na dziś w tym folderze.</Text>
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
              <Text style={styles.emptyText} accessible={true}>Brak nawyków w tym folderze.</Text>
            }
            scrollEnabled={false}
          />
        </View>

        <AddFolderModal visible={isFolderModalVisible} onClose={() => setIsFolderModalVisible(false)} defaultFolderType="habit"/>

        <HabitDetailModal 
          visible={modalVisible}
          habit={selectedHabit}
          onClose={() => setModalVisible(false)}
          onEdit={handleEdit}     // Fixed prop name
          onDelete={handleDelete} // Fixed prop name
        />

      </ScrollView>
    </View>
  );
};
export default HabitsScreen;