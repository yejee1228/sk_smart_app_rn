import React from 'react';
import {View, StyleSheet} from 'react-native'
import HomeScreen from './view/HomeScreen'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ccc',
    justifyContent: 'center',
  },
});

const App = () => {
  return (
    <View style={styles.container}>
      <HomeScreen/>
    </View>
  );
};

export default App;