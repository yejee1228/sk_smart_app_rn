import React, { useState, useRef } from "react";
import { KeyboardAvoidingView, Linking } from "react-native";
import { useNavigation } from "@react-navigation/core";
import { StyleSheet, View, ActivityIndicator, SafeAreaView } from "react-native";
import { WebView } from "react-native-webview";
import AsyncStorage from '@react-native-async-storage/async-storage';

const Ios = ({ url }) => {
    const navigation = useNavigation();
    //const [browserRef, setBrowserRef] = useState(null)
    const [start, setStart] = useState(false)
    const webview = useRef(null);

    const onNavigationStateChange = (navState) => {
        const { canGoBack } = navState;

        if (canGoBack) {
            navigation.setParams({
                isCanBack: {
                    title: "",
                    onPress: () => browserRef.goBack(),
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
        Linking.openURL(event.url)
            .catch(err => {
                alert('실행을 실패했습니다. 설치가 되어있지 않은 경우 아쿠아 플레이어 앱을 설치해주세요.');
            });
        if(event.url.includes('itms-appss://',0)){
            webview.current.goBack()
        }
        return false;
    };
    //intent 설정


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
                        webview.current.injectJavaScript(`window.location.replace("https://megac.megahrd.co.kr/sso/sso/void.sso.type4.user?sso.login_id=${loginInfo.loginid}&sso.member_cmpy_code=CY000462")`)
                        //webview.current.injectJavaScript(`window.location.replace("https://skshieldus.megahrd.co.kr/sso/sso/void.sso.type4.user?sso.login_id=${loginInfo.loginid}&sso.member_cmpy_code=CY000793")`)

                    }
                }
            })
            setStart(true)
        }
    }

    return (
        <>
            <SafeAreaView style={styles.root}>
                <View style={styles.browserContainer}>
                    <WebView
                        //ref={(ref) => { setBrowserRef(ref); }}
                        ref = {webview}
                        source={{ uri: url }}
                        startInLoadingState
                        originWhitelist={['*']}
                        renderLoading={() => (
                            <View style={{ flex: 1, alignItems: "center" }}>
                                <ActivityIndicator size="large" />
                            </View>
                        )}
                        scrollEnabled={true}
                        allowsBackForwardNavigationGestures = {true}
                        onNavigationStateChange={(navState) => onNavigationStateChange(navState)}
                        onShouldStartLoadWithRequest={event => { return onShouldStartLoadWithRequest(event); }}
                        onMessage={handleOnMessage}
                        onLoadStart={sendMessage}
                    />
                </View>
            </SafeAreaView>
        </>
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