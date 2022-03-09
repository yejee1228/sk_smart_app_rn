import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import WebViewScreen from './WebViewScreen';


const content = () => {
    const Stack = createStackNavigator();
    return (
        <>
            <NavigationContainer>
                <Stack.Navigator>
                    <Stack.Screen name="WebViewScreen" component={WebViewScreen} options={{ headerShown: false }} />
                </Stack.Navigator>
            </NavigationContainer>

        </>
    );
};

export default content;