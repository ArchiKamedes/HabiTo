
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

// Odbieramy 'item' (dane zadania) oraz funkcje do obsługi
const TaskItem = ({ item, onToggleComplete, onToggleSubtask }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  // Funkcja pomocnicza do pobrania koloru priorytetu
  const getPriorityColor = (level) => {
    if (level === 2) return '#FFA500'; // Średni
    if (level === 3) return '#FF4500'; // Wysoki
    if (level === 4) return '#DC143C'; // Pilny
    return theme.colors.inactive; // Domyślny (Niski)
  };

  // Funkcja formatująca datę (jeśli istnieje)
  const formatDate = (date) => {
    if (!date) return null;
    return date.toDate().toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Funkcja formatująca godzinę (jeśli istnieje)
  const formatTime = (date) => {
    if (!date) return null;
    return date.toDate().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    // Główny kontener z ramką w kolorze motywu
    <View style={styles.container}>
      
      {/* GÓRNY WIERSZ (GŁÓWNE ZADANIE) */}
      <View style={styles.mainRow}>
        
        {/* Kółko z ikoną */}
        <View style={[styles.iconCircle, { backgroundColor: item.color || theme.colors.primary }]}>
          <FontAwesome5 name={item.icon || 'briefcase'} size={20} color="white" />
        </View>

        {/* Tytuł zadania */}
        <Text style={[styles.title, item.completed && styles.titleCompleted]}>{item.name}</Text>

        {/* Informacje (Data, Godzina) */}
        <View style={styles.detailsContainer}>
          {item.dueDate && (
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={16} color={theme.colors.inactive} />
              <Text style={styles.detailText}>{formatDate(item.dueDate)}</Text>
            </View>
          )}
          {item.dueDate && ( // Zakładamy, że godzina jest w tym samym obiekcie
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={16} color={theme.colors.inactive} />
              <Text style={styles.detailText}>{formatTime(item.dueDate)}</Text>
            </View>
          )}
        </View>

        {/* Priorytet */}
        <FontAwesome5 
          name="bookmark" 
          solid 
          size={28} 
          color={getPriorityColor(item.priority)} 
          style={styles.priorityFlag}
        />

        {/* Checkbox (miejsce na wykonanie) */}
        <Pressable 
          style={[styles.checkboxBase, item.completed && styles.checkboxChecked]}
          onPress={() => onToggleComplete(item.id, item.completed)}
        >
          {item.completed && <Ionicons name="checkmark" size={20} color="white" />}
        </Pressable>

      </View>

      {/* SEKCJA Z PODZADANIAMI (Renderowana warunkowo) */}
      {item.subtasks && item.subtasks.length > 0 && (
        <View style={styles.subtasksContainer}>
          {item.subtasks.map((subtask, index) => (
            <Pressable 
              key={subtask.id} 
              style={styles.subtaskRow}
              onPress={() => onToggleSubtask(item.id, index, subtask.completed)}
            >
              <Ionicons 
                name={subtask.completed ? 'ellipse' : 'ellipse-outline'}
                size={22}
                color={theme.colors.primary}
              />
              <Text style={[styles.subtaskText, subtask.completed && styles.titleCompleted]}>
                {subtask.text}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.colors.primary, // Ramka w kolorze motywu
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
    flex: 1, // Powoduje, że tytuł zajmuje resztę miejsca
    fontSize: 18,
    fontFamily: 'TitilliumWeb_700Bold',
    color: theme.colors.text,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: theme.colors.inactive,
  },
  detailsContainer: {
    flexDirection: 'column', // Data nad godziną
    alignItems: 'flex-start',
    marginHorizontal: theme.spacing.m,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    color: theme.colors.inactive,
    fontFamily: 'TitilliumWeb_400Regular',
    marginLeft: theme.spacing.s / 2,
  },
  priorityFlag: {
    marginRight: theme.spacing.m,
  },
  checkboxBase: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
  },
  subtasksContainer: {
    marginTop: theme.spacing.m,
    paddingTop: theme.spacing.m,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.s / 2,
    marginLeft: theme.spacing.m, // Wcięcie dla podzadań
  },
  subtaskText: {
    marginLeft: theme.spacing.m,
    fontSize: 16,
    color: theme.colors.text,
    fontFamily: 'TitilliumWeb_400Regular',
  }
});

export default TaskItem;