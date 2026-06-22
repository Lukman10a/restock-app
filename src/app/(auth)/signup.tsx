import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Fonts, Spacing, Layout } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signup, error } = useAuth();

  const handleSignup = async () => {
    if (!name || !email || !password) return;
    setLoading(true);
    try {
      await signup(name, email, password);
    } catch {
      // error is set in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.headerContainer}>
        <View style={styles.logoPlaceholder} />
        <Text style={styles.wordmark}>Restock</Text>
      </View>

      <View style={styles.formContainer}>
        {error && <View style={styles.errorBanner}><Text style={styles.errorText}>{error}</Text></View>}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            placeholderTextColor={Colors.textSecondary}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="john@example.com"
            placeholderTextColor={Colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="••••••••"
              placeholderTextColor={Colors.textSecondary}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.toggleText}>{showPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSignup} disabled={loading}>
          {loading
            ? <ActivityIndicator color={Colors.card} />
            : <Text style={styles.buttonText}>Create Account</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.linkText}>Already have an account? Log in</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    paddingHorizontal: Spacing.double,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: Spacing.double * 1.5,
  },
  logoPlaceholder: {
    width: 64,
    height: 64,
    backgroundColor: Colors.accent,
    borderRadius: 16,
    marginBottom: Spacing.base,
    ...Layout.shadow,
  },
  wordmark: {
    fontFamily: Fonts.bold,
    fontSize: 32,
    color: Colors.primary,
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: Spacing.base * 1.5,
  },
  label: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.primary,
    marginBottom: Spacing.half,
  },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius,
    paddingHorizontal: Spacing.base,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: Spacing.base,
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  toggleText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.accent,
    paddingLeft: Spacing.base,
  },
  errorBanner: {
    backgroundColor: '#FF3B3015',
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderRadius: Layout.borderRadius,
    padding: Spacing.base,
    marginBottom: Spacing.base,
  },
  errorText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: '#FF3B30',
  },
  buttonDisabled: { opacity: 0.6 },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.base,
    borderRadius: Layout.borderRadius,
    alignItems: 'center',
    marginTop: Spacing.base,
  },
  buttonText: {
    fontFamily: Fonts.bold,
    color: Colors.card,
    fontSize: 16,
  },
  linkButton: {
    marginTop: Spacing.double,
    alignItems: 'center',
  },
  linkText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
