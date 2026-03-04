import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  StatusBar,
  Platform,
  BackHandler,
  ToastAndroid,
  Linking,
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
      // Hanya set offline jika benar-benar tidak ada koneksi
      // Null bisa terjadi saat pertama kali load, kita asumsikan online
      if (state.isConnected === false) {
        setIsOffline(true);
      } else {
        setIsOffline(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // ── 3. Smart Back Handler (Android) ─────────────────────────────
  useEffect(() => {
    const handleBackPress = () => {
      if (canGoBackRef.current) {
        webViewRef.current?.goBack();
        return true;
      }
      // Double-tap back untuk keluar app
      const now = Date.now();
      if (now - lastBackPress.current < 2000) {
        BackHandler.exitApp();
        return true;
      }
      lastBackPress.current = now;
      if (Platform.OS === 'android') {
        ToastAndroid.show('Tekan sekali lagi untuk keluar', ToastAndroid.SHORT);
      }
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => sub.remove();
  }, []);

  // ── 4. Retry dari offline screen ─────────────────────────────────
  const handleRetry = useCallback(async () => {
    const state = await NetInfo.fetch();
    if (state.isConnected) {
      setIsOffline(false);
      webViewRef.current?.reload();
    }
  }, []);

  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

  // ── 5. Fallback untuk Web Preview ─────────────────────────────────
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { paddingTop: statusBarHeight }]}>
        <StatusBar backgroundColor="#ffffff" barStyle="dark-content" translucent={false} />
        <iframe
          src={APP_URL}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Meram App Web Preview"
        />
        <View style={styles.webWarning}>
          <Text style={styles.webWarningText}>
            Mode Preview Web (Fitur Native tidak aktif)
          </Text>
        </View>
      </View>
    );
  }

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
          {/* Progress bar ala browser Chrome */}
          <LoadingBar progress={loadProgress} />

          {/* WebView utama dengan konfigurasi Scale & Scroll Native */}
          <WebView
            ref={webViewRef}
            source={{ uri: APP_URL }}
            style={styles.webview}
            userAgent={USER_AGENT}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            sharedCookiesEnabled={true}
            thirdPartyCookiesEnabled={true}

            // Performa & Skala tampilan QA fixes
            textZoom={100} // Cegah settingan font raksasa di OS Android merusak UI Web
            bounces={false} // Matikan efek memantul khas iOS Safari
            overScrollMode="never" // Matikan glow effect scroll mentok Android
            pullToRefreshEnabled={true} // Pull to refresh native dari react-native-webview

            // Media support (opsional jika PWA main media)
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            geolocationEnabled={true}

            allowsBackForwardNavigationGestures={true}

            // Loading tracker
            onLoadProgress={({ nativeEvent }) => setLoadProgress(nativeEvent.progress)}
            onLoadEnd={() => setLoadProgress(1)}
            onError={() => setLoadProgress(1)}

            // Navigasi
            onNavigationStateChange={nav => {
              canGoBackRef.current = nav.canGoBack;
            }}

            // PENTING: Handle Link Eksternal (WA, Telp, Email, Store)
            onShouldStartLoadWithRequest={(request) => {
              const url = request.url;
              // Izinkan link web biasa dibuka di dalam WebView
              if (url.startsWith('http://') || url.startsWith('https://')) {
                return true;
              }
              // Link khusus (tel:, mailto:, whatsapp:, intent://) serahkan ke OS Android
              Linking.canOpenURL(url).then(supported => {
                if (supported) {
                  Linking.openURL(url);
                }
              }).catch(err => console.log('Gagal buka URL eksternal:', err));

              // Blokir WebView agar tidak load / crash dari unknown schema
              return false;
            }}
          />
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
  webview: {
    flex: 1,
    height: '100%',
    backgroundColor: '#ffffff', // Menghindari sekilas blank background
  },
  webWarning: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'rgba(255, 152, 0, 0.9)',
    padding: 8,
    alignItems: 'center',
  },
  webWarningText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
