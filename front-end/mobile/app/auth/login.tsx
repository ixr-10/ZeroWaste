import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FONTS } from "../../constants/fonts";
import Header2 from '../../components/Header2';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../constants/axios';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
const handleLogin = async () => {
  if (!username || !password) {
    alert('Please fill in all fields.');
    return;
  }
  try {
    const { data } = await api.post('users/login/', {
      username: username,
      password: password,
    });

  const handleLogin = async () => {
    if (!username || !password) {
      alert('Please fill in all fields.');
      return;
    }
    try {
      const { data } = await api.post('/login/', {
        username: username,
        password: password,
      });

      // ✅ Save tokens + user info
      await AsyncStorage.setItem('access', data.access);
      await AsyncStorage.setItem('refresh', data.refresh);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      await AsyncStorage.setItem('isLoggedIn', 'true'); // ✅ added so index.tsx can read it

      router.replace('/(tabs)/slides'); // ✅ go to main app

    } catch (err: any) {
      const status = err.response?.status;
      const msg = err.response?.data?.error || 'Login failed.';

      if (status === 403) {
        alert('Please verify your email first.');
        router.push({
          pathname: '/auth/verify-email' as any,
          params: { username },
        });
      } else {
        alert(msg);
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', marginTop: 0 }}>
      <Header2 showBack={false} />
      <ScrollView contentContainerStyle={styles.container}>
        <Image source={require('../../assets/images/login1.png')} style={styles.image} />
        <Text style={styles.title}>LOGIN</Text>

        <Text style={styles.label}>Username</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={username}
            onChangeText={setUsername}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Ionicons margin={10} left={2} top={5} position={'absolute'} name="mail-outline" size={20} color="black" />
        </View>

        <Text style={styles.label}>Password</Text>
        <View style={styles.inputRow}>
          <Ionicons margin={10} left={2} top={5} position={'absolute'} name="lock-closed-outline" size={20} color="black" />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
            <Text style={styles.eyeText}>
              {showPassword
                ? <Ionicons name="eye" size={24} color="black" />
                : <Ionicons name="eye-off-outline" size={24} color="black" />}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.push('/auth/forgot-password')}>
          <Text style={styles.forgot}>forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <View style={{ height: 1, backgroundColor: 'black', marginVertical: 10, marginHorizontal: 65 }} />

        <Text style={styles.bottomText}>
          Don&apos;t have an account?{' '}
          <Text style={styles.link} onPress={() => router.push('./register')}>Sign up</Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontFamily: FONTS.bold, textAlign: 'center', marginBottom: 32, color: '#1a1a1a' },
  label: { fontSize: 16, fontFamily: FONTS.regular, color: 'black', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#588157',
    opacity: 0.5,
    borderRadius: 20,
    padding: 12,
    paddingLeft: 38,
    marginBottom: 16,
    fontSize: 14,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eyeBtn: { position: 'absolute', right: 12, top: 12 },
  eyeText: { fontSize: 18 },
  forgot: { color: 'black', marginBottom: 24, fontSize: 13, textAlign: 'center', textDecorationLine: 'underline', fontFamily: FONTS.regular },
  button: {
    backgroundColor: '#588157',
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 24,
    alignSelf: 'center',
  },
  buttonText: { color: 'black', fontWeight: '700', fontSize: 16 },
  bottomText: { textAlign: 'center', color: 'black', fontSize: 13 },
  link: { color: '#588157', fontWeight: '600', textDecorationLine: 'underline' },
  image: { width: 285, height: 285 },
});