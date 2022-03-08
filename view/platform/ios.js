import React, { useState } from "react";
import { useNavigation } from "@react-navigation/core";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";


const iosWebView = ({ url }) => {
    
    //뒤로가기 설정
    const INJECTED_JAVASCRIPT = `(function() {
        AsyncStorage.setItem("memberCode", 1);
        AsyncStorage.setItem("isApp", true);
       
      })();`;

    const navigation = useNavigation();
    const [browserRef, setBrowserRef] = useState(null);

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
                alert('앱 실행이 실패했습니다. 설치가 되어있지 않은 경우 설치하기 버튼을 눌러주세요.');
            });
        return false;
    };
    //intent 설정

    return (
        <View style={styles.root}>
            <View style={styles.browserContainer}>
                <WebView
                    ref={(ref) => {setBrowserRef(ref);}}
                    source={{uri: url}}
                    startInLoadingState
                    originWhitelist={['*']}
                    renderLoading={() => (
                        <View style={{ flex: 1, alignItems: "center" }}>
                            <ActivityIndicator size="large" />
                        </View>
                    )}
                    allowsBackForwardNavigationGestures
                    onNavigationStateChange={(navState) =>onNavigationStateChange(navState)}
                    injectedJavaScript={INJECTED_JAVASCRIPT}
                    onMessage={(event) => { }}
                    onShouldStartLoadWithRequest={event => {return onShouldStartLoadWithRequest(event);}}
                />
            </View>
        </View>
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

export default iosWebView;