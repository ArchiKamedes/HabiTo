import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HabitsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>HabitsScreen</Text>
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

export default HabitsScreen;