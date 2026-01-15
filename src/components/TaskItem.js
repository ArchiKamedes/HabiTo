import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

const TaskItem = ({ item, onToggleComplete, onToggleSubtask, onPressDetail }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const getPriorityColor = (level) => {
    if (level === 2) return '#FFA500';
    if (level === 3) return '#FF4500';
    if (level === 4) return '#DC143C';
    return theme.colors.inactive;
  };

  const formatDate = (date) => {
    if (!date) return null;
    return date.toDate().toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (date) => {
    if (!date) return null;
    return date.toDate().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  };

  const dateString = item.dueDate ? `${formatDate(item.dueDate)} ${formatTime(item.dueDate)}` : '';

  return (
    <View style={styles.container}>
      
      <View style={styles.mainRow}>
        
        {/* LEWA STRONA: Otwieranie szczegółów */}
        <Pressable 
          style={({ pressed }) => [
            styles.leftPressable,
            { opacity: pressed ? 0.6 : 1 } // Efekt wizualny kliknięcia
          ]}
          onPress={() => {
            if (onPressDetail) {
              onPressDetail(item);
            } else {
              console.log("Brak funkcji onPressDetail w TasksScreen!");
            }
          }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Zadanie: ${item.name}. ${dateString ? `Termin: ${dateString}` : ''}`}
          accessibilityHint="Stuknij dwukrotnie, aby zobaczyć szczegóły"
        >
          <View style={[styles.iconCircle, { backgroundColor: item.color || theme.colors.primary }]}>
            <FontAwesome5 name={item.icon || 'briefcase'} size={theme.isAccessibilityMode ? 32 : 20} color="white" />
          </View>

          <View style={styles.textContainer}>
            <Text style={[styles.title, item.completed && styles.titleCompleted]}>
              {item.name}
            </Text>

            {!theme.isAccessibilityMode && (
              <View style={styles.detailsContainer} importantForAccessibility="no">
                {item.dueDate && (
                  <View style={styles.detailItem}>
                    <Ionicons name="calendar-outline" size={16} color={theme.colors.inactive} />
                    <Text style={styles.detailText}>{formatDate(item.dueDate)}</Text>
                  </View>
                )}
                {item.dueDate && ( 
                  <View style={styles.detailItem}>
                    <Ionicons name="time-outline" size={16} color={theme.colors.inactive} />
                    <Text style={styles.detailText}>{formatTime(item.dueDate)}</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          <FontAwesome5 
            name="bookmark" 
            solid 
            size={theme.isAccessibilityMode ? 40 : 28} 
            color={getPriorityColor(item.priority)} 
            style={styles.priorityFlag}
            importantForAccessibility="no"
          />
        </Pressable>

        {/* PRAWA STRONA: Checkbox */}
        <Pressable 
          style={({ pressed }) => [
            styles.checkboxBase, 
            item.completed && styles.checkboxChecked,
            { opacity: pressed ? 0.7 : 1 }
          ]}
          onPress={() => onToggleComplete(item.id, item.completed)}
          accessible={true}
          accessibilityRole="checkbox"
          accessibilityLabel={
            item.completed 
              ? `Oznacz zadanie ${item.name} jako niewykonane` 
              : `Oznacz zadanie ${item.name} jako wykonane`
          }
          accessibilityHint="Stuknij dwukrotnie, aby zmienić status"
          accessibilityState={{ checked: item.completed }}
        >
          {item.completed && <Ionicons name="checkmark" size={theme.isAccessibilityMode ? 30 : 20} color="white" />}
        </Pressable>

      </View>

      {/* PODZADANIA */}
      {item.subtasks && item.subtasks.length > 0 && (
        <View style={styles.subtasksContainer}>
          {item.subtasks.map((subtask, index) => (
            <Pressable 
              key={subtask.id} 
              style={({ pressed }) => [
                styles.subtaskRow,
                { opacity: pressed ? 0.7 : 1 }
              ]}
              onPress={() => onToggleSubtask(item.id, index, subtask.completed)}
              accessibilityRole="checkbox"
              accessibilityLabel={`Podzadanie: ${subtask.text} do zadania ${item.name}`}
              accessibilityHint="Stuknij dwukrotnie, aby przełączyć"
              accessibilityState={{ checked: subtask.completed }}
            >
              <Ionicons 
                name={subtask.completed ? 'ellipse' : 'ellipse-outline'}
                size={theme.isAccessibilityMode ? 30 : 22}
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

const getStyles = (theme) => {
  if (theme.isAccessibilityMode) {
    return StyleSheet.create({
      container: {
        backgroundColor: theme.colors.card,
        borderRadius: 16, 
        borderWidth: 4,
        borderColor: theme.colors.text, 
        marginBottom: 20,
        padding: 10,
        elevation: 0,
      },
      mainRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', 
      },
      leftPressable: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        paddingVertical: 10,
        marginRight: 10,
      },
      iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30, 
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        borderWidth: 2, 
        borderColor: theme.colors.text, 
      },
      textContainer: {
        flex: 1,
        justifyContent: 'center',
      },
      title: {
        fontSize: 26, 
        fontFamily: 'TitilliumWeb_700Bold',
        color: theme.colors.text,
        fontWeight: 'bold', 
        marginLeft: 0, 
      },
      titleCompleted: {
        textDecorationLine: 'line-through',
        color: theme.colors.text, 
        opacity: 0.7, 
      },
      priorityFlag: {
        marginRight: 15,
        marginLeft: 10,
      },
      checkboxBase: {
        width: 50,
        height: 50,
        borderRadius: 25, 
        borderWidth: 4, 
        borderColor: theme.colors.text, 
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.card, 
      },
      checkboxChecked: {
        backgroundColor: theme.colors.text, 
      },
      subtasksContainer: {
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 2,
        borderTopColor: theme.colors.text, 
      },
      subtaskRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        marginLeft: 0, 
      },
      subtaskText: {
        marginLeft: 15,
        fontSize: 22, 
        color: theme.colors.text,
        fontFamily: 'TitilliumWeb_700Bold', 
        fontWeight: 'bold', 
      },
      detailsContainer: { display: 'none' },
      detailItem: { display: 'none' },
      detailText: { display: 'none' },
    });
  }

  // STANDARDOWY STYL
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.card,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: theme.colors.primary,
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
    leftPressable: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: 10,
    },
    iconCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.m,
    },
    textContainer: {
      flex: 1,
      justifyContent: 'center',
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
    detailsContainer: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      marginTop: 4,
    },
    detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 10,
    },
    detailText: {
      fontSize: 12,
      color: theme.colors.inactive,
      fontFamily: 'TitilliumWeb_400Regular',
      marginLeft: theme.spacing.s / 2,
    },
    priorityFlag: {
      marginRight: theme.spacing.m,
      marginLeft: theme.spacing.m,
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
      marginLeft: theme.spacing.m,
    },
    subtaskText: {
      marginLeft: theme.spacing.m,
      fontSize: 16,
      color: theme.colors.text,
      fontFamily: 'TitilliumWeb_400Regular',
    }
  });
};

export default TaskItem;