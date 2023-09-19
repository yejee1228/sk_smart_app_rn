import React, { useRef, useState, useEffect } from 'react'
import { BackHandler, KeyboardAvoidingView, Alert } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { WebView } from 'react-native-webview'
import AsyncStorage from '@react-native-async-storage/async-storage'
import GestureRecognizer from 'react-native-swipe-gestures'
import RNFS from 'react-native-fs'
import PushNotification from 'react-native-push-notification'
import { PERMISSIONS, request, check, RESULTS } from 'react-native-permissions'
import SendIntentAndroid from 'react-native-send-intent'

const Android = ({ url }) => {
  const webview = useRef(null)
  const [canGoBack, setCanGoBack] = useState(false)
  const [start, setStart] = useState(false)

  useEffect(() => {
    // 앱 실행 시 알림권한 요청
    checkNotificationsPermission()
  }, [])

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
    SendIntentAndroid.openAppWithUri(event.url)
      .then((isOpened) => {
        if (!isOpened) {
          Alert.alert('앱 실행이 실패했습니다')
        }
      })
      .catch((err) => {
        console.log(err)
      })

    return false
  }

  // 알림 초기설정
  PushNotification.createChannel(
    {
      channelId: 'default-channel-id',
      channelName: 'Default channel',
      channelDescription: 'A default channel',
    },
    () => {}
  )

  PushNotification.configure({
    onNotification: (notification) => {
      const mimeType = notification.data.mimeType
      SendIntentAndroid.openFileChooser(
        {
          fileUrl: notification.data.filePath,
          type: mimeType,
        },
        '파일 열기'
      )
    },
    requestPermissions: false,
  })

  // 권한 체크 및 요청 함수
  const checkAndRequestPermission = async (permission) => {
    try {
      const status = await check(permission)

      if (status === RESULTS.GRANTED) {
        return true
      } else if (status === RESULTS.DENIED) {
        // 사용자가 권한을 거부한 경우 권한 요청
        const requestStatus = await request(permission)
        if (requestStatus === RESULTS.GRANTED) {
          return true
        } else {
          return false
        }
      } else {
        return false
      }
    } catch (error) {
      return false
    }
  }

  const checkNotificationsPermission = async () => {
    const permission = PERMISSIONS.ANDROID.POST_NOTIFICATIONS
    await checkAndRequestPermission(permission)
  }

  //자동로그인, 다운로드
  const handleOnMessage = ({ nativeEvent }) => {
    //웹뷰 정보 받음.
    let data = JSON.parse(nativeEvent.data)
    if (data.type === 'download') {
      //파일 다운로드
      downloadFile(data)
    } else {
      //자동로그인
      AsyncStorage.setItem('logininfo', JSON.stringify(data))
    }
  }

  //파일 다운로드
  const downloadFile = async (data) => {
    const url = data.url
    const originalFileName = data.fileName
    const mimeType = data.mimeType
    const downloadFolder = RNFS.DownloadDirectoryPath

    try {
      const uniqueFileName = await generateUniqueFileName(originalFileName, downloadFolder)
      const destPath = `${downloadFolder}/${uniqueFileName}`
      const options = {
        fromUrl: url,
        toFile: destPath,
      }
      const downloadResult = RNFS.downloadFile(options)
      downloadResult.promise
        .then(async (result) => {
          if (result.statusCode === 200) {
            PushNotification.localNotification({
              channelId: 'default-channel-id',
              title: '다운로드 완료',
              message: uniqueFileName,
              data: {
                filePath: destPath,
                mimeType: mimeType,
              },
            })
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
            //url 제거
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
          androidHardwareAccelerationDisabled={true}
        />
      </KeyboardAvoidingView>
    </GestureRecognizer>
  )
}
export default Android
