import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from '../../components/Header';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header showBack />
      <ScrollView contentContainerStyle={styles.container}>
        <Image source={require('../../assets/images/resetpassword.png')} style={styles.image} />
        <Text style={styles.title}>RESET PASSWORD</Text>

        <Text style={styles.label}>Email</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="Enter your email"
          />
          <Ionicons name="mail-outline" size={20} color="black" style={styles.inputIcon} />
        </View>

        <TouchableOpacity style={styles.button} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flexGrow: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 32, color: '#1a1a1a' },
  label: { fontSize: 16, color: 'black', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#588157',
    opacity: 0.5,
    borderRadius: 20,
    padding: 12,
    paddingLeft: 42,
    marginBottom: 16,
    fontSize: 14,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    top: 14,
  },
  button: {
    backgroundColor: '#588157',
    paddingHorizontal: 20,
    width: 81,
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 24,
    alignSelf: 'center',
  },
  buttonText: { color: 'black', fontWeight: '700', fontSize: 16 },
  image: { width: 285, height: 285, alignSelf: 'center' },
});
