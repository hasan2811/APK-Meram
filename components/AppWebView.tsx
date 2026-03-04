import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
  StatusBar,
  Platform,
  BackHandler,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Notifications from 'expo-notifications';

// Konfigurasi tampilan notifikasi saat app foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function AppWebView() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const webViewRef = useRef<WebView>(null);

  // ── 1. Request push notification permission ──────────────────────
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        const token = await Notifications.getExpoPushTokenAsync();
        console.log('Expo Push Token:', token.data);
      }
    })();
  }, []);

  // ── 2. Android Hardware Back Button ──────────────────────────────
  useEffect(() => {
    const handleBackPress = () => {
      if (webViewRef.current) {
        webViewRef.current.goBack();
        return true; // navigasi mundur di WebView, cegah keluar app
      }
      return false; // biarkan sistem handle (keluar app)
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => subscription.remove();
  }, []);

  // ── 3. Status bar height fix (Android overlap) ───────────────────
  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

  return (
    <View style={[styles.container, { paddingTop: statusBarHeight }]}>
      <StatusBar
        backgroundColor="#ffffff"
        barStyle="dark-content"
        translucent={false}
        animated={true}
      />

      {isLoading && !hasError && (
        <ActivityIndicator style={styles.loader} size="large" color="#3B82F6" />
      )}

      {hasError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Koneksi terputus atau gagal memuat halaman.</Text>
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          source={{ uri: 'https://nmdctr--nmdc-tr-6733e.asia-southeast1.hosted.app/feed' }}
          style={styles.webview}
          onLoadEnd={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsBackForwardNavigationGestures={true}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  webview: { flex: 1 },
  loader: {
    position: 'absolute',
    top: '50%',
    alignSelf: 'center',
    zIndex: 1,
  },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { color: 'red', fontSize: 16, textAlign: 'center' },
});
