import React, { useState } from 'react';
import { 
  StyleSheet, View, TouchableOpacity, SafeAreaView, 
  Image, Alert, ActivityIndicator, ScrollView 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Header from '../../components/Header';
import AppText from '../../components/AppText';
import InputField from '../../components/InputField';

// Type for navigation params
const { email, code } = useLocalSearchParams<{ email?: string; code?: string }>();


export default function FinalConfirmation() {
  const router = useRouter();
  

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  // Error state for on-screen feedback
  const [errors, setErrors] = useState({ password: '', confirmPassword: '' });

  const handleFinish = async () => {
    // 1. Reset Errors
    setErrors({ password: '', confirmPassword: '' });

    // 2. Local Validation
    let hasError = false;
    if (password.length < 6) {
      setErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters.' }));
      hasError = true;
    }
    if (password !== confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match.' }));
      hasError = true;
    }

    if (hasError) return;

    try {
      setLoading(true);

      // --- BACKEND LINK ---
      const response = await fetch('https://your-api.com/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update password');
      }

      setLoading(false);
      
      // Success Alert then Navigate
      Alert.alert("Success", "Password updated!", [
        { text: "Continue", onPress: () => router.push('./set-password') }
      ]);
      
    } catch (error: any) {
      setLoading(false);
      Alert.alert("Error", error.message || "Something went wrong.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header onBack={() => router.back()} />
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.illustrationSection}>
          <Image 
            source={require('../../assets/images/image.png')}  
            style={styles.image} resizeMode="contain" 
          />
        </View>

        <AppText weight="bold" style={styles.titleText}>CONFIRMATION</AppText>

        <View style={styles.formContainer}>
          <InputField 
            label="New Password"
            placeholder="••••••••"
            value={password}
            onChangeText={(text) => {
                setPassword(text);
                if(errors.password) setErrors({...errors, password: ''});
            }}
            secureTextEntry
            showToggle
            isPasswordVisible={showPwd}
            onToggle={() => setShowPwd(!showPwd)}
            error={errors.password} // Passing the error to InputField
          />

          <InputField 
            label="Confirm Password"
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={(text) => {
                setConfirmPassword(text);
                if(errors.confirmPassword) setErrors({...errors, confirmPassword: ''});
            }}
            secureTextEntry
            showToggle
            isPasswordVisible={showConfirmPwd}
            onToggle={() => setShowConfirmPwd(!showConfirmPwd)}
            error={errors.confirmPassword} // Passing the error to InputField
          />
          
          <TouchableOpacity 
            style={[styles.finishButton, loading && { opacity: 0.7 }]} 
            onPress={handleFinish}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <AppText weight="bold"
               onPress={() => router.push('./set-password')}
               style={styles.finishButtonText}>Finish</AppText>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { paddingHorizontal: 25, paddingBottom: 40 },
  illustrationSection: { height: 250, marginVertical: 10, alignItems: 'center' },
  image: { width: '100%', height: '100%' },
  titleText: { fontSize: 26, textAlign: 'center', marginVertical: 20, color: '#000' },
  formContainer: { marginTop: 10 },
  finishButton: {
    backgroundColor: '#588157',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    width: '60%',
    alignSelf: 'center',
    elevation: 3,
  },
  finishButtonText: { color: '#FFF', fontSize: 18 },
});