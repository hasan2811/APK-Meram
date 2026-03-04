import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, StatusBar, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';

export default function AppWebView() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar
          backgroundColor="#ffffff"
          barStyle="dark-content"
          animated={true}
        />

        {isLoading && !hasError && (
          <ActivityIndicator style={styles.loader} size="large" color="#000000" />
        )}

        {hasError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Koneksi terputus atau gagal memuat halaman.</Text>
          </View>
        ) : (
          <WebView
            source={{ uri: 'https://nmdctr--nmdc-tr-6733e.asia-southeast1.hosted.app/feed' }}
            style={styles.webview}
            onLoadEnd={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
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
