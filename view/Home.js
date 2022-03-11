import React from 'react';
import { StatusBar } from 'react-native'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import WebViewScreen from './WebView';
//import { LogBox } from 'react-native';

const HomeViewScreen = () => {
    /* LogBox.ignoreLogs([
        'Non-serializable values were found in the navigation state',
       ]); */
    const Stack = createStackNavigator();
    return (
        <>
            <StatusBar barStyle="white-content" />        
            <NavigationContainer>
                <Stack.Navigator>
                    <Stack.Screen name="WebViewScreen" component={WebViewScreen} options={{ headerShown: false }} />
                </Stack.Navigator>
            </NavigationContainer>

        </>
    );
};

export default HomeViewScreen;