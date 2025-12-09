import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

const WEEKDAYS = ['Nd', 'Pn', 'Wt', 'Śr', 'Czw', 'Pt', 'Sb'];

const HabitItem = ({ item, onToggle }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const displayColor = item.color || theme.colors.primary;

  const formatTime = () => {
    // Sprawdzamy czy istnieje pojedyncza godzina lub tablica powiadomień
    let dateValue = item.time;
    
    // Jeśli nie ma 'time', ale jest tablica powiadomień (np. dla 'Wybierz dni')
    if (!dateValue && item.notificationTimes) {
      // Pobieramy pierwszy dostępny czas
      if (Array.isArray(item.notificationTimes)) {
         dateValue = item.notificationTimes[0];
      } else if (typeof item.notificationTimes === 'object') {
         // Jeśli to obiekt (mapa dni), bierzemy pierwszy klucz
         const keys = Object.keys(item.notificationTimes);
         if (keys.length > 0 && item.notificationTimes[keys[0]].length > 0) {
            dateValue = item.notificationTimes[keys[0]][0];
         }
      }
    }

    if (!dateValue) return '';

    try {
      const d = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
      return d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  const renderDays = () => {
    if (item.repeatMode !== 'Wybierz dni' || !item.selectedWeekdays) {
      return null;
    }

    return (
      <View style={styles.daysContainer}>
        {WEEKDAYS.map((dayName, index) => {
          const isSelected = item.selectedWeekdays.includes(index);
          return (
            <View 
              key={index} 
              style={[
                styles.dayCircle, 
                {
                  borderColor: isSelected ? displayColor : theme.colors.inactive,
                  backgroundColor: isSelected ? displayColor : 'transparent',
                  opacity: isSelected ? 1 : 0.3 
                }
              ]}
            >
              <Text style={[
                styles.dayText,
                { color: isSelected ? theme.colors.background : theme.colors.text }
              ]}>{dayName}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={[styles.container, { borderColor: displayColor }]}>
      
      <View style={styles.leftContainer}>
        <View style={[styles.iconCircle, { backgroundColor: displayColor }]}>
          <FontAwesome5 name={item.icon || 'briefcase'} size={20} color="white" />
        </View>

        <View style={styles.textContainer}>
          <Text 
            style={[styles.title, item.isCompleted && styles.titleCompleted]} 
            numberOfLines={1} 
            ellipsizeMode="tail"
          >
            {item.habitName}
          </Text>
          
          {renderDays()}
        </View>
      </View>

      <View style={styles.rightContainer}>
        <Text style={styles.timeText}>{formatTime()}</Text>
        
        <Pressable 
          style={[
            styles.checkboxBase, 
            item.isCompleted && { backgroundColor: displayColor, borderColor: displayColor }
          ]}
          onPress={onToggle}
          accessible={true}
          accessibilityRole="checkbox"
          accessibilityLabel={`Oznacz nawyk ${item.habitName} jako wykonany`}
          accessibilityState={{ checked: item.isCompleted }}
        >
          {item.isCompleted && <Ionicons name="checkmark" size={18} color="white" />}
        </Pressable>
      </View>

    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 10,
    padding: 12,
    elevation: 2,
    minHeight: 80,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, 
    marginRight: 10,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flexDirection: 'column', 
    justifyContent: 'center',
    flex: 1, 
  },
  title: {
    fontSize: 17,
    fontFamily: 'TitilliumWeb_700Bold',
    color: theme.colors.text,
    marginBottom: 6, 
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: theme.colors.inactive,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', 
  },
  dayCircle: {
    width: 22, 
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginRight: 4,
    marginTop: 2,
  },
  dayText: {
    fontSize: 9, 
    fontWeight: 'bold',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    fontFamily: 'TitilliumWeb_700Bold',
    color: theme.colors.text,
    marginRight: 12,
  },
  checkboxBase: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.colors.inactive,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});

export default HabitItem;