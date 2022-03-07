import React, { useRef, useState } from "react";
import { BackHandler } from "react-native";
import { useNavigation } from "@react-navigation/core";
import { useFocusEffect } from "@react-navigation/native";
import { WebView } from "react-native-webview";

const INJECTED_JAVASCRIPT = `(function() {
  AsyncStorage.setItem("memberCode", 1);
  AsyncStorage.setItem("isApp", true);
})();`;

const navigation = useNavigation();
const webview = useRef(null);
const [canGoBack, SetCanGoBack] = useState(false);

// 안드로이드의 하드웨어적인 뒤로가기 설정
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

// 안드로이드의 소프트웨어적인 뒤로가기 설정
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

const androidWebView = ({ url }) => {
    return (
        <WebView
            source={{
                uri: url,
            }}
            ref={webview}
            onNavigationStateChange={(navState) => {
                SetCanGoBack(navState.canGoBack) + backPress(navState);
            }}
            injectedJavaScript={INJECTED_JAVASCRIPT}
            onMessage={(event) => { }}
        />
    );
};

export default androidWebView;