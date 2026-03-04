import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  StatusBar,
  Platform,
  BackHandler,
  ToastAndroid,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import NetInfo from '@react-native-community/netinfo';
import * as Notifications from 'expo-notifications';
import LoadingBar from './LoadingBar';
import OfflineScreen from './OfflineScreen';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const APP_URL = 'https://nmdctr--nmdc-tr-6733e.asia-southeast1.hosted.app/feed';
const USER_AGENT = 'MeramApp/1.0 (Android; Expo) react-native-webview';

export default function AppWebView() {
  const [loadProgress, setLoadProgress] = useState(0);
  const [isOffline, setIsOffline] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const canGoBackRef = useRef(false);
  const lastBackPress = useRef(0);

  // ── 1. Push Notification permission ─────────────────────────────
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        const token = await Notifications.getExpoPushTokenAsync();
        console.log('Expo Push Token:', token.data);
      }
    })();
  }, []);

  // ── 2. Offline detection ─────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  // ── 3. Smart Back Handler ─────────────────────────────────────────
  useEffect(() => {
    const handleBackPress = () => {
      if (canGoBackRef.current) {
        webViewRef.current?.goBack();
        return true;
      }
      // Double-tap back to exit
      const now = Date.now();
      if (now - lastBackPress.current < 2000) {
        BackHandler.exitApp();
        return true;
      }
      lastBackPress.current = now;
      if (Platform.OS === 'android') {
        ToastAndroid.show('Tekan lagi untuk keluar', ToastAndroid.SHORT);
      }
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => sub.remove();
  }, []);

  // ── 4. Pull-to-refresh ───────────────────────────────────────────
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    webViewRef.current?.reload();
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  // ── 5. Retry dari offline screen ─────────────────────────────────
  const handleRetry = useCallback(async () => {
    const state = await NetInfo.fetch();
    if (state.isConnected) {
      setIsOffline(false);
      webViewRef.current?.reload();
    }
  }, []);

  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

  return (
    <View style={[styles.container, { paddingTop: statusBarHeight }]}>
      <StatusBar
        backgroundColor="#ffffff"
        barStyle="dark-content"
        translucent={false}
        animated={true}
      />

      {isOffline ? (
        <OfflineScreen onRetry={handleRetry} />
      ) : (
        <>
          {/* Progress bar */}
          <LoadingBar progress={loadProgress} />

          {/* WebView dalam ScrollView untuk Pull-to-Refresh */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#3B82F6']}
                tintColor="#3B82F6"
              />
            }
          >
            <WebView
              ref={webViewRef}
              source={{ uri: APP_URL }}
              style={styles.webview}
              userAgent={USER_AGENT}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              sharedCookiesEnabled={true}
              thirdPartyCookiesEnabled={true}
              allowsBackForwardNavigationGestures={true}
              onLoadProgress={({ nativeEvent }) => setLoadProgress(nativeEvent.progress)}
              onLoadEnd={() => setLoadProgress(1)}
              onNavigationStateChange={nav => {
                canGoBackRef.current = nav.canGoBack;
              }}
              onError={() => setLoadProgress(1)}
            />
          </ScrollView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flex: 1,
  },
  webview: {
    flex: 1,
    height: '100%',
  },
});
