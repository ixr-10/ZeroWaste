import React, { useState } from 'react';
import { StyleSheet, View, Image, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router'; // ← added useLocalSearchParams
import Header from '../../components/Header';
import InputField from '../../components/InputField';
import AppText from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../constants/axios'; // ← added

export default function SetPasswordScreen() {
  const router = useRouter();
  const { username: paramUsername } = useLocalSearchParams<{ username: string }>(); // ← receive from register

  const [formData, setFormData] = useState({
    username: paramUsername ?? '', // ← pre-fill from register
    code: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const handleInputChange = (name: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // replace handleFinish in set-password.tsx
const handleFinish = async () => {
  const { username, code, password, confirmPassword } = formData;

  if (!username || !code || !password || !confirmPassword) {
    Alert.alert('Error', 'Please fill in all fields.');
    return;
  }
  if (password.length < 8) {
    Alert.alert('Error', 'Password must be at least 8 characters.');
    return;
  }
  if (password !== confirmPassword) {
    Alert.alert('Error', 'Passwords do not match.');
    return;
  }

  try {
    setLoading(true);
    await api.post('/set-password/', {
      username,
      code,
      new_password: password,        // ← backend expects this
      confirm_password: confirmPassword, // ← backend expects this
    });

    Alert.alert('Success', 'Password set! You can now login.', [
      { text: 'Login', onPress: () => router.replace('/auth/login') },
    ]);
  } catch (error: any) {
    Alert.alert('Error', error.response?.data?.error || 'Something went wrong.');
  } finally {
    setLoading(false);
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <Header onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image
            source={require('../../assets/images/setpassword.png')}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        <AppText weight="bold" style={styles.title}>SET PASSWORD</AppText>

        <View style={styles.form}>
          <InputField
            label="Username"
            value={formData.username}
            onChangeText={(text: string) => handleInputChange('username', text)}
          />
          <InputField
            label="Code"
            value={formData.code}
            keyboardType="number-pad"
            onChangeText={(text: string) => handleInputChange('code', text)}
          />
          <InputField
            label="Password"
            secureTextEntry={!showPwd}
            showToggle
            isPasswordVisible={showPwd}
            onToggle={() => setShowPwd(!showPwd)}
            value={formData.password}
            onChangeText={(text: string) => handleInputChange('password', text)}
          />
          <InputField
            label="Confirm Password"
            secureTextEntry={!showConfirmPwd}
            showToggle
            isPasswordVisible={showConfirmPwd}
            onToggle={() => setShowConfirmPwd(!showConfirmPwd)}
            value={formData.confirmPassword}
            onChangeText={(text: string) => handleInputChange('confirmPassword', text)}
          />

          <TouchableOpacity
            style={[styles.finishButton, loading && { opacity: 0.7 }]}
            onPress={handleFinish}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <AppText weight="bold" style={styles.finishButtonText}>Finish</AppText>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingHorizontal: 25, paddingBottom: 40, alignItems: 'center' },
  imageContainer: { height: 260, width: '100%', marginTop: 10 },
  illustration: { width: '100%', height: '100%' },
  title: { fontSize: 26, letterSpacing: 2, marginVertical: 25, color: '#000', textAlign: 'center' },
  form: { width: '100%' },
  finishButton: {
    backgroundColor: '#588157', height: 52, width: '40%',
    borderRadius: 26, justifyContent: 'center', alignItems: 'center',
    alignSelf: 'center', marginTop: 20,
  },
  finishButtonText: { color: '#FFF', fontSize: 17 },
});