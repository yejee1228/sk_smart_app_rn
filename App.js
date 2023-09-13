import React, { useEffect } from 'react'
import SplashScreen from 'react-native-splash-screen'
import { View, StyleSheet, Alert, Linking } from 'react-native'
import HomeScreen from './view/HomeScreen'
import VersionCheck from 'react-native-version-check'
import SendIntentAndroid from 'react-native-send-intent'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ccc',
    justifyContent: 'center',
  },
})

const App = () => {
  const AppVersionCheck = async () => {
    //기기에 설치되 있는 버전
    let CurrentVersion = VersionCheck.getCurrentVersion()
    //앱의 최신버전
    let LatestVersion = await VersionCheck.getLatestVersion()
    console.log('version:', CurrentVersion, LatestVersion)
    //기기에 설치되있는 버전과 앱에 올려져있는 최신버전을 비교
    VersionCheck.needUpdate({
      currentVersion: CurrentVersion,
      latestVersion: LatestVersion,
    }).then((res) => {
      console.log(res)
      if (res.isNeeded) {
        Alert.alert('필수 업데이트 사항이 있습니다.', '', [
          {
            text: '스토어이동',
            onPress: () => {
              if (Platform.OS == 'android') {
                SendIntentAndroid.openAppWithUri(
                  'https://play.google.com/store/apps/details?id=com.sk_smart_app_rn&pcampaignid=web_share'
                )
              } else {
                Linking.openURL(
                  'https://itunes.apple.com/kr/app/sk-shieldus-smart-learning/id1614934713'
                )
              }
            },
          },
        ])
      }
    })
  }

  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hide()
      AppVersionCheck()
    }, 1500)
  }, [])

  return (
    <View style={styles.container}>
      <HomeScreen />
    </View>
  )
}

export default App
