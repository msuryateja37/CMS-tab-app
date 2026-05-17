import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 768;

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('https://cmsbackend-f4arbkegcchtbxc6.southafricanorth-01.azurewebsites.net/auth/login', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Route to dashboard and pass user details as URL params
      router.replace({
        pathname: '/(dashboard)',
        params: {
          fullName: data.user?.fullName,
          email: data.user?.email,
          role: data.user?.role?.name
        }
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" bounces={false}>
        <View style={[styles.container, isLargeScreen ? styles.row : styles.column]}>
          <View style={[styles.half, styles.leftSide]}>
        <Text style={styles.brandText}>CMS App</Text>
        <Text style={styles.subBrandText}>Welcome back! Please login to continue.</Text>
      </View>
      <View style={[styles.half, styles.rightSide]}>
        <View style={styles.formContainer}>
          <Text style={styles.header}>Login</Text>
          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Pressable style={styles.loginButton} onPress={handleLogin} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginButtonText}>Sign In</Text>}
          </Pressable>
        </View>
      </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  row: { flexDirection: 'row' },
  column: { flexDirection: 'column' },
  half: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  leftSide: { backgroundColor: '#2e78b7' },
  brandText: { fontSize: 48, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  subBrandText: { fontSize: 18, color: '#e0e0e0', textAlign: 'center' },
  rightSide: { backgroundColor: '#fff' },
  formContainer: { width: '100%', maxWidth: 400 },
  header: { fontSize: 32, fontWeight: 'bold', marginBottom: 30, color: '#333' },
  errorText: { color: '#ef4444', marginBottom: 15, fontSize: 14, textAlign: 'center' },
  input: { height: 50, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, paddingHorizontal: 15, marginBottom: 15, fontSize: 16, color: '#333' },
  loginButton: { backgroundColor: '#2e78b7', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 10, opacity: 0.9 },
  loginButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});