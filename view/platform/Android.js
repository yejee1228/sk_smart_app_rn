import React, { useRef, useState } from "react";
import { BackHandler, KeyboardAvoidingView } from "react-native";
import { useNavigation } from "@react-navigation/core";
import { useFocusEffect } from "@react-navigation/native";
import { WebView } from "react-native-webview";
import AsyncStorage from '@react-native-async-storage/async-storage';
import GestureRecognizer from 'react-native-swipe-gestures';

const Android = ({ url }) => {
    const navigation = useNavigation()
    const webview = useRef(null)
    const [canGoBack, setCanGoBack] = useState(false)
    const [start, setStart] = useState(false)

    const onSwipeDown = () => {
        webview.current.reload()
    }
    const onSwipeLeft = () => {
        webview.current.goForward()
    }
    const onSwipeRight = () => {
        webview.current.goBack()
    }


    // 하드웨어적인 뒤로가기 설정
    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                if (webview.current && canGoBack) {
                    webview.current.goBack()
                    return true
                } else {
                    return false
                }
            }
            BackHandler.addEventListener("hardwareBackPress", onBackPress)
            return () =>
                BackHandler.removeEventListener("hardwareBackPress", onBackPress)
        }, [canGoBack])
    )

    // 소프트웨어적인 뒤로가기 설정
    const backPress = (navState) => {
        const { canGoBack } = navState

        if (canGoBack) {
            navigation.setParams({
                isCanBack: {
                    title: "",
                    onPress: onPress,
                },
            })
        } else {
            navigation.setParams({
                isCanBack: null,
            })
        }
    }

    const onPress = () => webview.current.goBack()

    //intent 설정
    const onShouldStartLoadWithRequest = (event) => {
        if (
            event.url.startsWith('http://') ||
            event.url.startsWith('https://') ||
            event.url.startsWith('about:blank')
        ) {
            return true
        }
        const SendIntentAndroid = require('react-native-send-intent')
        SendIntentAndroid.openAppWithUri(event.url)
            .then(isOpened => {
                if (!isOpened) { alert('앱 실행이 실패했습니다') }
            })
            .catch(err => {
                console.log(err)
            })

        return false

    }

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
                if (d != null) {
                    const loginInfo = JSON.parse(d)
                    if (loginInfo.autologin) {
                        webview.current.injectJavaScript(`window.location.replace("https://megac.megahrd.co.kr/sso/sso/void.sso.type8.user?sso.login_id=${loginInfo.loginid}&sso.member_cmpy_code=CY000462")`)
                        //webview.current.injectJavaScript(`window.location.replace("https://skshieldus.megahrd.co.kr/sso/sso/void.sso.type8.user?sso.login_id=${loginInfo.loginid}&sso.member_cmpy_code=CY000793")`)

                    }
                }
            })
            setStart(true)
        }
    }
    
    return (
        <GestureRecognizer
            onSwipeDown={onSwipeDown}
            onSwipeLeft={onSwipeLeft}
            onSwipeRight={onSwipeRight}
            config={{
                velocityThreshold: 0.3,
                directionalOffsetThreshold: 80,
            }}
            style={{
                flex: 1,
            }}>
            <KeyboardAvoidingView
                style={{ flexGrow: 1 }}
                keyboardVerticalOffset={-250}
                behavior="padding"
            >
                <WebView
                    ref={webview}
                    source={{ uri: url }}
                    originWhitelist={['*']}
                    startInLoadingState
                    allowsBackForwardNavigationGestures = {true}
                    textZoom={100}
                    onNavigationStateChange={(navState) => { setCanGoBack(navState.canGoBack) + backPress(navState) }}
                    onShouldStartLoadWithRequest={event => { return onShouldStartLoadWithRequest(event) }}
                    onMessage={handleOnMessage}
                    onLoadStart={sendMessage}
                />
            </KeyboardAvoidingView>
        </GestureRecognizer>
    )
}
export default Android;