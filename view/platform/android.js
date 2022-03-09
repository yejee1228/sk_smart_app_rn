import React, { useRef, useState } from "react";
import { BackHandler } from "react-native";
import { useNavigation } from "@react-navigation/core";
import { useFocusEffect } from "@react-navigation/native";
import { WebView } from "react-native-webview";

const Android = ({ url }) => {
    const INJECTED_JAVASCRIPT = `(function() {
        AsyncStorage.setItem("memberCode", 1);
        AsyncStorage.setItem("isApp", true);
        })();`;

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


    //자동로그인
    // webview->rn
    const handleOnMessage = ({nativeEvent}) => {
        console.log(nativeEvent.data);
        if(nativeEvent.data.autologin){
            AsyncStorage.setItem({'logininfo' : JSON.parse(nativeEvent)}, () => {
                console.log('자동로그인')
              });
        }else{
            AsyncStorage.setItem({'logininfo' : null }, () => {
                console.log('자동로그인 아님')
              });
        }
    };


    // rn->webview 
    const sendMessage = () => {
        /* AsyncStorage.getItem('nickname', (err, result) => {
            const UserInfo = Json.parse(result);
            console.log('닉네임 : ' + UserInfo.nickname); // 출력 => 닉네임 : User1 
            console.log('휴대폰 : ' + UserInfo.phonnumber); //  출력 => 휴대폰 : 010-xxxx-xxxx
          });
 */
        webview.current.postMessage(JSON.stringify(AsyncStorage.getItem('logininfo')));
    }
    return (
        <WebView
            ref={webview}
            source={{uri: url}}
            originWhitelist={['*']}
            startInLoadingState
            onNavigationStateChange={(navState) => {SetCanGoBack(navState.canGoBack) + backPress(navState);}}
            injectedJavaScript={INJECTED_JAVASCRIPT}
            onMessage={handleOnMessage}
            onShouldStartLoadWithRequest={event => {return onShouldStartLoadWithRequest(event);}}
            handleSetRef={handleSetRef}
            handleEndLoading={sendMessage}
        />
    );
};

export default Android;