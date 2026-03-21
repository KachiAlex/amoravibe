import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  NavigationContainer,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView, type WebViewNavigation } from 'react-native-webview';

type RootStackParamList = {
  Hero: undefined;
  WebFlow: { mode: 'signin' | 'signup' | 'dashboard' };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const WEB_BASE_URL = process.env.EXPO_PUBLIC_WEB_URL ?? 'https://amoravibe-web.netlify.app';

function resolveStartUrl(mode: RootStackParamList['WebFlow']['mode']): string {
  if (mode === 'signup') {
    return `${WEB_BASE_URL}/onboarding`;
  }
  if (mode === 'dashboard') {
    return `${WEB_BASE_URL}/dashboard`;
  }
  return `${WEB_BASE_URL}/?openSignIn=1`;
}

function HeroScreen({ navigation }: { navigation: any }) {
  return (
    <SafeAreaView style={styles.heroSafeArea}>
      <StatusBar style="light" />
      <View style={styles.heroContainer}>
        <Image
          source={{ uri: `${WEB_BASE_URL}/images/default-avatar.png` }}
          style={styles.heroLogo}
        />
        <Text style={styles.heroTitle}>Amoravibe</Text>
        <Text style={styles.heroSubtitle}>Verified connections. Real conversations.</Text>

        <View style={styles.heroActions}>
          <Pressable
            onPress={() => navigation.navigate('WebFlow', { mode: 'signin' })}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Sign in</Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('WebFlow', { mode: 'signup' })}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Sign up</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function WebFlowScreen({ route, navigation }: { route: any; navigation: any }) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [currentUrl, setCurrentUrl] = React.useState(resolveStartUrl(route.params.mode));
  const startUrl = React.useMemo(() => resolveStartUrl(route.params.mode), [route.params.mode]);

  const handleNavigation = (navState: WebViewNavigation) => {
    setCurrentUrl(navState.url);
  };

  return (
    <SafeAreaView style={styles.webSafeArea}>
      <StatusBar style="dark" />
      <View style={styles.webHeader}>
        <Pressable onPress={() => navigation.navigate('Hero')} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Home</Text>
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate('WebFlow', { mode: 'dashboard' })}
          style={styles.headerButton}
        >
          <Text style={styles.headerButtonText}>Dashboard</Text>
        </Pressable>
      </View>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#111827" />
          <Text style={styles.loadingText}>Loading web experience...</Text>
        </View>
      )}

      <WebView
        source={{ uri: startUrl }}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onNavigationStateChange={handleNavigation}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
      />

      <View style={styles.urlBar}>
        <Text numberOfLines={1} style={styles.urlText}>
          {currentUrl}
        </Text>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <NavigationContainer theme={NavigationDefaultTheme}>
      <Stack.Navigator initialRouteName="Hero" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Hero" component={HeroScreen} />
        <Stack.Screen name="WebFlow" component={WebFlowScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  heroSafeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  heroContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 14,
  },
  heroLogo: {
    width: 92,
    height: 92,
    borderRadius: 46,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  heroActions: {
    width: '100%',
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#f43f5e',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryButton: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  webSafeArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  webHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerButton: {
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    zIndex: 20,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#111827',
    fontWeight: '500',
  },
  urlBar: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  urlText: {
    color: '#6b7280',
    fontSize: 11,
  },
});
