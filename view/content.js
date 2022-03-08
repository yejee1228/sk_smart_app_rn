import React from 'react';
import { StyleSheet, View} from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AndroidPlatform from './androidWebView';

const WebView = () => {
    const url = "https://www.megahrd.co.kr/m/mobile/mobileTI/login.mbl";
    return (
        <View style={styles.root}>
            <View style={styles.browser}>
                <AndroidPlatform url={url} />
            </View>
        </View>
    )
}

const Stack = createStackNavigator();

const content = () => {
    return (
        <>
            <NavigationContainer>
                <Stack.Navigator>
                    <Stack.Screen name="WebView" component={WebView} options={{headerShown: false}}/>
                </Stack.Navigator>
            </NavigationContainer>

        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems:'center',
        justifyContent: "center"
    },
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

export default content;