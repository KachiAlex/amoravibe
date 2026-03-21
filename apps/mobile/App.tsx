import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';

const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL ?? 'https://amoravibe-web.netlify.app';

export default function App() {
  const [isLoading, setIsLoading] = React.useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#111827" />
        </View>
      )}

      <WebView
        source={{ uri: WEB_URL }}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        userAgent="Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 999,
  },
});
