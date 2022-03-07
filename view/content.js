import React from 'react';
import { StyleSheet, View } from "react-native";
import AndroidPlatform from './androidWebView';

const styles = StyleSheet.create({
    browser: {
        flex: 1,
        flexDirection: "row",
    },
    root: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        display: "flex",
    },
});


const content = () => {
    const url = "https://www.megahrd.co.kr/m/mobile/mobileTI/login.mbl";
    return (
        <View style={styles.root}>
            <View style={styles.browser}>
            <AndroidPlatform url={url} />
            </View>
        </View>
    );
};

export default content;