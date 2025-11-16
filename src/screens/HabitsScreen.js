import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, ScrollView, TouchableOpacity, Pressable} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import AddFolderModal from '../components/AddFolderModal';
import { db, auth } from '../firebaseConfig';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';

const HabitsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme(); 
  const styles = getStyles(theme);
  const currentDate = new Date();
  const user = auth.currentUser;
  const formattedDate = currentDate.toLocaleDateString('pl-PL',{ day: 'numeric', month: 'numeric', year: 'numeric'});
  const [isFolderModalVisible, setIsFolderModalVisible] = useState(false);

  return (
    <ScrollView 
      style={styles.mainContainer}
    
      contentContainerStyle={{ 
          paddingTop: insets.top + 80, 
          paddingBottom: insets.bottom + 100 
      }}
    >
      <View style={styles.topRowContainer}>
        <View style={styles.titleHabitContainer}>
          <Text style={styles.titleHabitText}>Nawyki</Text>
        </View>
         <Pressable 
                  style={({ pressed }) => [styles.HabitAddContainer, {transform: [{ scale: pressed ? 0.85 : 1 }]}]}
                  onPress={() => navigation.getParent().navigate('HabitAdd')} >
                  <View style={styles.HabitAddShape}> 
                    <FontAwesome5 name='plus' size={24} color={theme.colors.plus} /> 
                  </View>
                </Pressable>
      </View>

      {/* Folders Row*/}
      <View style={styles.foldersContainer}>
        <View style={styles.foldersChoiceContainer}>
          <Text style={styles.placeholderText}>Folders Choice</Text>
        </View>
        <Pressable style={({ pressed }) => [styles.foldersAddContainer, {transform: [{ scale: pressed ? 0.85 : 1 }]}]}onPress={() => setIsFolderModalVisible(true)}>
          <View style={styles.folderAddShape}> 
            <FontAwesome5 name='plus' size={24} color={theme.colors.primary} /> 
          </View>
        </Pressable>
      </View>

      {/*Days Row */}
      <View style={styles.daysContainer}>
        <View style={styles.titleTodayContainer}>
          <Text style={styles.SubTytlesText}>Dzisiejsze</Text>
        </View>
        {/*today-date*/}
        <View style={styles.daysDateContainer}>
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>
      </View>

      {/*Habit Today Area */}
      <View style={styles.HabitTodayContainer}>
        <Text style={styles.placeholderText}>Tasks Today List Area</Text>
      </View>

      {/*Title Future */}
      <View style={styles.titleFutureContainer}>
        <Text style={styles.SubTytlesText}>Jutrzejsze</Text>
      </View>

      {/*Habit Future Area */}
      <View style={styles.HabitFutureContainer}>
        <Text style={styles.placeholderText}>Tasks Future List Area</Text>
      </View>

      <AddFolderModal visible={isFolderModalVisible} onClose={() => setIsFolderModalVisible(false)} defaultFolderType="habit"/>
    
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
 
  titleHabitContainer: {
    padding: theme.spacing.s,
  },
  HabitAddContainer: {
    padding: theme.spacing.s,
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
  },
  titleTodayContainer: {
    padding: theme.spacing.s,
  },
  
  daysDateContainer: {
    flex: 1, 
    padding: theme.spacing.s,
    marginLeft: theme.spacing.s,
  },
  HabitTodayContainer: {
    padding: theme.spacing.m,
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    marginBottom: theme.spacing.l,
    marginTop: theme.spacing.n,
    minHeight: 200, 
    elevation: 3,

  },
  titleFutureContainer: {
    padding: theme.spacing.s,
    marginBottom: theme.spacing.s,
    alignSelf: 'flex-start', 
  },
  HabitFutureContainer: {
    padding: theme.spacing.m,
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    minHeight: 200, 
    marginBottom: theme.spacing.l, 
    marginTop: theme.spacing.n,
    elevation: 3,
  },

  //SHAPES
  HabitAddShape:{
  width: 45,
  height: 45,
  borderRadius: 25,
  backgroundColor: theme.colors.active,
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 10,
  },

  folderAddShape:{
  width: 75,
  height: 45,
  borderRadius: 20,
  backgroundColor: theme.colors.active,
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 10,
  },

  placeholderText: {
    color: theme.colors.text,  
    fontSize: 12,
  },
  titleHabitText:{
    color: theme.colors.text, 
    fontSize: 32,
    fontFamily: 'TitilliumWeb_400Regular',
  },
  SubTytlesText:{
    color: theme.colors.text,  
    fontSize: 22,
    fontFamily: 'TitilliumWeb_400Regular',
  },
  dateText:{
    color: theme.colors.text, 
    fontSize: 22,
    fontFamily: 'TitilliumWeb_700Bold,',
  },
});

export default HabitsScreen;