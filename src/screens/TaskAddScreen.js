import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  Platform, ScrollView, FlatList, Pressable // Dodajemy ScrollView, FlatList, Pressable
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FontAwesome5, Ionicons } from '@expo/vector-icons'; // Dodajemy ikony
import ModalDropdown from 'react-native-modal-dropdown'; // Import dropdownu

const TaskAddScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const insets = useSafeAreaInsets();

  // --- Stany (nasze "szufladki") ---
  const [taskName, setTaskName] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // 👇 NOWE STANY 👇
  const [icon, setIcon] = useState('briefcase'); // Domyślna ikona (z FontAwesome5)
  const [color, setColor] = useState(theme.colors.primary); // Domyślny kolor
  const [folder, setFolder] = useState('Studia'); // Domyślny folder
  const [subtasks, setSubtasks] = useState([]); // Lista podzadań
  const [newSubtaskText, setNewSubtaskText] = useState(''); // Tekst nowego podzadania
  const [reminder, setReminder] = useState('Nie przypominaj');
  const [priority, setPriority] = useState(1); // Domyślny priorytet (1-4)

  // --- Funkcje obsługi ---
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios'); // Na iOS zostawiamy otwarte
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

  //dodawania podzadania
  const handleAddSubtask = () => {
    if (newSubtaskText.trim() === '') return; // Nie dodawaj pustych
    setSubtasks([...subtasks, { id: Date.now().toString(), text: newSubtaskText.trim(), completed: false }]);
    setNewSubtaskText(''); // Wyczyść input
  };

  // Funkcja "Utwórz" (na razie tylko konsola)
  const handleCreateTask = () => {
    const newTask = {
      taskName,
      icon,
      color,
      folder,
      subtasks,
      dueDate: date,
      reminder,
      priority,
    };
    console.log("NOWE ZADANIE:", JSON.stringify(newTask, null, 2));
    // navigation.goBack(); // W przyszłości zamknie modal
  };

  const priorities = [
    { level: 1, color: theme.colors.inactive, name: 'Niski' },
    { level: 2, color: '#FFA500', name: 'Średni' }, // Orange
    { level: 3, color: '#FF4500', name: 'Wysoki' }, // Red-Orange
    { level: 4, color: '#DC143C', name: 'Pilny' }, // Crimson Red
  ];

  return (
    <ScrollView style={[styles.screenContainer]}>
      
      {/* Nagłówek */}
      <View style={styles.header}>
        <TextInput
          style={styles.titleInput}
          placeholder="Nazwa Zadania"
          placeholderTextColor={theme.colors.placeholderText}
          value={taskName}
          onChangeText={setTaskName}
        />
      </View>

      <View style={styles.formContainer}>
        
        {/* --- Ikona --- */}
        <TouchableOpacity style={styles.row}>
          <FontAwesome5 name={icon} size={24} color={theme.colors.text} style={styles.icon} />
          <Text style={styles.label}>Ikona</Text>
          <Text style={styles.valueText}>{icon}</Text>
        </TouchableOpacity>

        {/* --- Kolor --- */}
        <TouchableOpacity style={styles.row}>
          <View style={[styles.colorCircle, { backgroundColor: color }]} />
          <Text style={styles.label}>Kolor</Text>
          <Text style={styles.valueText}>Wybierz</Text>
        </TouchableOpacity>

        {/* --- Folder --- */}
        <ModalDropdown
          options={['Studia', 'Praca', 'Dom', 'Zakupy']}
          defaultIndex={0}
          defaultValue={folder}
          onSelect={(index, value) => setFolder(value)}         
          dropdownStyle={styles.dropdownList}
          dropdownTextStyle={styles.dropdownText}
        >
          <View style={styles.row}> 
            <Ionicons name="folder-outline" size={24} color={theme.colors.text} style={styles.icon} />
            <Text style={styles.label}>Folder</Text>
            <Text style={styles.valueText}>{folder}</Text>
          </View>
        </ModalDropdown>

        {/* --- Podzadania --- */}
        <View style={styles.subtaskSection}>
          <View style={styles.row}>
            <Ionicons name="checkmark-done-outline" size={24} color={theme.colors.text} style={styles.icon} />
            <Text style={styles.label}>Podzadania</Text>
          </View>
          <FlatList
            data={subtasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Text style={styles.subtaskItem}>→ {item.text}</Text>
            )}
          />
          <View style={styles.inputRow}>
            <TextInput
              style={styles.subtaskInput}
              placeholder="Dodaj podzadanie..."
              placeholderTextColor={theme.colors.inactive}
              value={newSubtaskText}
              onChangeText={setNewSubtaskText}
            />
            <Pressable onPress={handleAddSubtask} style={styles.addSubtaskButton}>
              <Ionicons name="add-circle" size={30} color={theme.colors.primary} />
            </Pressable>
          </View>
        </View>

        {/* --- Termin wykonania --- */}
        <TouchableOpacity style={styles.row} onPress={() => setShowDatePicker(true)}>
          <Ionicons name="calendar-outline" size={24} color={theme.colors.text} style={styles.icon} />
          <Text style={styles.label}>Termin wykonania</Text>
          <Text style={styles.valueText}>{date.toLocaleDateString('pl-PL')}</Text>
        </TouchableOpacity>

        {/* --- Godzina --- */}
        <TouchableOpacity style={styles.row} onPress={() => setShowTimePicker(true)}>
          <Ionicons name="time-outline" size={24} color={theme.colors.text} style={styles.icon} />
          <Text style={styles.label}>Godzina</Text>
          <Text style={styles.valueText}>{date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</Text>
        </TouchableOpacity>

        {/* --- Przypomnienia --- */}
        <ModalDropdown
          options={['Nie przypominaj', 'Codziennie', 'Co drugi dzień', 'Dzień przed', 'Dzień oddania']}
          defaultIndex={0}
          defaultValue={reminder}
          onSelect={(index, value) => setReminder(value)}       
          dropdownStyle={styles.dropdownList}
          dropdownTextStyle={styles.dropdownText}
        >
          <View style={styles.row}>
            <Ionicons name="notifications-outline" size={24} color={theme.colors.text} style={styles.icon} />
            <Text style={styles.label}>Przypomnij</Text>
            <Text style={styles.valueText}>{reminder}</Text>
          </View>
        </ModalDropdown>

        {/* --- Priorytet --- */}
        <View style={styles.row}>
          <Ionicons name="bookmark-outline" size={24} color={theme.colors.text} style={styles.icon} />
          <Text style={styles.label}>Priorytet</Text>
          <View style={styles.priorityContainer}>
            {priorities.map((p) => (
              <Pressable key={p.level} onPress={() => setPriority(p.level)}>
                <FontAwesome5 
                  name="bookmark" 
                  size={30} 
                  color={p.color} 
                  solid={priority === p.level} // Wypełnia ikonę, jeśli jest aktywna
                  style={priority === p.level ? styles.prioritySelected : styles.priorityNormal}
                />
              </Pressable>
            ))}
          </View>
        </View>

      </View>

      {/* --- Przycisk Utwórz --- */}
      <Pressable style={styles.createButton} onPress={handleCreateTask}>
        <Text style={styles.createButtonText}>Utwórz</Text>
      </Pressable>

        <View style={styles.bottomBar}></View>
      {/* --- Ukryte Pickery (iOS) --- */}
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
      {/* --- Pickery (Android) --- */}
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

    </ScrollView>


  );
};

// --- Style ---
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
  rowContent: { // Używane wewnątrz ModalDropdown
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: theme.spacing.m,
  },
  label: {
    flex: 1, // Powoduje, że label zajmuje resztę miejsca
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
    height: 200,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 8,
  },
  dropdownText: {
    fontSize: 18,
    color: theme.colors.text,
    padding: theme.spacing.m,
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