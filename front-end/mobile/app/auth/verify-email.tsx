import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../constants/axios';
import Header2 from '../../components/Header2';

export default function VerifyEmailScreen() {
  const { username: paramUsername } = useLocalSearchParams();
  const username = Array.isArray(paramUsername) ? paramUsername[0] : paramUsername || '';
  const [code, setCode] = useState('');

  const handleVerify = async () => {
    if (!code) {
      Alert.alert('Error', 'Please enter the OTP code.');
      return;
    }
    try {
      await api.post('/users/verify-email/', { username, code });
      Alert.alert('Success', 'Email verified! You can now login.');
      router.replace('/auth/login');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Invalid or expired code.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header2 showBack={true} />
      <View style={styles.container}>
        <Text style={styles.title}>VERIFY EMAIL</Text>
        <Text style={styles.subtitle}>
          Enter the code sent to the email linked to{'\n'}
          <Text style={{ color: '#588157' }}>{username}</Text>
        </Text>

        <Text style={styles.label}>OTP Code</Text>
        <View style={styles.inputRow}>
          <Ionicons margin={10} left={2} top={5} position={'absolute'} name="key-outline" size={20} color="black" />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={code}
            onChangeText={setCode}
            keyboardType="numeric"
            maxLength={6}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleVerify}>
          <Text style={styles.buttonText}>Verify</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/auth/login')} style={{ marginTop: 15, alignItems: 'center' }}>
          <Text style={{ color: '#588157', textDecorationLine: 'underline' }}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  title:      { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 12, color: '#1a1a1a' },
  subtitle:   { textAlign: 'center', color: '#666', marginBottom: 32, lineHeight: 22 },
  label:      { fontSize: 16, color: 'black', marginBottom: 6 },
  input:      { borderWidth: 1, borderColor: '#588157', opacity: 0.7, borderRadius: 20, padding: 12, paddingLeft: 38, marginBottom: 16, fontSize: 14 },
  inputRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  button:     { backgroundColor: '#588157', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, alignItems: 'center', marginBottom: 24, alignSelf: 'center', width: 120 },
  buttonText: { color: 'black', fontWeight: '700', fontSize: 16 },
});