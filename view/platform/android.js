import React, { useRef, useState } from "react";
import { BackHandler, KeyboardAvoidingView } from "react-native";
import { useNavigation } from "@react-navigation/core";
import { useFocusEffect } from "@react-navigation/native";
import { WebView } from "react-native-webview";
import AsyncStorage from '@react-native-async-storage/async-storage';

const Android = ({ url }) => {
    const navigation = useNavigation();
    const webview = useRef(null);
    const [canGoBack, SetCanGoBack] = useState(false);

    const handleSetRef = _ref => {
        webview = _ref;
    };

    // 하드웨어적인 뒤로가기 설정
    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                if (webview.current && canGoBack) {
                    webview.current.goBack();
                    return true;
                } else {
                    return false;
                }
            };
            BackHandler.addEventListener("hardwareBackPress", onBackPress);
            return () =>
                BackHandler.removeEventListener("hardwareBackPress", onBackPress);
        }, [canGoBack])
    );

    // 소프트웨어적인 뒤로가기 설정
    const backPress = (navState) => {
        const { canGoBack } = navState;

        if (canGoBack) {
            navigation.setParams({
                isCanBack: {
                    title: "",
                    onPress: onPress,
                },
            });
        } else {
            navigation.setParams({
                isCanBack: null,
            });
        }
    };
    const onPress = () => webview.current.goBack()


    //intent 설정
    const onShouldStartLoadWithRequest = (event) => {
        if (
            event.url.startsWith('http://') ||
            event.url.startsWith('https://') ||
            event.url.startsWith('about:blank')
        ) {
            return true;
        }
        const SendIntentAndroid = require('react-native-send-intent');
        SendIntentAndroid.openAppWithUri(event.url)
            .then(isOpened => {
                if (!isOpened) { alert('앱 실행이 실패했습니다'); }
            })
            .catch(err => {
                console.log(err);
            });

        return false;

    };
    //intent 설정


    //자동로그인
    const handleOnMessage = ({ nativeEvent }) => {
        let data = JSON.parse(nativeEvent.data)
        AsyncStorage.setItem('logininfo', JSON.stringify(data));
    };


    const sendMessage = () => {
        /* AsyncStorage.getItem('nickname', (err, result) => {
            const UserInfo = Json.parse(result);
            console.log('닉네임 : ' + UserInfo.nickname); // 출력 => 닉네임 : User1 
            console.log('휴대폰 : ' + UserInfo.phonnumber); //  출력 => 휴대폰 : 010-xxxx-xxxx
          });
 */
        AsyncStorage.getItem('logininfo', (e, d) => {
            const loginInfo = JSON.parse(d);
            alert(loginInfo.loginid + loginInfo.autologin);
            if (loginInfo.autologin) {
                alert(`${loginInfo.loginid} 로 자동로그인 고고`)
                webview.current.injectJavaScript(`window.location.href="https://megac.megahrd.co.kr/sso/sso/void.sso.type4.user?sso.login_id=${loginInfo.loginid}&sso.member_cmpy_code=CY000462`)
                //webview.current.injectJavaScript(`window.location.href="https://skshieldus.megahrd.co.kr/sso/sso/void.sso.type4.user?sso.login_id=${loginInfo.loginid}&sso.member_cmpy_code=CY000793`)

            }
        })
    }
    return (
        <KeyboardAvoidingView
            style={{ flexGrow: 1 }}
            keyboardVerticalOffset={-120}
            behavior="padding"
        >
            <WebView
                ref={webview}
                source={{ uri: url }}
                originWhitelist={['*']}
                startInLoadingState
                onNavigationStateChange={(navState) => { SetCanGoBack(navState.canGoBack) + backPress(navState); }}
                onMessage={handleOnMessage}
                onShouldStartLoadWithRequest={event => { return onShouldStartLoadWithRequest(event); }}
                handleSetRef={handleSetRef}
                handleEndLoading={sendMessage}
                //javaScriptEnabled={true}
                //domStorageEnabled={true}
                textZoom={100}
            />
        </KeyboardAvoidingView>
    );
};

export default Android;