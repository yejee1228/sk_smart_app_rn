import React from 'react';
import { StyleSheet, View, Platform } from "react-native";
import AndroidPlatform from './platform/Android';
import IosPlatform from './platform/Ios';
import { GestureRecognizer} from 'react-native-swipe-gestures';

const WebViewScreen = () => {
    const url = "https://megac.megahrd.co.kr/m/mobile/mobileTI/login.mbl";
    //const url = "https://skshieldus.megahrd.co.kr/m/mobile/mobileTI/login.mbl";
    const onSwipeDown = (gestureState) => {
        this.setState({myText: 'You swiped down!'});
      }
    
    const onSwipeLeft = (gestureState) => {
        this.setState({myText: 'You swiped left!'});
      }
    
    const onSwipeRight = (gestureState) => {
        this.setState({myText: 'You swiped right!'});
      }
    return (
        <GestureRecognizer
            onSwipeDown={(state) => this.onSwipeDown(state)}
            onSwipeLeft={(state) => this.onSwipeLeft(state)}
            onSwipeRight={(state) => this.onSwipeRight(state)}
          config={{
            velocityThreshold: 0.3,
            directionalOffsetThreshold: 80,
          }}
          style={{
            flex: 1,
          }}>
            <View style={styles.browser}>
                {Platform.OS === 'ios' ?
                    <IosPlatform url={url} /> :
                    <AndroidPlatform url={url} />
                }
            </View>
        </GestureRecognizer>
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