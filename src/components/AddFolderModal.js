import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Modal, Pressable, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

const AddFolderModal = ({ visible, onClose, type }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [folderName, setFolderName] = useState('');
  const [icon, setIcon] = useState('briefcase');
  const [selectedType, setSelectedType] = useState(type || 'task');

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

  const RadioButton = ({ label, value, current, onSelect }) => (
    <Pressable 
      style={styles.radioRow} 
      onPress={() => onSelect(value)}
      accessible={true}
      accessibilityRole="radio"
      accessibilityState={{ checked: current === value }}
      accessibilityLabel={`Typ folderu: ${label}`}
    >
      <View style={[styles.radioOuter, current === value && styles.radioOuterSelected]}>
        {current === value && <View style={styles.radioInner} />}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </Pressable>
  );

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={handleClose}>
        
        <Pressable style={styles.modalView}>
          
          <View style={styles.header}>
            <TextInput 
                style={styles.titleInput} 
                placeholder="Nazwa Folderu" 
                placeholderTextColor="#FFFFFF90"  
                value={folderName} 
                onChangeText={setFolderName}
                accessible={true}
                accessibilityLabel="Wpisz nazwę nowego folderu"
            />
            <Pressable 
              onPress={handleClose} 
              style={styles.closeButton}
              accessible={true}
              accessibilityLabel="Zamknij okno"
              accessibilityRole="button"
            >
             <Ionicons name="close-circle" size={30} color="#FFFFFF" />
            </Pressable>
          </View>

          <View style={styles.formContainer}>
            
            <Pressable 
              style={styles.row}
              accessible={true}
              accessibilityLabel={`Wybrana ikona: ${icon}`}
            >
              <View style={styles.iconPreview}>
                <FontAwesome5 name={icon} size={24} color={theme.colors.text} />
              </View>
              <Text style={styles.label}>Ikona</Text>
            </Pressable>
            
            <View style={styles.radioGroup} accessible={true} accessibilityRole="radiogroup">
              <RadioButton 
                label="Zadania"
                value="task"
                current={selectedType}
                onSelect={setSelectedType}
              />
              <RadioButton 
                label="Nawyki"
                value="habit"
                current={selectedType}
                onSelect={setSelectedType}
              />
            </View>

            <Pressable 
              style={styles.createButton} 
              onPress={handleAddFolder}
              accessible={true}
              accessibilityLabel="Utwórz folder"
              accessibilityRole="button"
            >
              <Text style={styles.createButtonText}>Dodaj</Text>
            </Pressable>

          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const getStyles = (theme) => StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center',
    alignItems: 'center',
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

export default AddFolderModal;