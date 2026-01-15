import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { db, auth } from '../firebaseConfig';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { getStyles } from '../styles/CalendarScreen.styles';

// Konfiguracja języka polskiego
LocaleConfig.locales.pl = {
  monthNames: ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'],
  monthNamesShort: ['Sty.','Lut.','Mar.','Kwi.','Maj','Cze.','Lip.','Sie.','Wrz.','Paź.','Lis.','Gru.'],
  dayNames: ['Niedziela','Poniedziałek','Wtorek','Środa','Czwartek','Piątek','Sobota'],
  dayNamesShort: ['Nd','Pn','Wt','Śr','Cz','Pt','Sb'],
  today: 'Dzisiaj'
};
LocaleConfig.defaultLocale = 'pl';

const CalendarScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = getStyles(theme);
  const user = auth.currentUser;

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'tasks'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setTasks(data);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'habits'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setHabits(data);
    });
    return () => unsubscribe();
  }, [user]);

  const markedDates = useMemo(() => {
    const marks = {};

    tasks.forEach(task => {
      if (task.dueDate && task.dueDate.toDate) {
        const dateStr = task.dueDate.toDate().toISOString().split('T')[0];
        
        if (!marks[dateStr]) marks[dateStr] = { dots: [] };
        if (!marks[dateStr].dots.find(d => d.key === 'task')) {
            marks[dateStr].dots.push({ key: 'task', color: '#4da6ff' });
        }
      }
    });

    habits.forEach(habit => {
      if (habit.completedDates && Array.isArray(habit.completedDates)) {
        habit.completedDates.forEach(dateStr => {
            if (!marks[dateStr]) marks[dateStr] = { dots: [] };
            if (!marks[dateStr].dots.find(d => d.key === 'habit')) {
                marks[dateStr].dots.push({ key: 'habit', color: theme.colors.primary });
            }
        });
      }
    });

    if (marks[selectedDate]) {
        marks[selectedDate].selected = true;
        marks[selectedDate].selectedColor = theme.colors.primary;
    } else {
        marks[selectedDate] = { selected: true, selectedColor: theme.colors.primary };
    }

    return marks;
  }, [tasks, habits, selectedDate, theme]);

  const itemsForSelectedDate = useMemo(() => {
    const list = [];

    tasks.forEach(task => {
        if (task.dueDate && task.dueDate.toDate) {
            const d = task.dueDate.toDate().toISOString().split('T')[0];
            if (d === selectedDate) {
                list.push({ type: 'task', data: task });
            }
        }
    });

    habits.forEach(habit => {
        if (habit.completedDates?.includes(selectedDate)) {
            list.push({ type: 'habit', data: habit });
        }
    });

    return list;
  }, [selectedDate, tasks, habits]);

  const renderItem = ({ item }) => {
    const isTask = item.type === 'task';
    const content = item.data;
    
    // ZMIANA: Usunięto 'accessible={true}' z kontenera View.
    // Dzięki temu skaner widzi teksty wewnątrz jako "udostępnione".
    // Czytnik przeczyta je po kolei, co jest poprawne.
    
    return (
      <View style={[styles.card, { borderLeftColor: isTask ? '#4da6ff' : theme.colors.primary }]}>
        <View style={styles.iconBox} importantForAccessibility="no">
            <FontAwesome5 
                name={content.icon || (isTask ? 'tasks' : 'leaf')} 
                size={theme.isAccessibilityMode ? 32 : 24} 
                color={theme.colors.text}
            />
        </View>
        <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{isTask ? content.name : content.habitName}</Text>
            <Text style={styles.cardSub}>
                {isTask ? 'Zadanie do zrobienia' : 'Nawyk wykonany'}
            </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
      <View style={styles.header}>
        <Text style={styles.headerTitle} accessibilityRole="header">Kalendarz</Text>
      </View>

      <Calendar
        current={selectedDate}
        onDayPress={day => setSelectedDate(day.dateString)}
        markedDates={markedDates}
        markingType={'multi-dot'}
        enableSwipeMonths={true} // Płynniejsze przewijanie
        
        // ZMIANA: Własny nagłówek, aby tekst Miesiąca był widoczny dla skanera
        renderHeader={(date) => {
            const monthNames = LocaleConfig.locales.pl.monthNames;
            const title = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
            return (
                <Text style={{ 
                    fontSize: theme.isAccessibilityMode ? 24 : 18, 
                    fontFamily: 'TitilliumWeb_700Bold',
                    color: theme.colors.text
                }} accessibilityRole="header">
                    {title}
                </Text>
            );
        }}

        renderArrow={(direction) => (
            <View 
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={direction === 'left' ? "Poprzedni miesiąc" : "Następny miesiąc"}
                accessibilityHint="Kliknij, aby zmienić miesiąc"
                style={styles.arrowContainer}
            >
                <Ionicons 
                    name={direction === 'left' ? "chevron-back" : "chevron-forward"} 
                    size={theme.isAccessibilityMode ? 40 : 30} 
                    color={theme.colors.primary} 
                />
            </View>
        )}
        
        // Wymuszenie wysokiego kontrastu w motywie kalendarza
        theme={{
          backgroundColor: theme.colors.card,
          calendarBackground: theme.colors.card,
          textSectionTitleColor: theme.colors.text, // Ważne: Kolor dni tyg.
          selectedDayBackgroundColor: theme.colors.primary,
          selectedDayTextColor: '#ffffff',
          todayTextColor: theme.colors.primary,
          dayTextColor: theme.colors.text, // Ważne: Kolor dni
          textDisabledColor: theme.isAccessibilityMode ? '#888' : '#d9e1e8',
          dotColor: theme.colors.primary,
          selectedDotColor: '#ffffff',
          arrowColor: theme.colors.primary,
          monthTextColor: theme.colors.text, // Ważne: Kolor nagłówka
          textDayFontFamily: 'TitilliumWeb_700Bold',
          textMonthFontFamily: 'TitilliumWeb_700Bold',
          textDayHeaderFontFamily: 'TitilliumWeb_700Bold',
          textDayFontSize: theme.isAccessibilityMode ? 22 : 16,
          textMonthFontSize: theme.isAccessibilityMode ? 24 : 16,
          textDayHeaderFontSize: theme.isAccessibilityMode ? 16 : 13
        }}
        style={styles.calendar}
      />

      <View style={styles.listContainer}>
        <Text 
            style={styles.sectionTitle}
            accessible={true}
            accessibilityRole="header"
            accessibilityLabel={`Lista elementów dla dnia ${selectedDate}`}
        >
            W dniu {selectedDate}:
        </Text>
        <FlatList
            data={itemsForSelectedDate}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            ListEmptyComponent={
                <Text style={styles.emptyText} accessible={true}>Brak planów na ten dzień.</Text>
            }
        />
      </View>

    </View>
  );
};
export default CalendarScreen;