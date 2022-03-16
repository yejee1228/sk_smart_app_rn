import React, {useEffect} from 'react';
import SplashScreen from 'react-native-splash-screen';
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
  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hide();
    }, 1500);
  }, []);

  return (
    <View style={styles.container}>
      <HomeScreen/>
    </View>
  );
};

export default App;