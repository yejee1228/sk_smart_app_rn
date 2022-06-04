import React from 'react';
import { StyleSheet, View, Platform } from "react-native";
import AndroidPlatform from './platform/Android';
import IosPlatform from './platform/Ios';

const WebViewScreen = () => {
  const url = "";

  return (
      <View style={styles.browser}>
        {Platform.OS === 'ios' ?
          <IosPlatform url={url} /> :
          <AndroidPlatform url={url} />
        }
      </View>
  )
}

const styles = StyleSheet.create({
  browser: {
    flex: 1,
    flexDirection: "row",
  },
  root: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    display: "flex",
  },
});

export default WebViewScreen;
