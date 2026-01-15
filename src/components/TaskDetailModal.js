import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const TaskDetailModal = ({ visible, task, onClose, onEdit, onDelete }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  if (!task) return null;

  const displayColor = task.color || theme.colors.primary;

  // Formatowanie daty i godziny
  const formatDate = (date) => {
    if (!date) return 'Brak';
    try {
      const d = date.toDate ? date.toDate() : new Date(date);
      return d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) {
      return 'Brak';
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    try {
      const d = date.toDate ? date.toDate() : new Date(date);
      return d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  const getPriorityText = (level) => {
    if (level === 4) return 'Pilny';
    if (level === 3) return 'Wysoki';
    if (level === 2) return 'Średni';
    return 'Niski';
  };

  const subtaskCount = task.subtasks ? task.subtasks.length : 0;
  const completedSubtasks = task.subtasks ? task.subtasks.filter(s => s.completed).length : 0;

  const DetailRow = ({ label, value }) => (
    <View 
      style={styles.detailRow}
      accessible={true}
      accessibilityLabel={`${label}: ${value}`} 
    >
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );

  return (
    <Modal
      animationType={theme.isAccessibilityMode ? "none" : "fade"}
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Tło ukryte przed czytnikiem ekranu */}
        <Pressable 
          style={styles.backdrop} 
          onPress={onClose} 
          importantForAccessibility="no-hide-descendants" 
          accessibilityElementsHidden={true}
        />
        
        {/* Kontener modala oznaczony jako modal dla systemu */}
        <View 
          style={styles.modalContent} 
          accessibilityViewIsModal={true}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            
            <View style={[styles.headerIcon, { backgroundColor: theme.isAccessibilityMode ? 'transparent' : displayColor }]}>
              <FontAwesome5 
                name={task.icon || 'briefcase'} 
                size={theme.isAccessibilityMode ? 50 : 30} 
                color={theme.isAccessibilityMode ? theme.colors.text : "white"} 
              />
            </View>

            <Text style={styles.title} accessibilityRole="header">{task.name}</Text>

            <View style={styles.infoContainer}>
              <DetailRow label="Termin" value={`${formatDate(task.dueDate)} ${formatTime(task.dueDate)}`} />
              <DetailRow label="Priorytet" value={getPriorityText(task.priority)} />
              {subtaskCount > 0 && (
                <DetailRow label="Podzadania" value={`${completedSubtasks} z ${subtaskCount} zrobione`} />
              )}
              <DetailRow label="Status" value={task.completed ? 'Wykonane' : 'Do zrobienia'} />
            </View>

            <View style={styles.buttonContainer}>
              <Pressable 
                style={[styles.button, styles.editButton]} 
                onPress={() => { onClose(); onEdit(task); }}
                accessibilityRole="button"
                accessibilityLabel="Edytuj zadanie"
                accessibilityHint="Otwiera ekran edycji zadania"
              >
                <Text style={styles.buttonTextPrimary}>Edytuj</Text>
              </Pressable>

              <Pressable 
                style={[styles.button, styles.deleteButton]} 
                onPress={() => { onClose(); onDelete(task.id); }}
                accessibilityRole="button"
                accessibilityLabel="Usuń zadanie"
                accessibilityHint="Trwale usuwa to zadanie"
              >
                <Text style={styles.buttonTextSecondary}>Usuń</Text>
              </Pressable>

              <Pressable 
                style={[styles.button, styles.closeButton]} 
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Zamknij okno szczegółów"
              >
                <Text style={styles.buttonTextClose}>Zamknij</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (theme) => {
  // --- STYL DLA NIEWIDOMYCH (DUŻY KONTRAST, PIONOWY UKŁAD) ---
  if (theme.isAccessibilityMode) {
    return StyleSheet.create({
      overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)', 
      },
      backdrop: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
      },
      modalContent: {
        width: '95%',
        maxHeight: '90%',
        backgroundColor: theme.colors.card,
        borderRadius: 4, 
        borderWidth: 4, 
        borderColor: theme.colors.text, 
        padding: 20,
        elevation: 10,
      },
      scrollContent: {
        alignItems: 'center',
        paddingBottom: 20,
      },
      headerIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 4,
        borderColor: theme.colors.text,
      },
      title: {
        fontSize: 32, 
        fontFamily: 'TitilliumWeb_700Bold',
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: 30,
        fontWeight: 'bold',
      },
      infoContainer: {
        width: '100%',
        marginBottom: 30,
      },
      detailRow: {
        flexDirection: 'column', 
        marginBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: theme.colors.text,
        paddingBottom: 10,
      },
      label: {
        fontSize: 18,
        color: theme.colors.text,
        marginBottom: 5,
        opacity: 0.9,
      },
      value: {
        fontSize: 26, 
        color: theme.colors.text,
        fontFamily: 'TitilliumWeb_700Bold',
        fontWeight: 'bold',
      },
      buttonContainer: {
        width: '100%',
        gap: 15, 
      },
      button: {
        width: '100%',
        paddingVertical: 15,
        borderRadius: 8,
        borderWidth: 3,
        borderColor: theme.colors.text,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
      },
      editButton: {
        backgroundColor: theme.colors.card, 
      },
      deleteButton: {
        backgroundColor: theme.colors.card, 
        borderColor: '#DC143C', 
      },
      closeButton: {
        backgroundColor: theme.colors.text, 
        marginTop: 10,
      },
      buttonTextPrimary: {
        fontSize: 24,
        color: theme.colors.text,
        fontWeight: 'bold',
      },
      buttonTextSecondary: {
        fontSize: 24,
        color: '#DC143C', 
        fontWeight: 'bold',
      },
      buttonTextClose: {
        fontSize: 24,
        color: theme.colors.background, 
        fontWeight: 'bold',
      },
    });
  }

  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    backdrop: {
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
    },
    modalContent: {
      width: '80%',
      backgroundColor: theme.colors.card,
      borderRadius: 20,
      padding: 20,
      elevation: 5,
      alignItems: 'center',
    },
    scrollContent: {
      alignItems: 'center',
      width: '100%',
    },
    headerIcon: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 15,
      marginTop: -40, 
      elevation: 5,
    },
    title: {
      fontSize: 22,
      fontFamily: 'TitilliumWeb_700Bold',
      color: theme.colors.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    infoContainer: {
      width: '100%',
      marginBottom: 20,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border || '#eee',
    },
    label: {
      fontSize: 14,
      color: theme.colors.inactive,
      fontFamily: 'TitilliumWeb_400Regular',
    },
    value: {
      fontSize: 16,
      color: theme.colors.text,
      fontFamily: 'TitilliumWeb_600SemiBold',
      textAlign: 'right',
      flex: 1,
      marginLeft: 10,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginTop: 10,
    },
    button: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 10,
      alignItems: 'center',
      marginHorizontal: 5,
    },
    editButton: {
      backgroundColor: theme.colors.primary,
    },
    deleteButton: {
      backgroundColor: '#FF6B6B',
    },
    closeButton: {
      display: 'none', 
    },
    buttonTextPrimary: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 14,
    },
    buttonTextSecondary: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 14,
    },
    buttonTextClose: {
        display: 'none',
    }
  });
};

export default TaskDetailModal;