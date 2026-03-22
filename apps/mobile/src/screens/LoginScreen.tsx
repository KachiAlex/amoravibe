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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import type { NavigationProp } from '@react-navigation/native';
import { HeroBanner } from '../components/HeroBanner';
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
  const [emailFocused, setEmailFocused] = React.useState(false);
  const [passwordFocused, setPasswordFocused] = React.useState(false);

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
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Hero Banner with logo and introduction */}
          <HeroBanner compact={true} />

          <View style={styles.container}>

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome Back</Text>
            <Text style={styles.cardSubtitle}>Sign in to your account</Text>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputWrapper, emailFocused && styles.inputWrapperFocused]}>
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={palette.ink700}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  editable={!isLoading}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputWrapper, passwordFocused && styles.inputWrapperFocused]}>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={palette.ink700}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  editable={!isLoading}
                  secureTextEntry
                />
              </View>
            </View>

            {/* Error Message */}
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.buttonWrapper, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              <View
                style={[styles.buttonGradient, { backgroundColor: palette.rose500 }]}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Sign In</Text>
                )}
              </View>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>New to Amoravibe?</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={styles.buttonSecondary}
              onPress={handleSignUp}
              disabled={isLoading}
              activeOpacity={0.85}
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
      </KeyboardAvoidingView>
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
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  container: {
    gap: 32,
    paddingHorizontal: 24,
    paddingVertical: 24,
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
  inputWrapper: {
    borderWidth: 1.5,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    backgroundColor: '#fafafa',
    transition: 'all 0.2s',
  },
  inputWrapperFocused: {
    borderColor: palette.rose500,
    backgroundColor: '#fff',
    shadowColor: palette.rose500,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
  input: {
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
  buttonWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
    minHeight: 48,
  },
  buttonGradient: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: palette.rose500,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  buttonSecondary: {
    borderWidth: 1.5,
    borderColor: palette.rose500,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonTextSecondary: {
    color: palette.rose500,
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
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
