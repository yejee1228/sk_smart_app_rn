import React, { useState, useRef } from 'react'
import { Linking, TouchableWithoutFeedback, Alert } from 'react-native'
import { useNavigation } from '@react-navigation/core'
import { StyleSheet, View, ActivityIndicator, SafeAreaView } from 'react-native'
import { WebView } from 'react-native-webview'
import AsyncStorage from '@react-native-async-storage/async-storage'
import RNFS from 'react-native-fs'

const Ios = ({ url }) => {
  const navigation = useNavigation()
  const [start, setStart] = useState(false)
  const webview = useRef(null)

  const onNavigationStateChange = (navState) => {
    const { canGoBack } = navState

    if (!navState.url.includes('skshieldus.megahrd.co.kr')) {
      Linking.openURL(navState.url).catch((err) => webview.current.goBack())
    }
    if (canGoBack) {
      navigation.setParams({
        isCanBack: {
          title: '',
          onPress: () => webview.current.goBack(),
        },
      })
    } else {
      navigation.setParams({
        isCanBack: null,
      })
    }
  }

  //intent 설정
  const onShouldStartLoadWithRequest = (event) => {
    if (
      event.url.startsWith('http://') ||
      event.url.startsWith('https://') ||
      event.url.startsWith('about:blank')
    ) {
      return true
    }
    Linking.openURL(event.url)
      .then(webview.current.goBack())
      .catch((err) => Linking.openURL('https://itunes.apple.com/kr/app/aquanmanager/id1048325731'))

    return false
  }

  //자동로그인, 다운로드
  const handleOnMessage = async ({ nativeEvent }) => {
    //login 정보 받음.
    let data = JSON.parse(nativeEvent.data)
    if (data.type === 'download') {
      //다운로드
      const url = data.url
      const originalFileName = data.fileName
      const downloadFolder = RNFS.DownloadDirectoryPath
      console.log(downloadFolder)
      try {
        const uniqueFileName = await generateUniqueFileName(originalFileName, downloadFolder)
        const destPath = `${RNFS.DownloadDirectoryPath}/${uniqueFileName}`
        const options = {
          fromUrl: url,
          toFile: destPath,
        }
        const downloadResult = await RNFS.downloadFile(options)
        downloadResult.promise
          .then((result) => {
            if (result.statusCode === 200) {
              Alert.alert('다운로드 완료', `${uniqueFileName}가 다운로드 폴더에 저장되었습니다.`)
            } else {
              Alert.alert('다운로드 실패', '파일 다운로드가 실패했습니다.')
            }
          })
          .catch((error) => {
            console.error(error)
            Alert.alert('오류', '다운로드에 오류가 발생했습니다. 고객센터에 문의해주세요.')
          })
      } catch (error) {
        console.error(error)
        Alert.alert('오류', '다운로드에 오류가 발생했습니다. 고객센터에 문의해주세요.')
      }
    } else {
      //자동로그인
      AsyncStorage.setItem('logininfo', JSON.stringify(data))
    }
  }

  // 다운로드 파일명 수정
  const generateUniqueFileName = async (originalFileName, folder) => {
    let fileName = originalFileName
    let counter = 1
    const extension = fileName.split('.').pop()
    const baseName = fileName.slice(0, -(extension.length + 1))
    while (await RNFS.exists(`${folder}/${fileName}`)) {
      fileName = `${baseName}(${counter}).${extension}`
      counter++
    }
    return fileName
  }

  const sendMessage = () => {
    //웹앱 로딩완료 시 실행
    if (start === false) {
      AsyncStorage.getItem('logininfo', (e, d) => {
        if (d != null) {
          const loginInfo = JSON.parse(d)
          if (loginInfo.autologin) {
            //webview.current.injectJavaScript(`window.location.replace("https://megac.megahrd.co.kr/sso/sso/void.sso.type8.user?sso.login_id=${loginInfo.loginid}&sso.member_cmpy_code=CY000462&sso.redirect_url=/m/mobile/mobileTI/login.mbl")`)
            webview.current.injectJavaScript(
              `window.location.replace("https://skshieldus.megahrd.co.kr/sso/sso/void.sso.type8.user?sso.login_id=${loginInfo.loginid}&sso.member_cmpy_code=CY000793&sso.redirect_url=/m/mobile/mobileTI/login.mbl")`
            )
          }
        }
      })
      setStart(true)
    }
  }

  return (
    <TouchableWithoutFeedback>
      <SafeAreaView style={styles.root}>
        <View style={styles.root}>
          <WebView
            ref={webview}
            source={{ uri: url }}
            startInLoadingState
            originWhitelist={['*']}
            renderLoading={() => (
              <View style={{ flex: 1, alignItems: 'center' }}>
                <ActivityIndicator size="large" />
              </View>
            )}
            allowsBackForwardNavigationGestures={true}
            onNavigationStateChange={(navState) => onNavigationStateChange(navState)}
            onShouldStartLoadWithRequest={(event) => {
              return onShouldStartLoadWithRequest(event)
            }}
            onMessage={handleOnMessage}
            onLoadStart={sendMessage}
          />
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  browserContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
})

export default Ios
