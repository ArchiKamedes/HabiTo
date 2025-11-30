import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Twoja lista kolorów
const AVAILABLE_COLORS = [

    '#CFECCD', // Mint
    '#7DB842', // Pea Green
    '#258644', // Forest Green
    '#6BC5D8', // Sky Blue
    '#2551A8', // Cobalt
    '#1F2753', // Navy
    '#F1EA18', // Lemon
    '#dcb14eff', // Yellow
    '#FF8018', // Orange
    '#DD253C', // Red
    '#B46EB1', // Lilac
    '#8C7AB2', // Lavender
    '#E6348B', // Magenta
    '#94214D', // Burgundy
    '#D2B48C', // Brown Light
    '#8B4513', // Brown Dark
    '#808080', // Gray
];

const ColorPickerModal = ({ visible, onClose, onSelectColor, selectedColor }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const renderColorItem = ({ item }) => {
    const isSelected = item === selectedColor;
    return (
      <Pressable 
        style={[styles.colorItem, { backgroundColor: item }]} 
        onPress={() => {
          onSelectColor(item);
          onClose();
        }}
      >
        {/* Jeśli wybrany, pokaż "ptaszka" */}
        {isSelected && <Ionicons name="checkmark" size={24} color="white" />}
      </Pressable>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Wybierz kolor</Text>
          
          <FlatList
            data={AVAILABLE_COLORS}
            renderItem={renderColorItem}
            keyExtractor={(item) => item}
            numColumns={4} // Siatka 4 kolumny
            columnWrapperStyle={styles.row} // Styl dla wierszy siatki
          />
          
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Anuluj</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

const getStyles = (theme) => StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'TitilliumWeb_700Bold',
  },
  row: {
    justifyContent: 'space-around', // Rozłożenie kulek
    marginBottom: 15,
  },
  colorItem: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)', // Delikatna obwódka
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: theme.colors.inactive,
    fontFamily: 'TitilliumWeb_400Regular',
  },
});

export default ColorPickerModal;