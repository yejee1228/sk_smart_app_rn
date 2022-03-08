import React from 'react';
import { StyleSheet, View, Platform } from "react-native";
import AndroidPlatform from './platform/android';
import IosPlatform from './platform/ios';

const webViewScreen = () => {
    const url = "https://www.megahrd.co.kr/m/mobile/mobileTI/login.mbl";
    return (
        <View style={styles.root}>
            <View style={styles.browser}>
                {Platform.OS === 'ios' ?
                    <IosPlatform url={url} /> :
                    <AndroidPlatform url={url} />
                }
            </View>
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

export default webViewScreen;