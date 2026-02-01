import React, { useState, useEffect, Suspense } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { OrbitControls, useGLTF, Html } from '@react-three/drei/native';
import { collection, query, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { useTheme } from '../context/ThemeContext';
import Platform3D from '../components/Platform3D';
import { getStyles } from '../styles/PlantScreen.styles';

const PLANT_LIBRARY = {
  sansevieriat: {
    stage1: require('../models/plant001.glb'),
    stage2: require('../models/plant002.glb'),
    stage3: require('../models/plant003.glb'),
  },
  sunflower: {
    stage1: require('../models/plant011.glb'),
    stage2: require('../models/plant012.glb'),
    stage3: require('../models/plant013.glb'),
  },
};

const PLANT_NAMES = {
  sansevieria: 'Sansevieria',
  sunflower: 'Słonecznik',
};

const calculateSpiralPosition = (index) => {
  const SPACING = 1.6; 
  const angle = index * 2.39996; 
  const radius = SPACING * Math.sqrt(index);
  const x = radius * Math.cos(angle);
  const z = radius * Math.sin(angle);
  return [x, 0, z];
};

function PlantInfoBubble({ visible, habitName, plantType, points, theme }) {
  if (!visible) return null;

  let stage = 1;
  if (points >= 16) stage = 3;
  else if (points >= 6) stage = 2;

  const plantName = PLANT_NAMES[plantType] || PLANT_NAMES.default;

  return (
    <View 
      style={[
        localStyles.bubbleContainer, 
        { backgroundColor: theme.colors.card, borderColor: theme.colors.text }
      ]}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={`Szczegóły nawyku: ${habitName}. Roślina: ${plantName}, Etap: ${stage}, Wykonane serie: ${points}`}
    >
      <Text style={[localStyles.bubbleTextBold, { color: theme.colors.text }]}>
        {habitName}
      </Text>
      <Text style={[localStyles.bubbleText, { color: theme.colors.text }]}>
        Roślina: {plantName}
      </Text>
      <Text style={[localStyles.bubbleText, { color: theme.colors.text }]}>
        Etap: {stage}
      </Text>
      <Text style={[localStyles.bubbleText, { color: theme.colors.text }]}>
        Serie: {points}
      </Text>
      <View style={[localStyles.bubbleArrow, { borderTopColor: theme.colors.text }]} />
    </View>
  );
}

function PlantModel({ type, points, position, habitName, isSelected, onSelect, theme }) {
  const selectedPlantSet = PLANT_LIBRARY[type] || PLANT_LIBRARY.default;

  let modelSource = selectedPlantSet.stage1;
  if (points >= 16) {
    modelSource = selectedPlantSet.stage3;
  } else if (points >= 6) {
    modelSource = selectedPlantSet.stage2;
  }

  const { scene } = useGLTF(modelSource);
  const clonedScene = scene.clone(true);

  return (
    <group position={[position[0], position[1] + 0.6, position[2]]}>
      <primitive 
        object={clonedScene} 
        scale={1.5}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      />
      <Html position={[0, 2.5, 0]} center zIndexRange={[100, 0]}>
        <PlantInfoBubble 
          visible={isSelected}
          habitName={habitName}
          plantType={type}
          points={points}
          theme={theme}
        />
      </Html>
    </group>
  );
}

const PlantScreen = () => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [habits, setHabits] = useState([]);
  const [selectedHabitId, setSelectedHabitId] = useState(null);
  const user = auth.currentUser;

  const checkPlantHealth = async (habitData) => {
    if (!habitData.lastCompletedDate) return;

    const today = new Date();
    const lastDate = new Date(habitData.lastCompletedDate);
    
    const diffTime = Math.abs(today - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    if (diffDays > 1) {
      const daysMissed = diffDays - 1;
      let currentPoints = habitData.growthPoints || 0;
      
      let newPoints = currentPoints - daysMissed;
      if (newPoints < 0) newPoints = 0;

      if (newPoints !== currentPoints) {
        try {
          const habitRef = doc(db, 'users', user.uid, 'habits', habitData.id);
          await updateDoc(habitRef, {
            growthPoints: newPoints
          });
        } catch (error) {
          console.error(error);
        }
      }
    }
  };

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'users', user.uid, 'habits'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const habitsData = [];
      snapshot.forEach(doc => {
        const data = { ...doc.data(), id: doc.id };
        habitsData.push(data);
        checkPlantHealth(data);
      });
      setHabits(habitsData);
    });

    return () => unsubscribe();
  }, [user]);

  const handleBackgroundClick = () => {
    setSelectedHabitId(null);
  };

  return (
    <View style={styles.container}>
      <Canvas 
        camera={{ position: [0, 15, 10], fov: 50 }}
        onPointerMissed={handleBackgroundClick}
        accessible={true}
        accessibilityLabel="Wirtualny ogród 3D"
        accessibilityHint="Użyj gestów aby obracać widok. Kliknij na roślinę aby zobaczyć szczegóły."
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
        <OrbitControls makeDefault />

        <Suspense fallback={null}>
          <group position={[0, -1, 0]}>
            {habits.map((habit, index) => {
              const position = calculateSpiralPosition(index);
              const points = habit.growthPoints || 0;
              const type = habit.plantType || 'default';
              const isSelected = selectedHabitId === habit.id;

              return (
                <group key={habit.id}>
                  <Platform3D 
                    position={position}
                    color={habit.color || '#4CAF50'} 
                  />
                  <PlantModel 
                    type={type} 
                    points={points} 
                    position={position}
                    habitName={habit.habitName}
                    isSelected={isSelected}
                    onSelect={() => setSelectedHabitId(isSelected ? null : habit.id)}
                    theme={theme}
                  />
                </group>
              );
            })}
          </group>
        </Suspense>
      </Canvas>
    </View>
  );
};

export default PlantScreen;