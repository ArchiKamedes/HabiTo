import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, ScrollView, FlatList, Pressable} from 'react-native';
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

  // --- Funkcje obsługi ---
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

  //dodawania podzadania
  const handleAddSubtask = () => {
    if (newSubtaskText.trim() === '') return; 
    setSubtasks([...subtasks, { id: Date.now().toString(), text: newSubtaskText.trim(), completed: false }]);
    setNewSubtaskText(''); 
  };

  const [editingSubtaskId, setEditingSubtaskId] = useState(null);
  // Stan przechowujący tymczasowy tekst podczas edycji
  const [editingText, setEditingText] = useState('');

  // --- Funkcja USUWANIA ---
  const handleDeleteSubtask = (id) => {
    setSubtasks(subtasks.filter(item => item.id !== id));
  };

  // --- Funkcja ROZPOCZĘCIA edycji ---
  const startEditing = (item) => {
    setEditingSubtaskId(item.id); // Włącz tryb edycji dla tego ID
    setEditingText(item.text);    // Wpisz obecny tekst do edytora
  };

  // --- Funkcja ZAPISANIA edycji ---
  const saveEdit = () => {
    setSubtasks(subtasks.map(item => {
      if (item.id === editingSubtaskId) {
        return { ...item, text: editingText }; // Zaktualizuj tekst
      }
      return item;
    }));
    setEditingSubtaskId(null); // Wyłącz tryb edycji
    setEditingText('');
  };

  const [isColorModalVisible, setIsColorModalVisible] = useState(false);

  // Funkcja "Utwórz" 
  const handleCreateTask = async () => {
    const user = auth.currentUser; // 1. Pobierz zalogowanego użytkownika

    // 2. Sprawdź, czy użytkownik jest zalogowany i czy nazwa zadania nie jest pusta
    if (!user || taskName.trim() === '') {
      console.log("Użytkownik nie jest zalogowany lub nazwa zadania jest pusta.");
      return; // Zatrzymaj funkcję
    }

    // 3. Stwórz obiekt zadania (masz to już zrobione)
    const newTask = {
      name: taskName, // Użyj 'name' zamiast 'taskName' dla spójności z modelem
      icon: icon,
      color: color,
      folder: folder, // W przyszłości to będzie ID folderu
      subtasks: subtasks,
      dueDate: date, // Przechowuje całą datę i godzinę
      reminder: reminder,
      priority: priority,
      completed: false, // Domyślnie nowe zadanie jest nieukończone
      createdAt: serverTimestamp(), // Użyj daty serwera Firebase
      userId: user.uid // Dołącz ID użytkownika do zadania
    };

    try {
      // 4. Stwórz referencję do podkolekcji 'tasks' tego użytkownika
      const tasksCollectionRef = collection(db, 'users', user.uid, 'tasks');
      
      // 5. Dodaj nowy dokument (zadanie) do tej podkolekcji
      await addDoc(tasksCollectionRef, newTask);
      
      console.log("ZADANIE DODANE DO FIREBASE!");

      // 6. Zamknij okno (modal) po sukcesie
      navigation.goBack(); 

    } catch (error) {
      console.error("Błąd podczas dodawania zadania: ", error);
      // Tutaj możesz pokazać użytkownikowi jakiś alert o błędzie
    }
  };

  const priorities = [
    { level: 1, color: theme.colors.inactive, name: 'Niski' },
    { level: 2, color: '#FFA500', name: 'Średni' }, 
    { level: 3, color: '#FF4500', name: 'Wysoki' },
    { level: 4, color: '#DC143C', name: 'Pilny' }, 
  ];

  const iconColor = [

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
        />
      </View>

      <View style={styles.formContainer}>
        
        <TouchableOpacity style={styles.row}>
          <FontAwesome5 name={icon} size={24} color={theme.colors.text} style={styles.icon} />
          <Text style={styles.label}>Ikona</Text>
          <Text style={styles.valueText}>{icon}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.row} 
          onPress={() => setIsColorModalVisible(true)} 
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
          <View style={styles.row}> 
            <Ionicons name="folder-outline" size={24} color={theme.colors.text} style={styles.icon} />
            <Text style={styles.label}>Folder</Text>
            <Text style={styles.valueText}>{folder}</Text>
          </View>
        </ModalDropdown>

        <View style={styles.subtaskSection}>
          <View style={styles.row}>
            <Ionicons name="checkmark-done-outline" size={24} color={theme.colors.text} style={styles.icon} />
            <Text style={styles.label}>Podzadania</Text>
          </View>

          {/* LISTA PODZADAŃ */}
          {subtasks.map((item) => (
            <View key={item.id} style={styles.subtaskRowItem}>
              
              {/* CZY JESTEŚMY W TRYBIE EDYCJI TEGO KONKRETNEGO ELEMENTU? */}
              {editingSubtaskId === item.id ? (
                // --- TRYB EDYCJI ---
                <>
                  <TextInput 
                    style={[styles.subtaskInput, styles.editInput]} 
                    value={editingText}
                    onChangeText={setEditingText}
                    autoFocus={true} // Automatycznie ustaw kursor
                  />
                  <TouchableOpacity onPress={saveEdit} style={styles.actionButton}>
                    <Ionicons name="checkmark-circle" size={26} color={theme.colors.primary} />
                  </TouchableOpacity>
                </>
              ) : (
                // --- TRYB WYŚWIETLANIA ---
                <>
                  <Text style={styles.subtaskText}>→ {item.text}</Text>
                  
                  <View style={styles.actionsContainer}>
                    {/* Przycisk Edytuj */}
                    <TouchableOpacity onPress={() => startEditing(item)} style={styles.actionButton}>
                      <Ionicons name="pencil" size={20} color={theme.colors.inactive} />
                    </TouchableOpacity>
                    {/* Przycisk Usuń */}
                    <TouchableOpacity onPress={() => handleDeleteSubtask(item.id)} style={styles.actionButton}>
                      <Ionicons name="trash" size={20} color="#FF4500" />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          ))}

          {/* Input do dodawania NOWYCH (Twój stary kod) */}
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

        <TouchableOpacity style={styles.row} onPress={() => setShowDatePicker(true)}>
          <Ionicons name="calendar-outline" size={24} color={theme.colors.text} style={styles.icon} />
          <Text style={styles.label}>Termin wykonania</Text>
          <Text style={styles.valueText}>{date.toLocaleDateString('pl-PL')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={() => setShowTimePicker(true)}>
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
          <View style={styles.row}>
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
              <Pressable key={p.level} onPress={() => setPriority(p.level)}>
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

      <Pressable style={styles.createButton} onPress={handleCreateTask}>
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
    justifyContent: 'space-between', // Rozsuwa tekst i przyciski
    paddingVertical: theme.spacing.s,
    paddingLeft: theme.spacing.m,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  // Styl tekstu podzadania
  subtaskText: {
    flex: 1, // Zajmuje dostępne miejsce
    fontSize: 16,
    color: theme.colors.text,
    fontFamily: 'TitilliumWeb_400Regular',
  },
  // Kontener na przyciski (Edytuj / Usuń)
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Pojedynczy przycisk akcji
  actionButton: {
    padding: 5,
    marginLeft: 5,
  },
  // Styl inputa podczas edycji (żeby się wyróżniał)
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