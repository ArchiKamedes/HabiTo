import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

const WEEKDAYS = ['Nd', 'Pn', 'Wt', 'Śr', 'Czw', 'Pt', 'Sb'];

const HabitItem = ({ item, onToggle, onPressDetail }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const displayColor = item.color || theme.colors.primary;

  const formatTime = () => {
    let dateValue = item.time;
    
    if (!dateValue && item.notificationTimes) {
      if (Array.isArray(item.notificationTimes)) {
         dateValue = item.notificationTimes[0];
      } else if (typeof item.notificationTimes === 'object') {
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

  const timeString = formatTime();

  const renderDays = () => {
    if (theme.isAccessibilityMode) return null;

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
    <View style={[styles.container, { borderColor: theme.isAccessibilityMode ? theme.colors.text : displayColor }]}>
      
      {/* LEWA STRONA: IKONA + NAZWA + GODZINA (Teraz wszystko jest w jednym przycisku) */}
      <Pressable 
        style={styles.leftPressable}
        onPress={() => onPressDetail && onPressDetail(item)}
        accessible={true}
        accessibilityRole="button"
        // Etykieta zawiera widoczny tekst (Nazwę i Godzinę), co naprawia błąd "Nieudostępniony tekst"
        accessibilityLabel={`Nawyk: ${item.habitName}. ${timeString ? `Godzina: ${timeString}` : ''}`}
        accessibilityHint="Stuknij dwukrotnie, aby zobaczyć szczegóły"
      >
        <View style={[styles.iconCircle, { backgroundColor: displayColor }]}>
          <FontAwesome5 name={item.icon || 'briefcase'} size={theme.isAccessibilityMode ? 32 : 20} color="white" />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
             <Text 
              style={[styles.title, item.isCompleted && styles.titleCompleted]} 
              numberOfLines={1} 
              ellipsizeMode="tail"
            >
              {item.habitName}
            </Text>
            
            {/* PRZENIESIONO GODZINĘ TUTAJ - Obok tytułu lub pod nim */}
            {!!timeString && (
               <Text style={styles.timeText} importantForAccessibility="no">
                 {timeString}
               </Text>
            )}
          </View>
          
          {renderDays()}
        </View>
      </Pressable>

      {/* PRAWA STRONA: TYLKO CHECKBOX */}
      <View style={styles.rightContainer}>
        <Pressable 
          style={[
            styles.checkboxBase, 
            item.isCompleted && { 
              backgroundColor: displayColor, 
              borderColor: displayColor 
            }
          ]}
          onPress={onToggle}
          accessible={true}
          accessibilityRole="checkbox"
          // Unikalna etykieta zawierająca nazwę nawyku
          accessibilityLabel={
            item.isCompleted 
              ? `Oznacz nawyk ${item.habitName} jako niewykonany` 
              : `Oznacz nawyk ${item.habitName} jako wykonany`
          }
          accessibilityHint="Stuknij dwukrotnie, aby zmienić status"
          accessibilityState={{ checked: item.isCompleted }}
        >
          {item.isCompleted && <Ionicons name="checkmark" size={theme.isAccessibilityMode ? 30 : 18} color="white" />}
        </Pressable>
      </View>

    </View>
  );
};

const getStyles = (theme) => {
  if (theme.isAccessibilityMode) {
    return StyleSheet.create({
      container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        borderWidth: 4,
        marginBottom: 20,
        padding: 10,
        elevation: 0,
        minHeight: 100,
      },
      leftPressable: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1, // Zajmuje całą dostępną przestrzeń z lewej
        paddingVertical: 10,
        marginRight: 15, // Odstęp od checkboxa
      },
      iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
      },
      textContainer: {
        flex: 1, 
        justifyContent: 'center',
      },
      titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // Rozdziela Tytuł i Czas wewnątrz sekcji tekstowej
        paddingRight: 10,
      },
      title: {
        fontSize: 26,
        fontFamily: 'TitilliumWeb_700Bold',
        color: theme.colors.text,
        fontWeight: 'bold',
        flexShrink: 1, // Pozwala tekstowi się zawijać jeśli za długi
      },
      titleCompleted: {
        textDecorationLine: 'line-through',
        color: theme.colors.text,
        opacity: 0.7,
      },
      // Styl czasu wewnątrz lewego przycisku
      timeText: {
        fontSize: 22,
        fontFamily: 'TitilliumWeb_700Bold',
        color: theme.colors.text,
        fontWeight: 'bold',
        marginLeft: 10, 
      },
      daysContainer: { display: 'none' },
      dayCircle: { display: 'none' },
      dayText: { display: 'none' },
      
      rightContainer: {
        justifyContent: 'center',
        alignItems: 'center',
      },
      checkboxBase: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 4,
        borderColor: theme.colors.text,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
      },
    });
  }

  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.card,
      borderRadius: 16,
      borderWidth: 2,
      marginBottom: 10,
      paddingHorizontal: 12,
      paddingVertical: 0,
      elevation: 2,
      minHeight: 80,
    },
    leftPressable: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      paddingVertical: 12,
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
    titleRow: {
        flexDirection: 'column', // W standardzie czas może być pod spodem lub obok, zależy jak wolisz
        alignItems: 'flex-start',
    },
    title: {
      fontSize: 17,
      fontFamily: 'TitilliumWeb_700Bold',
      color: theme.colors.text,
      marginBottom: 2, 
    },
    titleCompleted: {
      textDecorationLine: 'line-through',
      color: theme.colors.inactive,
    },
    // W standardowym widoku czas może być mniejszy
    timeText: {
      fontSize: 14,
      fontFamily: 'TitilliumWeb_600SemiBold',
      color: theme.colors.text,
      marginTop: 2,
    },
    daysContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 4, 
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
      justifyContent: 'center',
      alignItems: 'center',
      paddingLeft: 8,
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
};

export default HabitItem;