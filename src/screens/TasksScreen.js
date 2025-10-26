import React from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, ScrollView } from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

const TasksScreen = () => { 
  const insets = useSafeAreaInsets();
  const { theme } = useTheme(); 
  const styles = getStyles(theme);

  return (
    <ScrollView 
      style={styles.mainContainer}
    
      contentContainerStyle={{ 
          paddingTop: insets.top + 120, 
          paddingBottom: insets.bottom + 100 
      }}
    >
      <View style={styles.topRowContainer}>
        <View style={styles.titleTaskContainer}>
          <Text style={styles.titleTaskText}>Zadania</Text>
        </View>
        <View style={styles.taskAddContainer}>
          <View style={styles.taskAddShape}><FontAwesome5 name='plus' size={24} color={'white'} /></View>
        </View>
      </View>

      {/* Folders Row*/}
      <View style={styles.foldersContainer}>
        <View style={styles.foldersChoiceContainer}>
          <Text style={styles.placeholderText}>Folders Choice</Text>
        </View>
        <View style={styles.foldersAddContainer}>
          <Text style={styles.placeholderText}>Add Folder</Text>
        </View>
      </View>

      {/*Days Row */}
      <View style={styles.daysContainer}>
        <View style={styles.titleTodayContainer}>
          <Text style={styles.placeholderText}>Przyszłe</Text>
        </View>
        {/* days-choice' and 'days-date'*/}
        <View style={styles.daysDateContainer}>
          <Text style={styles.placeholderText}>Days/Date Area</Text>
        </View>
      </View>

      {/*Tasks Today Area */}
      <View style={styles.tasksTodayContainer}>
        <Text style={styles.placeholderText}>Tasks Today List Area</Text>
      </View>

      {/*Title Future */}
      <View style={styles.titleFutureContainer}>
        <Text style={styles.placeholderText}>Title Future</Text>
      </View>

      {/*Tasks Future Area */}
      <View style={styles.tasksFutureContainer}>
        <Text style={styles.placeholderText}>Tasks Future List Area</Text>
      </View>

    </ScrollView> 
  );
};

const getStyles = (theme) => StyleSheet.create({
mainContainer: {
    flex: 1, 
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.m, 
  },

  topRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', 
    marginBottom: theme.spacing.m,
  },
  foldersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
 
  titleTaskContainer: {
    flex: 1, 
    padding: theme.spacing.s,
    borderWidth: 1,
    borderColor: 'purple',
    marginRight: theme.spacing.s,
  },
  taskAddContainer: {
    padding: theme.spacing.s,
    borderWidth: 1,
    borderColor: 'purple',
  },
  foldersChoiceContainer: {
    flex: 1, 
    padding: theme.spacing.m,
    borderWidth: 1,
    borderColor: 'black',
    marginRight: theme.spacing.s,
  },
  foldersAddContainer: {
    padding: theme.spacing.s,
    borderWidth: 1,
    borderColor: 'black',
  },
  titleTodayContainer: {
    padding: theme.spacing.s,
    borderWidth: 1,
    borderColor: 'black',
  },
  
  daysDateContainer: {
    flex: 1, 
    padding: theme.spacing.s,
    borderWidth: 1,
    borderColor: 'black',
    marginLeft: theme.spacing.s,
  },
  tasksTodayContainer: {
    padding: theme.spacing.l,
    borderWidth: 2,
    borderColor: 'lightgreen',
    marginBottom: theme.spacing.l,
    minHeight: 150, 
  },
  titleFutureContainer: {
    padding: theme.spacing.s,
    borderWidth: 1,
    borderColor: 'black',
    marginBottom: theme.spacing.s,
    alignSelf: 'flex-start', 
  },
  tasksFutureContainer: {
    padding: theme.spacing.l,
    borderWidth: 2,
    borderColor: 'lightgreen',
    minHeight: 150, 
    marginBottom: theme.spacing.l, 
  },

  //SHAPES
  taskAddShape:{
  width: 45,
  height: 45,
  borderRadius: 25,
  backgroundColor: theme.colors.active,
  justifyContent: 'center',
  alignItems: 'center',
  },

  placeholderText: {
      color: theme.colors.inactive, 
      fontSize: 12,
  },
  titleTaskText:{
    color: theme.colors.inactive, 
    fontSize: 32,
  }
});

export default TasksScreen; 