import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PlantScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>PlantScreen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  text: {
    fontSize: 24,
  },
});

export default PlantScreen;