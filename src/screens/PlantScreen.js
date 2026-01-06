import React, { useState, useEffect, Suspense } from 'react';
import { View } from 'react-native';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { useTheme } from '../context/ThemeContext';
import Platform3D from '../components/Platform3D';
import { calculateHexPosition } from '../utils/hexMath';
import { getStyles } from '../styles/PlantScreen.styles';

const PlantScreen = () => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [habits, setHabits] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'habits'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const habitsData = [];
      snapshot.forEach(doc => habitsData.push({ ...doc.data(), id: doc.id }));
      setHabits(habitsData);
    });
    return () => unsubscribe();
  }, [user]);

  return (
    <View style={styles.container}>
      <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
        <OrbitControls makeDefault />

        <Suspense fallback={null}>
          <group position={[0, -1, 0]}>
            {habits.map((habit, index) => {
              const position = calculateHexPosition(index);
              return (
                <Platform3D 
                  key={habit.id} 
                  position={position}
                  color={habit.color} 
                />
              );
            })}
          </group>
        </Suspense>
      </Canvas>
    </View>
  );
};

export default PlantScreen;