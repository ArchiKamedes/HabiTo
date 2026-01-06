import React from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList, StyleSheet, Pressable } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { availableIcons } from '../utils/iconsList';

const IconPickerModal = ({ visible, onClose, onSelectIcon, currentIcon }) => {
  const { theme } = useTheme();

  const renderItem = ({ item }) => {
    const isSelected = currentIcon === item.name;

    return (
      <TouchableOpacity
        style={[
          styles.iconItem,
          { backgroundColor: isSelected ? theme.colors.primary : theme.colors.card }
        ]}
        onPress={() => {
          onSelectIcon(item.name);
          onClose();
        }}
        accessible={true}
        accessibilityLabel={`Ikona: ${item.label}`}
        accessibilityHint={isSelected ? "Obecnie wybrana" : "Kliknij dwukrotnie, aby wybrać tę ikonę"}
        accessibilityRole="button"
      >
        <FontAwesome5 
          name={item.name} 
          size={28} 
          color={isSelected ? '#fff' : theme.colors.text} 
        />
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable 
        style={styles.overlay} 
        onPress={onClose}
        accessible={true}
        accessibilityLabel="Zamknij wybór ikon"
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          
          <View style={styles.header}>
            <Text 
              style={[styles.title, { color: theme.colors.text }]}
              accessibilityRole="header"
            >
              Wybierz ikonę
            </Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 10 }}>
               <Ionicons name="close" size={28} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={availableIcons}
            renderItem={renderItem}
            keyExtractor={(item) => item.name}
            numColumns={4}
            contentContainerStyle={styles.listContent}
          />
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '60%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontFamily: 'TitilliumWeb_700Bold',
  },
  listContent: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  iconItem: {
    width: 65,
    height: 65,
    margin: 10,
    borderRadius: 32.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  }
});

export default IconPickerModal;