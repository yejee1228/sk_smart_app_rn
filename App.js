import React from 'react';
import {View, StyleSheet} from 'react-native'
import Content from './view/content'

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
      <Content/>
    </View>
  );
};

export default App;