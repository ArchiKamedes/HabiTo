import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Modal, Pressable, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import IconPickerModal from './IconPickerModal';

// 1. Komponent pomocniczy przeniesiony na zewnątrz (Fix: Do not define components during render)
const RadioButton = ({ label, value, current, onSelect, styles }) => (
  <Pressable 
    style={styles.radioRow} 
    onPress={() => onSelect(value)}
    accessible={true}
    accessibilityRole="radio"
    accessibilityState={{ checked: current === value }}
    accessibilityLabel={label} // Prosta etykieta, rola "radio" powie resztę
    accessibilityHint="Stuknij dwukrotnie, aby wybrać ten typ folderu" // Fix: Brakujący hint
  >
    <View style={[styles.radioOuter, current === value && styles.radioOuterSelected]}>
      {current === value && <View style={styles.radioInner} />}
    </View>
    <Text style={styles.radioLabel}>{label}</Text>
  </Pressable>
);

const AddFolderModal = ({ visible, onClose, type }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [folderName, setFolderName] = useState('');
  const [icon, setIcon] = useState('briefcase');
  const [selectedType, setSelectedType] = useState(type || 'task');
  const [isIconPickerVisible, setIconPickerVisible] = useState(false);

  useEffect(() => {
    if (type) {
      setSelectedType(type);
    }
  }, [type, visible]);

  const handleAddFolder = async () => {
    const user = auth.currentUser;
    if (!user || folderName.trim() === '') {
      Alert.alert('Błąd', 'Proszę podać nazwę folderu.');
      return;
    }

    const collectionName = selectedType === 'habit' ? 'HabitsFolders' : 'TaskFolders';
    
    try {
      const folderCollectionRef = collection(db, 'users', user.uid, collectionName);
      
      await addDoc(folderCollectionRef, {
        name: folderName.trim(),
        icon: icon,
        color: theme.colors.primary,
        createdAt: serverTimestamp(),
      });

      handleClose();
    } catch (error) {
      console.error(error);
      Alert.alert('Błąd', 'Nie udało się dodać folderu.');
    }
  };

  const handleClose = () => {
    setFolderName('');
    setIcon('briefcase');
    onClose();
  };

  return (
    <Modal
      animationType={theme.isAccessibilityMode ? "none" : "fade"}
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalBackdropContainer}
      >
        <Pressable 
          style={styles.modalBackdrop} 
          onPress={handleClose}
          importantForAccessibility="no-hide-descendants" 
          accessibilityElementsHidden={true}
        />
        
        <View style={styles.modalView} accessibilityViewIsModal={true}>
          
          <View style={styles.header}>
            {/* Fix: Usunięto accessibilityLabel z TextInput, aby nie nadpisywał wpisanej treści */}
            <TextInput 
                style={styles.titleInput} 
                placeholder="Nazwa Folderu" 
                placeholderTextColor={theme.isAccessibilityMode ? theme.colors.inactive : "#FFFFFF90"}  
                value={folderName} 
                onChangeText={setFolderName}
                accessible={true}
            />
            <Pressable 
              onPress={handleClose} 
              style={styles.closeButton}
              accessible={true}
              accessibilityLabel="Zamknij"
              accessibilityHint="Zamyka okno bez dodawania folderu" // Fix: Brakujący hint
              accessibilityRole="button"
            >
             <Ionicons 
                name="close-circle" 
                size={theme.isAccessibilityMode ? 40 : 30} 
                color={theme.isAccessibilityMode ? theme.colors.text : "#FFFFFF"} 
              />
            </Pressable>
          </View>

          <View style={styles.formContainer}>
            
            <Pressable 
              style={styles.row}
              onPress={() => setIconPickerVisible(true)}
              accessible={true}
              accessibilityRole="button"
              // Fix: Etykieta zawiera widoczny tekst "Wybierz ikonę", co naprawia błąd "Nieudostępniony tekst"
              accessibilityLabel={`Wybierz ikonę. Obecna ikona: ${icon}`}
              accessibilityHint="Otwiera listę ikon do wyboru" // Fix: Brakujący hint
            >
              <View style={styles.iconPreview}>
                <FontAwesome5 name={icon} size={theme.isAccessibilityMode ? 32 : 24} color={theme.colors.text} />
              </View>
              <Text style={styles.label}>Wybierz ikonę</Text>
            </Pressable>
            
            <View style={styles.radioGroup} accessible={true} accessibilityRole="radiogroup">
              <RadioButton 
                label="Zadania"
                value="task"
                current={selectedType}
                onSelect={setSelectedType}
                styles={styles}
              />
              <RadioButton 
                label="Nawyki"
                value="habit"
                current={selectedType}
                onSelect={setSelectedType}
                styles={styles}
              />
            </View>

            <Pressable 
              style={styles.createButton} 
              onPress={handleAddFolder}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Dodaj folder"
              accessibilityHint="Zapisuje nowy folder w bazie danych" // Fix: Brakujący hint
            >
              <Text style={styles.createButtonText}>Dodaj</Text>
            </Pressable>

          </View>
        </View>
      </KeyboardAvoidingView>

      <IconPickerModal
        visible={isIconPickerVisible}
        onClose={() => setIconPickerVisible(false)}
        onSelectIcon={(newIcon) => setIcon(newIcon)}
        currentIcon={icon}
      />
    </Modal>
  );
};

const getStyles = (theme) => {
  if (theme.isAccessibilityMode) {
    return StyleSheet.create({
      modalBackdropContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)', 
      },
      modalBackdrop: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
      },
      modalView: {
        width: '95%',
        backgroundColor: theme.colors.card,
        borderRadius: 4, 
        borderWidth: 4,
        borderColor: theme.colors.text,
        overflow: 'hidden', 
        elevation: 0,
      },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 20,
        backgroundColor: theme.colors.card, 
        borderBottomWidth: 2,
        borderBottomColor: theme.colors.text,
      },
      titleInput: {
        flex: 1,
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.text,
        fontFamily: 'TitilliumWeb_700Bold',
        borderBottomWidth: 2,
        borderBottomColor: theme.colors.text,
        height: 50,
      },
      closeButton: {
        marginLeft: 15,
        padding: 5,
      },
      formContainer: {
        padding: 20,
      },
      row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        borderBottomWidth: 2,
        borderBottomColor: theme.colors.text,
        marginBottom: 20,
      },
      iconPreview: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: theme.colors.text,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        marginRight: 20,
      },
      label: {
        fontSize: 24,
        color: theme.colors.text,
        fontFamily: 'TitilliumWeb_700Bold',
        fontWeight: 'bold',
      },
      radioGroup: {
        marginTop: 10,
        gap: 15,
      },
      radioRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
      },
      radioOuter: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 4,
        borderColor: theme.colors.text,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 20,
      },
      radioOuterSelected: {
        borderColor: theme.colors.text,
      },
      radioInner: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: theme.colors.text,
      },
      radioLabel: {
        fontSize: 24,
        color: theme.colors.text,
        fontFamily: 'TitilliumWeb_700Bold',
      },
      createButton: {
        backgroundColor: theme.colors.card,
        borderRadius: 8,
        borderWidth: 3,
        borderColor: theme.colors.text,
        padding: 20,
        alignItems: 'center',
        marginTop: 30,
      },
      createButtonText: {
        color: theme.colors.text,
        fontSize: 26,
        fontFamily: 'TitilliumWeb_700Bold',
        fontWeight: 'bold',
      }
    });
  }

  return StyleSheet.create({
    modalBackdropContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)', 
    },
    modalBackdrop: {
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
    },
    modalView: {
      width: '90%',
      backgroundColor: theme.colors.background,
      borderRadius: 24,
      overflow: 'hidden', 
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.m,
      paddingTop: theme.spacing.m,
      paddingBottom: theme.spacing.s,
      backgroundColor: theme.colors.primary,
    },
    titleInput: {
      flex: 1,
      fontSize: 20,
      fontWeight: 'bold',
      color: '#FFFFFF',
      fontFamily: 'TitilliumWeb_700Bold',
      borderBottomWidth: 1,
      borderBottomColor: '#FFFFFF90',
    },
    closeButton: {
      marginLeft: 15,
    },
    formContainer: {
      padding: theme.spacing.m,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.m,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    iconPreview: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.border,
      marginRight: theme.spacing.m,
    },
    label: {
      fontSize: 18,
      color: theme.colors.text,
      fontFamily: 'TitilliumWeb_400Regular',
    },
    radioGroup: {
      marginTop: 10,
    },
    radioRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
    },
    radioOuter: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.m,
    },
    radioOuterSelected: {
      borderColor: theme.colors.primary,
    },
    radioInner: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: theme.colors.primary,
    },
    radioLabel: {
      fontSize: 18,
      color: theme.colors.text,
      fontFamily: 'TitilliumWeb_400Regular',
    },
    createButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 25,
      padding: theme.spacing.m,
      alignItems: 'center',
      marginTop: theme.spacing.l,
    },
    createButtonText: {
      color: 'white',
      fontSize: 18,
      fontFamily: 'TitilliumWeb_700Bold',
    }
  });
};

export default AddFolderModal;