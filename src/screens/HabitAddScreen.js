import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform, ScrollView, Pressable, Alert, Image, Modal } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import ModalDropdown from 'react-native-modal-dropdown';
import { collection, addDoc, serverTimestamp, Timestamp, doc, updateDoc, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import ColorPickerModal from '../components/ColorPickerModal';
import AddFolderModal from '../components/AddFolderModal';
import { getStyles } from '../styles/HabitAddScreen.styles';
import IconPickerModal from '../components/IconPickerModal';

const WEEKDAYS = [
  { short: 'Pn', long: 'Poniedziałek', id: 1 },
  { short: 'Wt', long: 'Wtorek', id: 2 },
  { short: 'Śr', long: 'Środa', id: 3 },
  { short: 'Czw', long: 'Czwartek', id: 4 },
  { short: 'Pt', long: 'Piątek', id: 5 },
  { short: 'Sb', long: 'Sobota', id: 6 },
  { short: 'Nd', long: 'Niedziela', id: 0 },
];

const AVAILABLE_PLANTS = [
  { id: 'cactus', name: 'Kaktus', source: require('../assets/plant00_prof.png') },
  { id: 'monstera', name: 'Monstera', source: require('../assets/plant00_prof.png') }, 
];

const HabitAddScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const insets = useSafeAreaInsets();
  
  const { habitToEdit } = route.params || {};
  const isEditing = !!habitToEdit;
  const user = auth.currentUser;

  const [habitName, setHabitName] = useState('');
  const [icon, setIcon] = useState('briefcase');
  const [color, setColor] = useState(theme.colors.primary);
  
  const [folder, setFolder] = useState(''); 
  const [availableFolders, setAvailableFolders] = useState([]); 
  const [isFolderModalVisible, setIsFolderModalVisible] = useState(false);
  const [isIconPickerVisible, setIconPickerVisible] = useState(false);

  const [timesPerDay, setTimesPerDay] = useState('1');
  const [repeatMode, setRepeatMode] = useState('Codziennie');
  const [repeatValueX, setRepeatValueX] = useState('3');
  const [selectedWeekdays, setSelectedWeekdays] = useState([]);
  const [timeMode, setTimeMode] = useState('Taka sama godzina');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timePickerTarget, setTimePickerTarget] = useState(null);
  const [sameTimes, setSameTimes] = useState([new Date()]);
  const [differentTimes, setDifferentTimes] = useState({});
  const [date, setDate] = useState(new Date());
  const [isColorModalVisible, setIsColorModalVisible] = useState(false);

  const [selectedPlantType, setSelectedPlantType] = useState('cactus');
  const [isPlantPickerVisible, setIsPlantPickerVisible] = useState(false);

  useEffect(() => {
    if (isEditing && habitToEdit) {
      setHabitName(habitToEdit.habitName || '');
      setIcon(habitToEdit.icon || 'briefcase');
      setColor(habitToEdit.color || theme.colors.primary);
      setFolder(habitToEdit.folder || '');
      setTimesPerDay(String(habitToEdit.timesPerDay || '1'));
      setRepeatMode(habitToEdit.repeatMode || 'Codziennie');
      setRepeatValueX(String(habitToEdit.repeatValueX || '3'));
      setSelectedWeekdays(habitToEdit.selectedWeekdays || []);
      setTimeMode(habitToEdit.timeMode || 'Taka sama godzina');
      setSelectedPlantType(habitToEdit.plantType || 'cactus');

      if (habitToEdit.notificationTimes) {
        if (Array.isArray(habitToEdit.notificationTimes)) {
           const convertedTimes = habitToEdit.notificationTimes.map(t => t.toDate ? t.toDate() : new Date(t));
           setSameTimes(convertedTimes);
        } else {
           const convertedDiff = {};
           Object.keys(habitToEdit.notificationTimes).forEach(key => {
             convertedDiff[key] = habitToEdit.notificationTimes[key].map(t => t.toDate ? t.toDate() : new Date(t));
           });
           setDifferentTimes(convertedDiff);
        }
      }
    }
  }, [isEditing, habitToEdit]);
  
  useEffect(() => {
    if (!isEditing) {
        if (repeatMode !== 'Wybierz dni') {
        setTimeMode('Taka sama godzina');
        }
        if (repeatMode === 'Wybierz dni') {
        const newTimes = {};
        const numTimes = parseInt(timesPerDay) || 1;
        selectedWeekdays.forEach(dayId => {
            newTimes[dayId] = Array.from({ length: numTimes }, () => new Date());
        });
        setDifferentTimes(newTimes);
        }
    }
  }, [repeatMode]);

  useEffect(() => {
    if (!isEditing) {
        const numTimes = parseInt(timesPerDay) || 1;
        setSameTimes(Array.from({ length: numTimes }, () => new Date()));
        if (repeatMode === 'Wybierz dni') {
        const newTimes = {};
        selectedWeekdays.forEach(dayId => {
            newTimes[dayId] = Array.from({ length: numTimes }, () => new Date());
        });
        setDifferentTimes(newTimes);
        }
    }
  }, [timesPerDay, repeatMode, selectedWeekdays]);

  const toggleWeekday = (dayId) => {
    const isSelected = selectedWeekdays.includes(dayId);
    let newSelectedDays = [];
    if (isSelected) {
      newSelectedDays = selectedWeekdays.filter(d => d !== dayId);
    } else {
      newSelectedDays = [...selectedWeekdays, dayId];
    }
    setSelectedWeekdays(newSelectedDays);
    const newTimes = { ...differentTimes };
    if (isSelected) {
      delete newTimes[dayId];
    } else {
      const numTimes = parseInt(timesPerDay) || 1;
      newTimes[dayId] = Array.from({ length: numTimes }, () => new Date());
    }
    setDifferentTimes(newTimes);
  };

  const handleShowTimePicker = (target) => {
    setTimePickerTarget(target);
    setShowTimePicker(true);
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (event.type === 'set' && selectedTime && timePickerTarget) {
      const { day, index } = timePickerTarget;
      if (day === null) {
        const newTimes = [...sameTimes];
        newTimes[index] = selectedTime;
        setSameTimes(newTimes);
      } else {
        const newTimes = { ...differentTimes };
        newTimes[day][index] = selectedTime;
        setDifferentTimes(newTimes);
      }
    }
  };

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'HabitsFolders'), 
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const foldersData = snapshot.docs.map(doc => doc.data().name);
      setAvailableFolders(foldersData);

      if (foldersData.length === 0) {
        Alert.alert(
          "Brak folderów",
          "Aby stworzyć nawyk, musisz najpierw utworzyć folder (kategorię).",
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
  
  const handleSaveHabit = async () => {
    if (availableFolders.length === 0) {
        Alert.alert("Brak folderów", "Najpierw utwórz folder!");
        setIsFolderModalVisible(true);
        return;
    }
    if (!folder) {
        Alert.alert("Wybierz folder", "Folder jest wymagany.");
        return;
    }

    if (!user || habitName.trim() === '') {
      Alert.alert("Błąd", "Podaj nazwę nawyku.");
      return; 
    }

    const numTimes = parseInt(timesPerDay) || 1;

    let notificationTimestamps;
    if (timeMode === 'Taka sama godzina') {
      notificationTimestamps = sameTimes.map(date => Timestamp.fromDate(date));
    } else {
      notificationTimestamps = {};
      Object.keys(differentTimes).forEach(dayId => {
        notificationTimestamps[dayId] = differentTimes[dayId].map(date => Timestamp.fromDate(date));
      });
    }

    const habitData = {
      habitName, icon, color, folder,
      timesPerDay: numTimes,
      repeatMode,
      repeatValueX: repeatMode === 'Co X dni' ? (parseInt(repeatValueX) || 1) : null,
      selectedWeekdays: repeatMode === 'Wybierz dni' ? selectedWeekdays : null,
      timeMode,
      notificationTimes: timeMode === 'Taka sama godzina' ? sameTimes : differentTimes,
      userId: user.uid,
      plantType: selectedPlantType,
      growthPoints: isEditing ? (habitToEdit.growthPoints || 0) : 0,
      lastCompletedDate: isEditing ? (habitToEdit.lastCompletedDate || null) : null,
      ...(isEditing ? {} : {
          completedDates: [],
          skippedDates: [],
          missedDates: [],
          createdAt: serverTimestamp(),
      })
    };
    
    try {
      if (isEditing) {
          const habitRef = doc(db, 'users', user.uid, 'habits', habitToEdit.id);
          await updateDoc(habitRef, habitData);
      } else {
          const habitsCollectionRef = collection(db, 'users', user.uid, 'habits');
          await addDoc(habitsCollectionRef, habitData);
      }
      navigation.goBack(); 
    } catch (error) {
      console.error(error);
    }
  };

  const renderTimePickers = (dayId) => {
    const numTimes = parseInt(timesPerDay) || 1;
    const timesArray = Array.from({ length: numTimes }, (_, i) => i);
    const times = (dayId === null) ? sameTimes : (differentTimes[dayId] || []);
    return timesArray.map((index) => (
      <TouchableOpacity 
        key={index}
        style={styles.timeButton} 
        onPress={() => handleShowTimePicker({ day: dayId, index: index })}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Godzina ${index + 1}`}
        accessibilityHint={`Aktualnie ustawiona godzina to: ${times[index] ? times[index].toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }) : 'brak'}. Kliknij, aby zmienić.`}
      >
        <Text style={styles.timeText}>
          {times[index] ? times[index].toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }) : 'Wybierz'}
        </Text>
      </TouchableOpacity>
    ));
  };

  const getSelectedPlantImage = () => {
    const plant = AVAILABLE_PLANTS.find(p => p.id === selectedPlantType);
    return plant ? plant.source : AVAILABLE_PLANTS[0].source;
  };

  const getSelectedPlantName = () => {
      const plant = AVAILABLE_PLANTS.find(p => p.id === selectedPlantType);
      return plant ? plant.name : 'Kaktus';
  };

  return (
    <ScrollView style={styles.screenContainer}>
      
      <View style={styles.header} accessible={true} accessibilityRole="header">
        <TextInput
          style={styles.titleInput}
          placeholder="Nazwa Nawyku"
          placeholderTextColor="#FFFFFF90"
          value={habitName}
          onChangeText={setHabitName}
          accessible={true}
          accessibilityLabel="Nazwa nawyku"
          accessibilityHint="Wpisz nazwę nowego nawyku"
        />
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          accessible={true}
          accessibilityLabel="Anuluj"
          accessibilityHint="Anuluje tworzenie nawyku i wraca do poprzedniego ekranu"
          accessibilityRole="button"
        >
          <Ionicons name="close-circle" size={30} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
      
        <TouchableOpacity 
          style={styles.row}
          onPress={() => setIconPickerVisible(true)}
          accessible={true}
          accessibilityLabel="Zmień ikonę nawyku"
          accessibilityHint={`Aktualnie wybrana ikona to: ${icon}. Kliknij, aby otworzyć listę ikon.`}
          accessibilityRole="button"
        >
          <View style={styles.iconCircle}>
            <FontAwesome5 name={icon} size={24} color={theme.colors.text} />
          </View>
          <Text style={styles.label}>Ikona</Text>
          <Text style={styles.valueText}>{icon}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.row} 
          onPress={() => setIsColorModalVisible(true)}
          accessible={true}
          accessibilityLabel="Zmień kolor nawyku"
          accessibilityHint={`Aktualnie wybrany kolor to: ${color}. Kliknij, aby otworzyć paletę kolorów.`}
          accessibilityRole="button"
        >
          <View style={[styles.colorCircle, { backgroundColor: color }]} />
          <Text style={styles.label}>Kolor</Text>
          <Text style={styles.valueText}>Zmień</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.row} 
          onPress={() => setIsPlantPickerVisible(true)}
          accessible={true}
          accessibilityLabel="Zmień wirtualną roślinę"
          accessibilityHint={`Aktualnie wybrana roślina to: ${getSelectedPlantName()}. Kliknij, aby zmienić.`}
          accessibilityRole="button"
        >
           <View style={[styles.iconCircle, { overflow: 'hidden' }]}>
            <Image 
                source={getSelectedPlantImage()} 
                style={{ width: 30, height: 30 }} 
                resizeMode="contain" 
            />
          </View>
          <Text style={styles.label}>Roślina</Text>
          <Text style={styles.valueText}>{getSelectedPlantName()}</Text>
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
          dropdownTextHighlightStyle={styles.dropdownTextHighlight}
          disabled={availableFolders.length === 0}
        >
          <View 
            style={styles.row}
            accessible={true}
            accessibilityLabel="Wybierz folder"
            accessibilityHint={`Aktualnie wybrany folder to: ${folder || 'Brak'}. Kliknij, aby rozwinąć listę folderów.`}
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
                style={{marginLeft: theme.spacing.s}} 
                onPress={(e) => {
                    e.stopPropagation();
                    setIsFolderModalVisible(true);
                }}
                accessible={true}
                accessibilityLabel="Utwórz nowy folder"
                accessibilityHint="Otwiera okno tworzenia nowego folderu"
                accessibilityRole="button"
            >
                <Ionicons name="add-circle" size={26} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </ModalDropdown>

        <View style={styles.row}>
          <Ionicons name="return-down-back-outline" size={24} color={theme.colors.text} style={styles.icon} />
          <Text style={styles.label} accessible={true}>Wykonuj</Text>
          <TextInput
            style={styles.numberInput}
            value={timesPerDay}
            onChangeText={(text) => setTimesPerDay(text.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
            maxLength={2}
            accessible={true}
            accessibilityLabel="Liczba powtórzeń w ciągu dnia"
            accessibilityHint="Wpisz ile razy dziennie chcesz wykonywać ten nawyk"
          />
          <Text style={styles.labelSuffix} accessible={true}>razy w ciągu dnia</Text>
        </View>

        <ModalDropdown
          options={['Codziennie', 'Co X dni', 'Wybierz dni']}
          defaultIndex={0}
          defaultValue={repeatMode}
          onSelect={(index, value) => setRepeatMode(value)}
          dropdownStyle={styles.dropdownList}
          dropdownTextStyle={styles.dropdownText}
          dropdownTextHighlightStyle={styles.dropdownTextHighlight}
        >
          <View 
            style={styles.row}
            accessible={true}
            accessibilityLabel="Tryb powtarzania"
            accessibilityHint={`Aktualny tryb: ${repeatMode}. Kliknij, aby zmienić częstotliwość powtarzania.`}
            accessibilityRole="button"
          >
            <Ionicons name="repeat-outline" size={24} color={theme.colors.text} style={styles.icon} />
            <Text style={styles.label}>Powtarzaj</Text>
            <Text style={styles.valueText}>{repeatMode}</Text>
          </View>
        </ModalDropdown>

        {repeatMode === 'Co X dni' && (
          <View style={styles.indentedRow}>
            <Text style={styles.label} accessible={true}>Co ile dni:</Text>
            <TextInput
              style={styles.numberInput}
              value={repeatValueX}
              onChangeText={(text) => setRepeatValueX(text.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
              maxLength={2}
              accessible={true}
              accessibilityLabel="Odstęp w dniach"
              accessibilityHint="Wpisz co ile dni nawyk ma być aktywny"
            />
          </View>
        )}
        {repeatMode === 'Wybierz dni' && (
          <View style={styles.indentedRow}>
            {WEEKDAYS.map(day => (
              <Pressable 
                key={day.id}
                style={[
                  styles.dayCircle, 
                  selectedWeekdays.includes(day.id) && styles.dayCircleSelected
                ]}
                onPress={() => toggleWeekday(day.id)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={day.long}
                accessibilityHint={selectedWeekdays.includes(day.id) ? "Dzień wybrany. Kliknij, aby odznaczyć." : "Dzień niewybrany. Kliknij, aby zaznaczyć."}
              >
                <Text style={[
                  styles.dayText,
                  selectedWeekdays.includes(day.id) && styles.dayTextSelected
                ]}>{day.short}</Text>
              </Pressable>
            ))}
          </View>
        )}
        
        <View style={styles.row}>
          <Ionicons name="time-outline" size={24} color={theme.colors.text} style={styles.icon} />
          <Text style={styles.label}>Godziny</Text>
          <ModalDropdown
            options={repeatMode === 'Wybierz dni' ? ['Taka sama godzina', 'Różne godziny'] : ['Taka sama godzina']}
            defaultIndex={0}
            defaultValue={timeMode}
            onSelect={(index, value) => setTimeMode(value)}
            dropdownStyle={styles.dropdownList}
            dropdownTextStyle={styles.dropdownText}
            dropdownTextHighlightStyle={styles.dropdownTextHighlight}
          >
            <Text 
              style={styles.valueText}
              accessible={true}
              accessibilityLabel="Tryb godzin powiadomień"
              accessibilityHint={`Aktualny tryb: ${timeMode}. Kliknij, aby zmienić.`}
              accessibilityRole="button"
            >
              {timeMode}
            </Text>
          </ModalDropdown>
        </View>
        {timeMode === 'Taka sama godzina' && (
          <View style={styles.timePickerContainer}>
            {renderTimePickers(null)}
          </View>
        )}
        {timeMode === 'Różne godziny' && repeatMode === 'Wybierz dni' && (
          <View style={styles.timePickerContainer}>
            {selectedWeekdays.sort().map(dayId => {
              const day = WEEKDAYS.find(d => d.id === dayId);
              return (
                <View key={dayId} style={styles.dayTimeRow}>
                  <Text style={styles.dayTimeLabel} accessible={true}>{day.long}:</Text>
                  <View style={styles.timeButtonsGroup}>
                    {renderTimePickers(dayId)}
                  </View>
                </View>
              );
            })}
          </View>
        )}

      </View>

      <Pressable 
        style={styles.createButton} 
        onPress={handleSaveHabit}
        accessible={true}
        accessibilityLabel={isEditing ? "Zapisz zmiany w nawyku" : "Utwórz nowy nawyk"}
        accessibilityHint="Zapisuje wprowadzone dane i wraca do ekranu głównego"
        accessibilityRole="button"
      >
        <Text style={styles.createButtonText}>{isEditing ? "Zapisz" : "Utwórz"}</Text>
      </Pressable>

      <View style={styles.bottomBar}></View>

      {showTimePicker && (
        <DateTimePicker
          value={
            timePickerTarget ? 
              (timePickerTarget.day === null ? sameTimes[timePickerTarget.index] : differentTimes[timePickerTarget.day][timePickerTarget.index]) 
              : new Date()
          }
          mode={'time'}
          display="default"
          onChange={onTimeChange}
        />
      )}

      {Platform.OS === 'ios' && showDatePicker && (
        <DateTimePicker
          value={date}
          mode={'date'}
          display="spinner"
          onChange={() => {}}
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
          onChange={() => {}}
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
        type="habit" 
      />

      <IconPickerModal
        visible={isIconPickerVisible}
        onClose={() => setIconPickerVisible(false)}
        onSelectIcon={(newIcon) => setIcon(newIcon)}
        currentIcon={icon}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={isPlantPickerVisible}
        onRequestClose={() => setIsPlantPickerVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View 
            style={{ width: '80%', backgroundColor: theme.colors.card, borderRadius: 20, padding: 20, alignItems: 'center' }}
            accessible={true}
            accessibilityViewIsModal={true}
          >
            <Text 
              style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 20 }}
              accessibilityRole="header"
            >
              Wybierz roślinę
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 20 }}>
              {AVAILABLE_PLANTS.map((plant) => (
                <TouchableOpacity
                  key={plant.id}
                  style={{ alignItems: 'center', padding: 10, borderWidth: 2, borderRadius: 10, borderColor: selectedPlantType === plant.id ? theme.colors.primary : 'transparent' }}
                  onPress={() => {
                    setSelectedPlantType(plant.id);
                    setIsPlantPickerVisible(false);
                  }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Wybierz roślinę: ${plant.name}`}
                  accessibilityHint={selectedPlantType === plant.id ? "Ta roślina jest aktualnie wybrana." : "Kliknij, aby wybrać tę roślinę."}
                >
                  <Image source={plant.source} style={{ width: 60, height: 60, marginBottom: 5 }} resizeMode="contain" />
                  <Text style={{ color: theme.colors.text }}>{plant.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Pressable
              style={{ marginTop: 20, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: theme.colors.primary, borderRadius: 10 }}
              onPress={() => setIsPlantPickerVisible(false)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Zamknij"
              accessibilityHint="Zamyka okno wyboru rośliny bez zmian"
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Zamknij</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
};

export default HabitAddScreen;