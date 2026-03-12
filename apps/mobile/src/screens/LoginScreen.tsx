import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import type { NavigationProp } from '@react-navigation/native';
const palette = {
  ink900: '#1a202c',
  ink700: '#374151',
  sand100: '#faf8f6',
  rose500: '#f43f5e',
  rose300: '#fb7185',
  sea400: '#06b6d4',
};

type RootStackParamList = {
  Login: undefined;
  Onboarding: undefined;
  Landing: undefined;
  TrustCenter: undefined;
};

export function LoginScreen({ navigation }: { navigation: NavigationProp<RootStackParamList> }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // For now, just navigate to Landing screen after a brief delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      navigation.navigate('Landing');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    navigation.navigate('Onboarding');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>💕 Amoravibe</Text>
            <Text style={styles.tagline}>Find Your Perfect Match</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome Back</Text>
            <Text style={styles.cardSubtitle}>Sign in to your account</Text>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={palette.ink700}
                value={email}
                onChangeText={setEmail}
                editable={!isLoading}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={palette.ink700}
                value={password}
                onChangeText={setPassword}
                editable={!isLoading}
                secureTextEntry
              />
            </View>

            {/* Error Message */}
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>New to Amoravibe?</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              <Text style={styles.buttonTextSecondary}>Create Account</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Links */}
          <View style={styles.footer}>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Forgot Password?</Text>
            </TouchableOpacity>
            <View style={styles.footerDot} />
            <TouchableOpacity>
              <Text style={styles.footerLink}>Help Center</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.sand100,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  container: {
    gap: 32,
  },
  header: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  logo: {
    fontSize: 36,
    fontWeight: '700',
    color: palette.ink900,
  },
  tagline: {
    fontSize: 16,
    color: palette.ink700,
    fontWeight: '500',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 28,
    shadowColor: palette.ink900,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 24,
    elevation: 5,
    gap: 20,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.ink900,
  },
  cardSubtitle: {
    fontSize: 14,
    color: palette.ink700,
    marginBottom: 12,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.ink900,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: palette.ink900,
    minHeight: 48,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: palette.rose500,
  },
  errorText: {
    color: palette.rose500,
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonPrimary: {
    backgroundColor: palette.rose500,
  },
  buttonSecondary: {
    borderWidth: 1.5,
    borderColor: palette.rose500,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonTextSecondary: {
    color: palette.rose500,
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    fontSize: 12,
    color: palette.ink700,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  footerLink: {
    fontSize: 13,
    color: palette.rose500,
    fontWeight: '500',
  },
  footerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.ink700,
  },
});
