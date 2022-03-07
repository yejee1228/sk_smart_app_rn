import React, { useState } from "react";
import { useNavigation } from "@react-navigation/core";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
 
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

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    browserContainer: {
        flex: 2,
    },
});

const iosWebView = ({url}) => {
    return (
        <View style={styles.root}>
            <View style={styles.browserContainer}>
                <WebView
                    ref={(ref) => {
                        setBrowserRef(ref);
                    }}
                    source={{
                        uri: url,
                    }}
                    startInLoadingState
                    originWhitelist={["*"]}
                    renderLoading={() => (
                        <View style={{ flex: 1, alignItems: "center" }}>
                            <ActivityIndicator size="large" />
                        </View>
                    )}
                    allowsBackForwardNavigationGestures
                    onNavigationStateChange={(navState) =>
                        onNavigationStateChange(navState)
                    }
                    injectedJavaScript={INJECTED_JAVASCRIPT}
                    onMessage={(event) => { }}
                />
            </View>
        </View>
    );
};

export default iosWebView;