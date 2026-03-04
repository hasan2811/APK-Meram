import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import SplashAnimation from './components/SplashAnimation';
import AppWebView from './components/AppWebView';
import { StatusBar } from 'expo-status-bar';

// Tahan native splash screen sampai React siap
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  // Saat komponen pertama kali mount, sembunyikan native splash
  const onLayoutReady = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

  const onSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  return (
    <View style={styles.container} onLayout={onLayoutReady}>
      <StatusBar style="dark" />
      {/* WebView selalu di-render agar pre-load, tapi tersembunyi selama splash */}
      <View style={[styles.webviewContainer, showSplash && styles.hidden]}>
        <AppWebView />
      </View>
      {/* Splash animation di atas segalanya */}
      {showSplash && <SplashAnimation onFinish={onSplashFinish} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  webviewContainer: {
    flex: 1,
  },
  hidden: {
    opacity: 0,
  },
});
