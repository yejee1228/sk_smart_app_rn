import React, {useState, useRef} from 'react';
import {Linking, TouchableWithoutFeedback} from 'react-native';
import {useNavigation} from '@react-navigation/core';
import {StyleSheet, View, ActivityIndicator, SafeAreaView} from 'react-native';
import {WebView} from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Ios = ({url}) => {
  const navigation = useNavigation();
  const [start, setStart] = useState(false);
  const webview = useRef(null);

  const onNavigationStateChange = navState => {
    const {canGoBack} = navState;

    if (!navState.url.includes('skshieldus.megahrd.co.kr')) {
      Linking.openURL(navState.url).catch(err => webview.current.goBack());
    }
    if (canGoBack) {
      navigation.setParams({
        isCanBack: {
          title: '',
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
  const onShouldStartLoadWithRequest = event => {
    if (
      event.url.startsWith('http://') ||
      event.url.startsWith('https://') ||
      event.url.startsWith('about:blank')
    ) {
      return true;
    }
    Linking.openURL(event.url)
      .then(webview.current.goBack())
      .catch(err =>
        Linking.openURL(
          'https://itunes.apple.com/kr/app/aquanmanager/id1048325731',
        ),
      );

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
            //webview.current.injectJavaScript(`window.location.replace("https://megac.megahrd.co.kr/sso/sso/void.sso.type8.user?sso.login_id=${loginInfo.loginid}&sso.member_cmpy_code=CY000462&sso.redirect_url=/m/mobile/mobileTI/login.mbl")`)
            webview.current.injectJavaScript(
              `window.location.replace("https://skshieldus.megahrd.co.kr/sso/sso/void.sso.type8.user?sso.login_id=${loginInfo.loginid}&sso.member_cmpy_code=CY000793&sso.redirect_url=/m/mobile/mobileTI/login.mbl")`,
            );
          }
        }
      });
      setStart(true);
    }
  };

  return (
    <TouchableWithoutFeedback>
      <SafeAreaView style={styles.root}>
        <View style={styles.root}>
          <WebView
            ref={webview}
            source={{uri: url}}
            startInLoadingState
            originWhitelist={['*']}
            renderLoading={() => (
              <View style={{flex: 1, alignItems: 'center'}}>
                <ActivityIndicator size="large" />
              </View>
            )}
            allowsBackForwardNavigationGestures={true}
            onNavigationStateChange={navState =>
              onNavigationStateChange(navState)
            }
            onShouldStartLoadWithRequest={event => {
              return onShouldStartLoadWithRequest(event);
            }}
            onMessage={handleOnMessage}
            onLoadStart={sendMessage}
          />
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  browserContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
});

export default Ios;
