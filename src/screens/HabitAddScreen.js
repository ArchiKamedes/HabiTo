import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, ScrollView, Pressable } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import ModalDropdown from 'react-native-modal-dropdown';
import { collection, addDoc, serverTimestamp, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import ColorPickerModal from '../components/ColorPickerModal';

const WEEKDAYS = [
  { short: 'Pn', long: 'Poniedziałek', id: 1 },
  { short: 'Wt', long: 'Wtorek', id: 2 },
  { short: 'Śr', long: 'Środa', id: 3 },
  { short: 'Czw', long: 'Czwartek', id: 4 },
  { short: 'Pt', long: 'Piątek', id: 5 },
  { short: 'Sb', long: 'Sobota', id: 6 },
  { short: 'Nd', long: 'Niedziela', id: 0 },
];

const HabitAddScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const insets = useSafeAreaInsets();
  
  const { habitToEdit } = route.params || {};
  const isEditing = !!habitToEdit;

  const [habitName, setHabitName] = useState('');
  const [icon, setIcon] = useState('briefcase');
  const [color, setColor] = useState(theme.colors.primary);
  const [folder, setFolder] = useState('Studia');
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

  useEffect(() => {
    if (isEditing && habitToEdit) {
      setHabitName(habitToEdit.habitName || '');
      setIcon(habitToEdit.icon || 'briefcase');
      setColor(habitToEdit.color || theme.colors.primary);
      setFolder(habitToEdit.folder || 'Studia');
      setTimesPerDay(String(habitToEdit.timesPerDay || '1'));
      setRepeatMode(habitToEdit.repeatMode || 'Codziennie');
      setRepeatValueX(String(habitToEdit.repeatValueX || '3'));
      setSelectedWeekdays(habitToEdit.selectedWeekdays || []);
      setTimeMode(habitToEdit.timeMode || 'Taka sama godzina');

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

  const handleSaveHabit = async () => {
    const user = auth.currentUser; 

    if (!user || habitName.trim() === '') {
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
      // Nie nadpisujemy dat wykonania/pominięcia przy edycji, chyba że to nowy nawyk
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
        accessibilityLabel={`Wybierz godzinę ${index + 1}. Aktualnie: ${times[index] ? times[index].toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }) : 'brak'}`}
        accessibilityRole="button"
      >
        <Text style={styles.timeText}>
          {times[index] ? times[index].toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }) : 'Wybierz'}
        </Text>
      </TouchableOpacity>
    ));
  };

  return (
    <ScrollView style={[styles.screenContainer]}>
      
      <View style={styles.header}>
        <TextInput
          style={styles.titleInput}
          placeholder="Nazwa Nawyku"
          placeholderTextColor="#FFFFFF90"
          value={habitName}
          onChangeText={setHabitName}
          accessible={true}
          accessibilityLabel="Pole tekstowe nazwy nawyku"
          accessibilityHint="Wpisz tutaj nazwę nawyku"
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
          accessibilityLabel={`Ikona nawyku: ${icon}`}
          accessibilityRole="button"
        >
          <View style={[styles.iconCircle, { backgroundColor: theme.colors.border }]}>
            <FontAwesome5 name={icon} size={24} color={theme.colors.text} />
          </View>
          <Text style={styles.label}>Ikona</Text>
          <Text style={styles.valueText}>{icon}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.row} 
          onPress={() => setIsColorModalVisible(true)}
          accessible={true}
          accessibilityLabel={`Kolor nawyku. Aktualny kolor to ${color}`}
          accessibilityHint="Kliknij, aby zmienić kolor"
          accessibilityRole="button"
        >
          <View style={[styles.colorCircle, { backgroundColor: color }]} />
          <Text style={styles.label}>Kolor</Text>
          <Text style={styles.valueText}>Zmień</Text>
        </TouchableOpacity>

        <ModalDropdown
          options={['Studia', 'Praca', 'Dom']}
          defaultIndex={0}
          defaultValue={folder}
          onSelect={(index, value) => setFolder(value)}
          dropdownStyle={styles.dropdownList}
          dropdownTextStyle={styles.dropdownText}
          dropdownTextHighlightStyle={styles.dropdownTextHighlight}
        >
          <View 
            style={styles.row}
            accessible={true}
            accessibilityLabel={`Folder: ${folder}`}
            accessibilityHint="Kliknij, aby zmienić folder"
            accessibilityRole="button"
          > 
            <Ionicons name="folder-outline" size={24} color={theme.colors.text} style={styles.icon} />
            <Text style={styles.label}>Folder</Text>
            <Text style={styles.valueText}>{folder}</Text>
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
            accessibilityLabel={`Częstotliwość powtarzania: ${repeatMode}`}
            accessibilityHint="Kliknij, aby zmienić tryb powtarzania"
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
              accessibilityLabel="Wpisz liczbę dni odstępu"
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
                accessibilityLabel={`${day.long}, ${selectedWeekdays.includes(day.id) ? 'wybrano' : 'nie wybrano'}`}
                accessibilityRole="button"
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
              accessibilityLabel={`Tryb godzin: ${timeMode}`}
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

        <TouchableOpacity 
          style={styles.row}
          accessible={true}
          accessibilityLabel="Wybierz roślinę"
          accessibilityRole="button"
        >
          <Ionicons name="leaf-outline" size={24} color={theme.colors.text} style={styles.icon} />
          <Text style={styles.label}>Wybierz Roślinę</Text>
        </TouchableOpacity>

      </View>

      <Pressable 
        style={styles.createButton} 
        onPress={handleSaveHabit}
        accessible={true}
        accessibilityLabel={isEditing ? "Zapisz zmiany" : "Utwórz nawyk"}
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
    </ScrollView>
  );
};

const getStyles = (theme) => StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: theme.colors.background },
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
  formContainer: { paddingHorizontal: theme.spacing.m },
  row: {
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: theme.spacing.m,
    borderBottomWidth: 1, 
    borderBottomColor: theme.colors.border,
  },
  icon: { marginRight: theme.spacing.m },
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
  iconCircle: {
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    justifyContent: 'center',
    alignItems: 'center', 
    marginRight: theme.spacing.m,
    backgroundColor: theme.colors.border,
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
    width: 150,
    height: 'auto',
    maxHeight: 200,
    borderColor: theme.colors.border,
    borderWidth: 1, 
    borderRadius: 8,
    backgroundColor: theme.colors.card,
    marginTop: -20,
  },
  dropdownText: { 
    fontSize: 16, 
    color: theme.colors.text, 
    padding: 10,
    backgroundColor: theme.colors.card,
    textAlign: 'center',
  },
  dropdownTextHighlight: {
    backgroundColor: theme.colors.primary,
    color: '#FFF',
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
  },
  numberInput: {
    fontSize: 18,
    color: theme.colors.text,
    fontFamily: 'TitilliumWeb_700Bold',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s / 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    width: 60,
    textAlign: 'center',
  },
  labelSuffix: {
    fontSize: 16,
    color: theme.colors.inactive,
    fontFamily: 'TitilliumWeb_400Regular',
    marginLeft: theme.spacing.s,
  },
  indentedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.m,
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    marginVertical: theme.spacing.s,
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.border,
  },
  dayCircleSelected: {
    backgroundColor: theme.colors.primary,
  },
  dayText: {
    fontSize: 16,
    color: theme.colors.inactive,
    fontFamily: 'TitilliumWeb_700Bold',
  },
  dayTextSelected: {
    color: 'white',
  },
  timePickerContainer: {
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.m,
    backgroundColor: theme.colors.card,
    borderRadius: 8,
  },
  timeButton: {
    padding: theme.spacing.s,
    backgroundColor: theme.colors.border,
    borderRadius: 8,
    margin: theme.spacing.s,
  },
  timeText: {
    fontSize: 16,
    color: theme.colors.text,
    fontFamily: 'TitilliumWeb_700Bold',
  },
  dayTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.s,
  },
  dayTimeLabel: {
    fontSize: 16,
    color: theme.colors.text,
    fontFamily: 'TitilliumWeb_700Bold',
  },
  timeButtonsGroup: {
    flexDirection: 'row',
  },
});

export default HabitAddScreen;