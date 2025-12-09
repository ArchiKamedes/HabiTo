import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, ScrollView, Pressable } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import ModalDropdown from 'react-native-modal-dropdown';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import ColorPickerModal from '../components/ColorPickerModal';

const TaskAddScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const insets = useSafeAreaInsets();

  const [taskName, setTaskName] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [icon, setIcon] = useState('briefcase');
  const [color, setColor] = useState(theme.colors.primary);
  const [folder, setFolder] = useState('Studia');
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [reminder, setReminder] = useState('Nie przypominaj');
  const [priority, setPriority] = useState(1);
  const [editingSubtaskId, setEditingSubtaskId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [isColorModalVisible, setIsColorModalVisible] = useState(false);

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

  const handleCreateTask = async () => {
    const user = auth.currentUser;

    if (!user || taskName.trim() === '') {
      return;
    }

    const newTask = {
      name: taskName,
      icon: icon,
      color: color,
      folder: folder,
      subtasks: subtasks,
      dueDate: date,
      reminder: reminder,
      priority: priority,
      completed: false,
      createdAt: serverTimestamp(),
      userId: user.uid
    };

    try {
      const tasksCollectionRef = collection(db, 'users', user.uid, 'tasks');
      await addDoc(tasksCollectionRef, newTask);
      navigation.goBack();

    } catch (error) {
      console.error(error);
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
          accessibilityLabel="Nazwa zadania"
          accessibilityHint="Wpisz nazwę nowego zadania"
        />
      </View>

      <View style={styles.formContainer}>

        <TouchableOpacity 
          style={styles.row}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Ikona zadania: ${icon}`}
        >
          <FontAwesome5 name={icon} size={24} color={theme.colors.text} style={styles.icon} />
          <Text style={styles.label}>Ikona</Text>
          <Text style={styles.valueText}>{icon}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.row}
          onPress={() => setIsColorModalVisible(true)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Zmień kolor zadania"
          accessibilityHint={`Aktualny kolor to ${color}`}
        >
          <View style={[styles.colorCircle, { backgroundColor: color }]} />
          <Text style={styles.label}>Kolor</Text>
          <Text style={styles.valueText}>Zmień</Text>
        </TouchableOpacity>

        <ModalDropdown
          options={['Studia', 'Praca', 'Dom', 'Zakupy']}
          defaultIndex={0}
          defaultValue={folder}
          onSelect={(index, value) => setFolder(value)}
          dropdownStyle={styles.dropdownList}
          dropdownTextStyle={styles.dropdownText}
        >
          <View 
            style={styles.row}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Folder zadania: ${folder}`}
            accessibilityHint="Kliknij dwukrotnie, aby zmienić folder"
          >
            <Ionicons name="folder-outline" size={24} color={theme.colors.text} style={styles.icon} />
            <Text style={styles.label}>Folder</Text>
            <Text style={styles.valueText}>{folder}</Text>
          </View>
        </ModalDropdown>

        <View style={styles.subtaskSection}>
          <View style={styles.row} accessible={true} accessibilityRole="header">
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
                  <TouchableOpacity 
                    onPress={saveEdit} 
                    style={styles.actionButton}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Zapisz zmiany w podzadaniu"
                  >
                    <Ionicons name="checkmark-circle" size={26} color={theme.colors.primary} />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.subtaskText}>→ {item.text}</Text>

                  <View style={styles.actionsContainer}>
                    <TouchableOpacity 
                      onPress={() => startEditing(item)} 
                      style={styles.actionButton}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`Edytuj podzadanie: ${item.text}`}
                    >
                      <Ionicons name="pencil" size={20} color={theme.colors.inactive} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => handleDeleteSubtask(item.id)} 
                      style={styles.actionButton}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`Usuń podzadanie: ${item.text}`}
                    >
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
              accessibilityLabel="Wpisz treść nowego podzadania"
            />
            <Pressable 
              onPress={handleAddSubtask} 
              style={styles.addSubtaskButton}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Dodaj podzadanie do listy"
            >
              <Ionicons name="add-circle" size={30} color={theme.colors.primary} />
            </Pressable>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.row} 
          onPress={() => setShowDatePicker(true)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Data wykonania: ${date.toLocaleDateString('pl-PL')}`}
          accessibilityHint="Kliknij dwukrotnie, aby zmienić datę"
        >
          <Ionicons name="calendar-outline" size={24} color={theme.colors.text} style={styles.icon} />
          <Text style={styles.label}>Termin wykonania</Text>
          <Text style={styles.valueText}>{date.toLocaleDateString('pl-PL')}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.row} 
          onPress={() => setShowTimePicker(true)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Godzina wykonania: ${date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}`}
          accessibilityHint="Kliknij dwukrotnie, aby zmienić godzinę"
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
            accessibilityRole="button"
            accessibilityLabel={`Przypomnienie: ${reminder}`}
            accessibilityHint="Kliknij dwukrotnie, aby zmienić opcje przypomnienia"
          >
            <Ionicons name="notifications-outline" size={24} color={theme.colors.text} style={styles.icon} />
            <Text style={styles.label}>Przypomnij</Text>
            <Text style={styles.valueText}>{reminder}</Text>
          </View>
        </ModalDropdown>

        <View style={styles.row}>
          <Ionicons name="bookmark-outline" size={24} color={theme.colors.text} style={styles.icon} />
          <Text style={styles.label} accessible={true}>Priorytet</Text>
          <View 
            style={styles.priorityContainer}
            accessible={true}
            accessibilityRole="radiogroup"
            accessibilityLabel="Wybierz priorytet zadania"
          >
            {priorities.map((p) => (
              <Pressable 
                key={p.level} 
                onPress={() => setPriority(p.level)}
                accessible={true}
                accessibilityRole="radio"
                accessibilityLabel={`Priorytet ${p.name}`}
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
        onPress={handleCreateTask}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Utwórz zadanie"
        accessibilityHint="Zapisuje nowe zadanie i wraca do poprzedniego ekranu"
      >
        <Text style={styles.createButtonText}>Utwórz</Text>
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
    height: 30,
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
    width: '80%',
    maxHeight: 200,
    borderColor: theme.colors.border,
    borderWidth: 2,
    borderRadius: 8,
    marginTop: -40,
  },
  dropdownText: {
    fontSize: 18,
    color: theme.colors.text,
    padding: theme.spacing.s,
    borderRadius: 8,
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