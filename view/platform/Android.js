import React, {useRef, useState} from 'react';
import {BackHandler, KeyboardAvoidingView} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {WebView} from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GestureRecognizer from 'react-native-swipe-gestures';

const Android = ({url}) => {
  const webview = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [start, setStart] = useState(false);

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
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [canGoBack]),
  );

  //intent 설정
  const onShouldStartLoadWithRequest = event => {
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
        if (!isOpened) {
          alert('앱 실행이 실패했습니다');
        }
      })
      .catch(err => {
        console.log(err);
      });

    return false;
  };

  //자동로그인
  const handleOnMessage = ({nativeEvent}) => {
    //login 정보 받음.
    let data = JSON.parse(nativeEvent.data);
    AsyncStorage.setItem('logininfo', JSON.stringify(data));
  };

  const sendMessage = () => {
    //웹앱 로딩완료 시 실행
    if (start === false) {
      AsyncStorage.getItem('logininfo', (e, d) => {
        if (d != null) {
          const loginInfo = JSON.parse(d);
          if (loginInfo.autologin) {
            //url 제거
            webview.current.injectJavaScript(
              ``,
            );
          }
        }
      });
      setStart(true);
    }
  };

  return (
    <GestureRecognizer
      config={{
        velocityThreshold: 0.3,
        directionalOffsetThreshold: 80,
      }}
      style={{
        flex: 1,
      }}>
      <KeyboardAvoidingView
        style={{flexGrow: 1}}
        keyboardVerticalOffset={-300}
        behavior="padding">
        <WebView
          ref={webview}
          source={{uri: url}}
          originWhitelist={['*']}
          startInLoadingState
          allowsFullscreenVideo={true}
          allowsBackForwardNavigationGestures={true}
          textZoom={100}
          onNavigationStateChange={navState => {
            setCanGoBack(navState.canGoBack);
          }}
          onShouldStartLoadWithRequest={event => {
            return onShouldStartLoadWithRequest(event);
          }}
          onMessage={handleOnMessage}
          onLoadStart={sendMessage}
        />
      </KeyboardAvoidingView>
    </GestureRecognizer>
  );
};
export default Android;
