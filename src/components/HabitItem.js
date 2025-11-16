// src/components/HabitItem.js
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

// Definicja dni tygodnia (do wyświetlania)
const WEEKDAYS = ['Nd', 'Pn', 'Wt', 'Śr', 'Czw', 'Pt', 'Sb'];

const HabitItem = ({ item, onToggle }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  // Funkcja formatująca godzinę
  const formatTime = (date) => {
    if (!date) return '??:??';
    return date.toDate().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  };

  // Komponent do wyświetlania dni tygodnia
  const WeekdayDisplay = () => {
    // Pokaż tylko jeśli tryb to "Wybierz dni"
    if (item.repeatMode !== 'Wybierz dni' || !item.selectedWeekdays) {
      return null; // Zwróć null, jeśli "Codziennie" lub "Co X dni"
    }
    
    return (
      <View style={styles.weekdaysContainer}>
        {WEEKDAYS.map((dayName, index) => {
          const isSelected = item.selectedWeekdays.includes(index);
          return (
            <View 
              key={index} 
              style={[
                styles.dayCircle, 
                isSelected && styles.dayCircleSelected
              ]}
            >
              <Text style={[
                styles.dayText,
                isSelected && styles.dayTextSelected
              ]}>{dayName}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    // Główny kontener z ramką w kolorze motywu
    <View style={[styles.container, { borderColor: item.color || theme.colors.primary }]}>
      
      {/* GÓRNY WIERSZ (GŁÓWNY NAWYK) */}
      <View style={styles.mainRow}>
        
        {/* Kółko z ikoną */}
        <View style={[styles.iconCircle, { backgroundColor: item.color || theme.colors.primary }]}>
          <FontAwesome5 name={item.icon || 'briefcase'} size={20} color="white" />
        </View>

        {/* Tytuł nawyku */}
        <Text style={[styles.title, item.isCompleted && styles.titleCompleted]}>
          {item.habitName}
        </Texts>

        {/* Dni Tygodnia (zgodnie z projektem) */}
        <WeekdayDisplay />

        {/* Godzina */}
        <Text style={styles.timeText}>{formatTime(item.time)}</Text>

        {/* Checkbox (miejsce na wykonanie) */}
        <Pressable 
          style={[
            styles.checkboxBase, 
            item.isCompleted && styles.checkboxChecked,
            item.isCompleted && { backgroundColor: item.color || theme.colors.primary, borderColor: item.color || theme.colors.primary }
          ]}
          onPress={onToggle}
        >
          {item.isCompleted && <Ionicons name="checkmark" size={24} color="white" />}
        </Pressable>
      </View>
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: theme.spacing.m,
    padding: theme.spacing.m,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.m,
  },
  title: {
    fontSize: 18,
    fontFamily: 'TitilliumWeb_700Bold',
    color: theme.colors.text,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: theme.colors.inactive,
  },
  weekdaysContainer: {
    flex: 1, 
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: theme.spacing.s,
  },
  dayCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginHorizontal: 2,
  },
  dayCircleSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  dayText: {
    fontSize: 10,
    color: theme.colors.inactive,
    fontFamily: 'TitilliumWeb_700Bold',
  },
  dayTextSelected: {
    color: 'white',
  },
  timeText: {
    fontSize: 20,
    fontFamily: 'TitilliumWeb_700Bold',
    color: theme.colors.text,
    marginHorizontal: theme.spacing.m,
  },
  checkboxBase: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: theme.colors.inactive,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  checkboxChecked: {
  },
});

export default HabitItem;