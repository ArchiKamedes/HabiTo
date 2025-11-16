import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Modal, Pressable } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

// Importy Firebase
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

const AddFolderModal = ({ visible, onClose, defaultFolderType }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  // Stany dla formularza
  const [folderName, setFolderName] = useState('');
  const [icon, setIcon] = useState('briefcase'); // Domyślna ikona
  
  // Ten stan jest kontrolowany przez ekran nadrzędny
  const [folderType, setFolderType] = useState(defaultFolderType);

  // Aktualizuj stan, jeśli zmieni się prop (np. przy ponownym otwarciu)
  useEffect(() => {
    setFolderType(defaultFolderType);
  }, [defaultFolderType]);

  const handleAddFolder = async () => {
    const user = auth.currentUser;
    if (!user || folderName.trim() === '') {
      alert('Proszę podać nazwę folderu.');
      return;
    }

    // Określ docelową kolekcję na podstawie typu
    const collectionName = folderType === 'task' ? 'TaskFolders' : 'HabitsFolders';
    
    try {
      // Ścieżka do podkolekcji użytkownika
      const folderCollectionRef = collection(db, 'users', user.uid, collectionName);
      
      await addDoc(folderCollectionRef, {
        name: folderName.trim(),
        icon: icon,
        color: theme.colors.primary, // Domyślny kolor
        createdAt: serverTimestamp(),
        // Nie musimy tu zapisywać typu, bo jest on określony przez nazwę kolekcji
      });

      console.log(`Folder ${folderType} dodany!`);
      handleClose(); // Zamknij i zresetuj
    } catch (error) {
      console.error("Błąd podczas dodawania folderu: ", error);
      alert('Nie udało się dodać folderu.');
    }
  };

  const handleClose = () => {
    setFolderName(''); // Resetuj nazwę
    setIcon('briefcase'); // Resetuj ikonę
    onClose(); // Zamknij modal
  };

  // Niestandardowy Radio Button
  const RadioButton = ({ label, selected, onSelect }) => (
    <Pressable style={styles.radioRow} onPress={onSelect} disabled={true}>
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </Pressable>
  );

  return (
    <Modal
      animationType="fade"
      transparent={true} // Przezroczyste tło
      visible={visible} // Kontrolowane przez stan rodzica
      onRequestClose={handleClose}
    >
      {/* Tło modala (przyciemnione) */}
      <Pressable style={styles.modalBackdrop} onPress={handleClose}>
        
        {/* Kontener "mini-ekranu" (aby nie zamykał się po kliknięciu na niego) */}
        <Pressable style={styles.modalView}>
          
          {/* Nagłówek (gradient) */}
          <View style={styles.header}>
            <TextInput style={styles.titleInput} placeholder="Nazwa Folderu" placeholderTextColor="#FFFFFF90"  value={folderName} onChangeText={setFolderName}/>
            <Pressable onPress={handleClose} style={styles.closeButton}>
             <Ionicons name="close-circle" size={30} color="#FFFFFF" />
            </Pressable>
          </View>
          {/* Ciało formularza */}
          <View style={styles.formContainer}>
            
            {/* Wybór Ikony (na razie "zaślepka") */}
            <Pressable style={styles.row}>
              <View style={styles.iconPreview}>
                <FontAwesome5 name={icon} size={24} color={theme.colors.text} />
              </View>
              <Text style={styles.label}>Ikona</Text>
            </Pressable>
            
            {/* Wybór typu folderu */}
            <RadioButton 
              label="Zadania"
              selected={folderType === 'task'}
              // Na razie blokujemy możliwość zmiany
              // onSelect={() => setFolderType('task')} 
            />
            <RadioButton 
              label="Nawyk"
              selected={folderType === 'habit'}
              // onSelect={() => setFolderType('habit')}
            />

            {/* Przycisk Dodaj */}
            <Pressable style={styles.createButton} onPress={handleAddFolder}>
              <Text style={styles.createButtonText}>Dodaj</Text>
            </Pressable>

          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// --- Style ---
const getStyles = (theme) => StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Przyciemnione tło
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: '90%',
    backgroundColor: theme.colors.background,
    borderRadius: 24,
    overflow: 'hidden', // Aby gradient nie wychodził poza rogi
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
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.m,
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