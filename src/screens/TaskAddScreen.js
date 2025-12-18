import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, ScrollView, Pressable, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FontAwesome5, Ionicons } from '@expo/vector-icons'; 
import ModalDropdown from 'react-native-modal-dropdown'; 
import { collection, addDoc, serverTimestamp, doc, updateDoc, query, where, onSnapshot, Timestamp, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import ColorPickerModal from '../components/ColorPickerModal';
import AddFolderModal from '../components/AddFolderModal';

const TaskAddScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const insets = useSafeAreaInsets();
  const user = auth.currentUser;

  const { taskToEdit } = route.params || {};
  const isEditing = !!taskToEdit;

  const [taskName, setTaskName] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [icon, setIcon] = useState('briefcase');
  const [color, setColor] = useState(theme.colors.primary); 
  
  const [folder, setFolder] = useState(''); 
  const [availableFolders, setAvailableFolders] = useState([]); 
  const [isFolderModalVisible, setIsFolderModalVisible] = useState(false);

  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskText, setNewSubtaskText] = useState(''); 
  const [reminder, setReminder] = useState('Nie przypominaj');
  const [priority, setPriority] = useState(1); 

  const [editingSubtaskId, setEditingSubtaskId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [isColorModalVisible, setIsColorModalVisible] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'TaskFolders'), 
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const foldersData = snapshot.docs.map(doc => doc.data().name);
      setAvailableFolders(foldersData);

      if (foldersData.length === 0) {
        Alert.alert(
          "Brak folderów",
          "Aby stworzyć zadanie, musisz najpierw utworzyć folder (kategorię).",
          [{ text: "OK", onPress: () => setIsFolderModalVisible(true) }]
        );
      } else {
        if (!isEditing && !folder) {
            setFolder(foldersData[0]);
        }
      }
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (isEditing && taskToEdit) {
      setTaskName(taskToEdit.name || taskToEdit.text || '');
      setIcon(taskToEdit.icon || 'briefcase');
      setColor(taskToEdit.color || theme.colors.primary);
      setFolder(taskToEdit.folder || '');
      setSubtasks(taskToEdit.subtasks || []);
      setReminder(taskToEdit.reminder || 'Nie przypominaj');
      setPriority(taskToEdit.priority || 1);
      
      if (taskToEdit.dueDate) {
        setDate(taskToEdit.dueDate.toDate ? taskToEdit.dueDate.toDate() : new Date(taskToEdit.dueDate));
      }
    }
  }, [isEditing, taskToEdit]);

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios'); 
    if (event.type === 'set' && selectedDate) {
      setDate(selectedDate);
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (event.type === 'set' && selectedTime) {
      setDate(selectedTime);
    }
  };

  const handleAddSubtask = () => {
    if (newSubtaskText.trim() === '') return; 
    setSubtasks([...subtasks, { id: Date.now().toString(), text: newSubtaskText.trim(), completed: false }]);
    setNewSubtaskText(''); 
  };

  const handleDeleteSubtask = (id) => {
    setSubtasks(subtasks.filter(item => item.id !== id));
  };

  const startEditing = (item) => {
    setEditingSubtaskId(item.id); 
    setEditingText(item.text);    
  };

  const saveEdit = () => {
    setSubtasks(subtasks.map(item => {
      if (item.id === editingSubtaskId) {
        return { ...item, text: editingText }; 
      }
      return item;
    }));
    setEditingSubtaskId(null); 
    setEditingText('');
  };

  const handleSaveTask = async () => {
    if (availableFolders.length === 0) {
        Alert.alert("Brak folderów", "Najpierw utwórz folder!");
        setIsFolderModalVisible(true);
        return;
    }
    if (!folder) {
        Alert.alert("Wybierz folder", "Folder jest wymagany.");
        return;
    }

    if (!user || taskName.trim() === '') {
      Alert.alert("Błąd", "Podaj nazwę zadania.");
      return; 
    }

    const newTaskData = {
      name: taskName, 
      text: taskName,
      icon: icon,
      color: color,
      folder: folder, 
      subtasks: subtasks,
      dueDate: Timestamp.fromDate(date), 
      reminder: reminder,
      priority: priority,
      userId: user.uid,
      ...(isEditing ? {} : {
        completed: false,
        createdAt: serverTimestamp(), 
      })
    };

    try {
      if (isEditing) {
          const taskRef = doc(db, 'users', user.uid, 'tasks', taskToEdit.id);
          await updateDoc(taskRef, newTaskData);
      } else {
          const tasksCollectionRef = collection(db, 'users', user.uid, 'tasks');
          await addDoc(tasksCollectionRef, newTaskData);
      }
      navigation.goBack(); 

    } catch (error) {
      console.error("Błąd zapisu:", error);
      Alert.alert("Błąd", "Nie udało się zapisać zadania.");
    }
  };

  const priorities = [
    { level: 1, color: theme.colors.inactive, name: 'Niski' },
    { level: 2, color: '#FFA500', name: 'Średni' }, 
    { level: 3, color: '#FF4500', name: 'Wysoki' },
    { level: 4, color: '#DC143C', name: 'Pilny' }, 
  ];

  return (
    <ScrollView style={[styles.screenContainer]}>
      
      <View style={styles.header}>
        <TextInput
          style={styles.titleInput}
          placeholder="Nazwa Zadania"
          placeholderTextColor={theme.colors.placeholderText}
          value={taskName}
          onChangeText={setTaskName}
          accessible={true}
          accessibilityLabel="Pole nazwy zadania"
        />
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          accessible={true}
          accessibilityLabel="Anuluj i wróć"
          accessibilityRole="button"
        >
          <Ionicons name="close-circle" size={30} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        
        <TouchableOpacity 
          style={styles.row}
          accessible={true}
          accessibilityLabel={`Ikona zadania: ${icon}`}
          accessibilityRole="button"
        >
          <FontAwesome5 name={icon} size={24} color={theme.colors.text} style={styles.icon} />
          <Text style={styles.label}>Ikona</Text>
          <Text style={styles.valueText}>{icon}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.row} 
          onPress={() => setIsColorModalVisible(true)} 
          accessible={true}
          accessibilityLabel={`Kolor zadania. Aktualny: ${color}`}
          accessibilityHint="Kliknij, aby zmienić kolor"
          accessibilityRole="button"
        >
          <View style={[styles.colorCircle, { backgroundColor: color }]} />
          <Text style={styles.label}>Kolor</Text>
          <Text style={styles.valueText}>Zmień</Text> 
        </TouchableOpacity>

        <ModalDropdown
          options={availableFolders.length > 0 ? availableFolders : ['Brak folderów']}
          defaultIndex={0}
          defaultValue={folder || (availableFolders.length > 0 ? availableFolders[0] : 'Brak folderów')}
          onSelect={(index, value) => {
             if (availableFolders.length > 0) setFolder(value);
          }}
          dropdownStyle={styles.dropdownList}
          dropdownTextStyle={styles.dropdownText}
          disabled={availableFolders.length === 0}
        >
          <View 
            style={styles.row}
            accessible={true}
            accessibilityLabel={`Folder: ${folder || 'Brak'}. Kliknij aby zmienić.`}
            accessibilityRole="button"
          > 
            <Ionicons name="folder-outline" size={24} color={theme.colors.text} style={styles.icon} />
            <Text style={styles.label}>Folder</Text>
            
            {availableFolders.length === 0 ? (
                <Text style={[styles.valueText, {color: '#FF4500'}]}>Utwórz folder!</Text>
            ) : (
                <Text style={styles.valueText}>{folder || 'Wybierz'}</Text>
            )}

            <TouchableOpacity 
                style={{marginLeft: 10}} 
                onPress={(e) => {
                    e.stopPropagation();
                    setIsFolderModalVisible(true);
                }}
            >
                <Ionicons name="add-circle" size={26} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </ModalDropdown>

        <View style={styles.subtaskSection}>
          <View style={styles.row}>
            <Ionicons name="checkmark-done-outline" size={24} color={theme.colors.text} style={styles.icon} />
            <Text style={styles.label}>Podzadania</Text>
          </View>

          {subtasks.map((item) => (
            <View key={item.id} style={styles.subtaskRowItem}>
              {editingSubtaskId === item.id ? (
                <>
                  <TextInput 
                    style={[styles.subtaskInput, styles.editInput]} 
                    value={editingText}
                    onChangeText={setEditingText}
                    autoFocus={true} 
                    accessible={true}
                    accessibilityLabel="Edytuj treść podzadania"
                  />
                  <TouchableOpacity onPress={saveEdit} style={styles.actionButton}>
                    <Ionicons name="checkmark-circle" size={26} color={theme.colors.primary} />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.subtaskText}>→ {item.text}</Text>
                  <View style={styles.actionsContainer}>
                    <TouchableOpacity onPress={() => startEditing(item)} style={styles.actionButton}>
                      <Ionicons name="pencil" size={20} color={theme.colors.inactive} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteSubtask(item.id)} style={styles.actionButton}>
                      <Ionicons name="trash" size={20} color="#FF4500" />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          ))}

          <View style={styles.inputRow}>
            <TextInput
              style={styles.subtaskInput}
              placeholder="Dodaj podzadanie..."
              placeholderTextColor={theme.colors.inactive}
              value={newSubtaskText}
              onChangeText={setNewSubtaskText}
              accessible={true}
              accessibilityLabel="Nowe podzadanie"
            />
            <Pressable 
                onPress={handleAddSubtask} 
                style={styles.addSubtaskButton}
                accessible={true}
                accessibilityLabel="Dodaj podzadanie"
                accessibilityRole="button"
            >
              <Ionicons name="add-circle" size={30} color={theme.colors.primary} />
            </Pressable>
          </View>
        </View>

        <TouchableOpacity 
            style={styles.row} 
            onPress={() => setShowDatePicker(true)}
            accessible={true}
            accessibilityLabel={`Data wykonania: ${date.toLocaleDateString('pl-PL')}`}
            accessibilityRole="button"
        >
          <Ionicons name="calendar-outline" size={24} color={theme.colors.text} style={styles.icon} />
          <Text style={styles.label}>Termin wykonania</Text>
          <Text style={styles.valueText}>{date.toLocaleDateString('pl-PL')}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
            style={styles.row} 
            onPress={() => setShowTimePicker(true)}
            accessible={true}
            accessibilityLabel={`Godzina wykonania: ${date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}`}
            accessibilityRole="button"
        >
          <Ionicons name="time-outline" size={24} color={theme.colors.text} style={styles.icon} />
          <Text style={styles.label}>Godzina</Text>
          <Text style={styles.valueText}>{date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</Text>
        </TouchableOpacity>

        <ModalDropdown
          options={['Nie przypominaj', 'Codziennie', 'Co drugi dzień', 'Dzień przed', 'Dzień oddania']}
          defaultIndex={0}
          defaultValue={reminder}
          onSelect={(index, value) => setReminder(value)}        
          dropdownStyle={styles.dropdownList}
          dropdownTextStyle={styles.dropdownText}
        >
          <View 
            style={styles.row}
            accessible={true}
            accessibilityLabel={`Przypomnienie: ${reminder}`}
            accessibilityRole="button"
          >
            <Ionicons name="notifications-outline" size={24} color={theme.colors.text} style={styles.icon} />
            <Text style={styles.label}>Przypomnij</Text>
            <Text style={styles.valueText}>{reminder}</Text>
          </View>
        </ModalDropdown>

        <View style={styles.row}>
          <Ionicons name="bookmark-outline" size={24} color={theme.colors.text} style={styles.icon} />
          <Text style={styles.label}>Priorytet</Text>
          <View style={styles.priorityContainer}>
            {priorities.map((p) => (
              <Pressable 
                key={p.level} 
                onPress={() => setPriority(p.level)}
                accessible={true}
                accessibilityLabel={`Priorytet ${p.name}`}
                accessibilityRole="button"
                accessibilityState={{ selected: priority === p.level }}
              >
                <FontAwesome5 
                  name="bookmark" 
                  size={30} 
                  color={p.color} 
                  solid={priority === p.level} 
                  style={priority === p.level ? styles.prioritySelected : styles.priorityNormal}
                />
              </Pressable>
            ))}
          </View>
        </View>

      </View>

      <Pressable 
        style={styles.createButton} 
        onPress={handleSaveTask}
        accessible={true}
        accessibilityLabel={isEditing ? "Zapisz zmiany" : "Utwórz zadanie"}
        accessibilityRole="button"
      >
        <Text style={styles.createButtonText}>{isEditing ? "Zapisz" : "Utwórz"}</Text>
      </Pressable>

        <View style={styles.bottomBar}></View>

      {Platform.OS === 'ios' && showDatePicker && (
        <DateTimePicker
          value={date}
          mode={'date'}
          display="spinner"
          onChange={onDateChange}
        />
      )}
      {Platform.OS === 'ios' && showTimePicker && (
        <DateTimePicker
          value={date}
          mode={'time'}
          display="spinner"
          onChange={onTimeChange}
        />
      )}

      {Platform.OS === 'android' && showDatePicker && (
        <DateTimePicker
          value={date}
          mode={'date'}
          display="default"
          onChange={onDateChange}
        />
      )}
      {Platform.OS === 'android' && showTimePicker && (
        <DateTimePicker
          value={date}
          mode={'time'}
          display="default"
          onChange={onTimeChange}
        />
      )}

      <ColorPickerModal
        visible={isColorModalVisible}
        onClose={() => setIsColorModalVisible(false)}
        onSelectColor={(selectedColor) => setColor(selectedColor)} 
        selectedColor={color} 
      />

      <AddFolderModal 
        visible={isFolderModalVisible}
        onClose={() => setIsFolderModalVisible(false)}
        type="task" 
      />

    </ScrollView>
  );
};

const getStyles = (theme) => StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.primary, 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderTopColor: 'transparent', 
  },
  titleInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text2,
    fontFamily: 'TitilliumWeb_700Bold',
  },
    bottomBar: {
    backgroundColor: theme.colors.primary, 
    height:30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopColor: 'transparent', 
  },
  formContainer: {
    paddingHorizontal: theme.spacing.m,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  rowContent: { 
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: theme.spacing.m,
  },
  label: {
    flex: 1, 
    fontSize: 18,
    color: theme.colors.text,
    fontFamily: 'TitilliumWeb_400Regular',
  },
  valueText: {
    fontSize: 16,
    color: theme.colors.inactive,
    fontFamily: 'TitilliumWeb_400Regular',
  },
  colorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dropdownList: {
    width: 180,
    maxHeight: 200,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: -40,
    backgroundColor: theme.colors.card,
  },
  dropdownText: {
    fontSize: 18,
    color: theme.colors.text,
    padding: theme.spacing.s,
    borderRadius: 8,
    backgroundColor: theme.colors.card,
  },
  subtaskSection: {
    paddingVertical: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  subtaskItem: {
    fontSize: 16,
    color: theme.colors.text,
    paddingLeft: theme.spacing.m,
    marginTop: theme.spacing.s,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.m,
  },
  subtaskInput: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.s,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    marginRight: theme.spacing.s,
  },
  addSubtaskButton: {},
  priorityContainer: {
    flexDirection: 'row',
  },
  subtaskRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', 
    paddingVertical: theme.spacing.s,
    paddingLeft: theme.spacing.m,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  subtaskText: {
    flex: 1, 
    fontSize: 16,
    color: theme.colors.text,
    fontFamily: 'TitilliumWeb_400Regular',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 5,
    marginLeft: 5,
  },
  editInput: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.card,
  },
  priorityNormal: {
    opacity: 0.5,
    marginHorizontal: theme.spacing.s,
  },
  prioritySelected: {
    opacity: 1,
    marginHorizontal: theme.spacing.s,
  },
  createButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 25,
    padding: theme.spacing.m,
    alignItems: 'center',
    margin: theme.spacing.m,
    marginTop: theme.spacing.l,
  },
  createButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'TitilliumWeb_700Bold',
  }
});

export default TaskAddScreen;