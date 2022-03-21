import React, { useState, useRef } from "react";
import { Linking } from "react-native";
import { useNavigation } from "@react-navigation/core";
import { StyleSheet, View, ActivityIndicator, SafeAreaView } from "react-native";
import { WebView } from "react-native-webview";
import AsyncStorage from '@react-native-async-storage/async-storage';
import GestureRecognizer from 'react-native-swipe-gestures';

const Ios = ({ url }) => {
    const navigation = useNavigation()
    const [start, setStart] = useState(false)
    const webview = useRef(null)

    const onSwipeLeft = () => {
        webview.current.goForward()
    }
    const onSwipeRight = () => {
        webview.current.goBack()
    }

    const onNavigationStateChange = (navState) => {
        const { canGoBack } = navState;

        if (!navState.url.includes("skshieldus.megahrd.co.kr")) {
            Linking.openURL(navState.url).catch(err=>webview.current.goBack())
        }
        if (canGoBack) {
            navigation.setParams({
                isCanBack: {
                    title: "",
                    onPress: () => webview.current.goBack(),
                },
            });
        } else {
            navigation.setParams({
                isCanBack: null,
            });
        }
    };

    //intent 설정
    const onShouldStartLoadWithRequest = (event) => {
        if (
            event.url.startsWith('http://') ||
            event.url.startsWith('https://') ||
            event.url.startsWith('about:blank')
        ) {
            return true;
        }
        Linking.openURL(event.url).catch(err=>alert('error'))
        
        return false;
    };

    //자동로그인
    const handleOnMessage = ({ nativeEvent }) => {
        //login 정보 받음.
        let data = JSON.parse(nativeEvent.data)
        AsyncStorage.setItem('logininfo', JSON.stringify(data))
    }

    const sendMessage = () => {
        //웹앱 로딩완료 시 실행
        if (start === false) {
            AsyncStorage.getItem('logininfo', (e, d) => {
                if(d != null) {
                    const loginInfo = JSON.parse(d)
                    if (loginInfo.autologin) {
                        //webview.current.injectJavaScript(`window.location.replace("https://megac.megahrd.co.kr/sso/sso/void.sso.type8.user?sso.login_id=${loginInfo.loginid}&sso.member_cmpy_code=CY000462&sso.redirect_url=/m/mobile/mobileTI/login.mbl")`)
                        webview.current.injectJavaScript(`window.location.replace("https://skshieldus.megahrd.co.kr/sso/sso/void.sso.type8.user?sso.login_id=${loginInfo.loginid}&sso.member_cmpy_code=CY000793&sso.redirect_url=/m/mobile/mobileTI/login.mbl")`)

                    }
                }
            })
            setStart(true)
        }
    }
    

    return (
        <GestureRecognizer
            onSwipeLeft={onSwipeLeft}
            onSwipeRight={onSwipeRight}
            config={{
                velocityThreshold: 0.3,
                directionalOffsetThreshold: 80,
            }}
            style={{
                flex: 1,
            }}>
            <SafeAreaView style={styles.root}>
                <View style={styles.browserContainer}>
                    <WebView
                        ref = {webview}
                        source={{ uri: url }}
                        startInLoadingState
                        originWhitelist={['*']}
                        renderLoading={() => (
                            <View style={{ flex: 1, alignItems: "center" }}>
                                <ActivityIndicator size="large" />
                            </View>
                        )}
                        allowsBackForwardNavigationGestures = {true}
                        onNavigationStateChange={(navState) => onNavigationStateChange(navState)}
                        onShouldStartLoadWithRequest={event => { return onShouldStartLoadWithRequest(event); }}
                        onMessage={handleOnMessage}
                        onLoadStart={sendMessage}
                    />
                </View>
            </SafeAreaView>
        </GestureRecognizer>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    browserContainer: {
        flex: 2,
    },
});

export default Ios;