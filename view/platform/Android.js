import React, { useRef, useState } from 'react'
import { BackHandler, KeyboardAvoidingView, Alert } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { WebView } from 'react-native-webview'
import AsyncStorage from '@react-native-async-storage/async-storage'
import GestureRecognizer from 'react-native-swipe-gestures'
import RNFS from 'react-native-fs'

const Android = ({ url }) => {
  const webview = useRef(null)
  const [canGoBack, setCanGoBack] = useState(false)
  const [start, setStart] = useState(false)

  // 하드웨어적인 뒤로가기 설정
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (webview.current && canGoBack) {
          webview.current.goBack()
          return true
        } else {
          return false
        }
      }
      BackHandler.addEventListener('hardwareBackPress', onBackPress)
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress)
    }, [canGoBack])
  )

  //intent 설정
  const onShouldStartLoadWithRequest = (event) => {
    if (
      event.url.startsWith('http://') ||
      event.url.startsWith('https://') ||
      event.url.startsWith('about:blank')
    ) {
      return true
    }
    const SendIntentAndroid = require('react-native-send-intent')
    SendIntentAndroid.openAppWithUri(event.url)
      .then((isOpened) => {
        if (!isOpened) {
          alert('앱 실행이 실패했습니다')
        }
      })
      .catch((err) => {
        console.log(err)
      })

    return false
  }

  //자동로그인, 다운로드
  const handleOnMessage = async ({ nativeEvent }) => {
    //웹뷰 정보 받음.
    let data = JSON.parse(nativeEvent.data)
    if (data.type === 'download') {
      //다운로드
      const url = data.url
      const originalFileName = data.fileName
      const downloadFolder = RNFS.DownloadDirectoryPath

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
    <GestureRecognizer
      config={{
        velocityThreshold: 0.3,
        directionalOffsetThreshold: 80,
      }}
      style={{
        flex: 1,
      }}>
      <KeyboardAvoidingView
        style={{ flexGrow: 1 }}
        keyboardVerticalOffset={-300}
        behavior="padding">
        <WebView
          ref={webview}
          source={{ uri: url }}
          originWhitelist={['*']}
          startInLoadingState
          allowsFullscreenVideo={true}
          allowsBackForwardNavigationGestures={true}
          textZoom={100}
          onNavigationStateChange={(navState) => {
            setCanGoBack(navState.canGoBack)
          }}
          onShouldStartLoadWithRequest={(event) => {
            return onShouldStartLoadWithRequest(event)
          }}
          onMessage={handleOnMessage}
          onLoadStart={sendMessage}
        />
      </KeyboardAvoidingView>
    </GestureRecognizer>
  )
}
export default Android
