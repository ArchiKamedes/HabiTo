// Przykład dla HomeScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HomeScreen = () => { // ZMIEŃ NAZWĘ DLA STATS, SETTINGS ITD.
  return (
    <View style={styles.container}>
      <Text style={styles.text}>HomeScreen</Text> // ZMIEŃ TEKST
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

export default HomeScreen; // ZMIEŃ NAZWĘ