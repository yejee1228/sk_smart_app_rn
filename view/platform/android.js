import React, { useRef, useState } from "react";
import { BackHandler } from "react-native";
import { useNavigation } from "@react-navigation/core";
import { useFocusEffect } from "@react-navigation/native";
import { WebView } from "react-native-webview";

const androidWebView = ({ url }) => {

    //뒤로가기 설정
    const INJECTED_JAVASCRIPT = `(function() {
        AsyncStorage.setItem("memberCode", 1);
        AsyncStorage.setItem("isApp", true);
        })();`;

    const navigation = useNavigation();
    const webview = useRef(null);
    const [canGoBack, SetCanGoBack] = useState(false);

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

    return (
        <WebView
            ref={webview}
            source={{uri: url}}
            originWhitelist={['*']}
            startInLoadingState
            onNavigationStateChange={(navState) => {SetCanGoBack(navState.canGoBack) + backPress(navState);}}
            injectedJavaScript={INJECTED_JAVASCRIPT}
            onMessage={(event) => { }}
            onShouldStartLoadWithRequest={event => {return onShouldStartLoadWithRequest(event);}}
        />
    );
};

export default androidWebView;