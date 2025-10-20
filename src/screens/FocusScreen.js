import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const FocusScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>FocusScreen</Text>
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

export default FocusScreen;