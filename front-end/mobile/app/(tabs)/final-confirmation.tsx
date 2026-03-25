import React, { useState } from 'react';
import { 
  StyleSheet, View, TouchableOpacity, SafeAreaView, 
  Image, Alert, ActivityIndicator, ScrollView 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Header from '../../components/Header';
import AppText from '../../components/AppText';
import InputField from '../../components/InputField';

export default function FinalConfirmation() {
  const router = useRouter();
  
  // 1. Move hooks INSIDE the component
  const { email, code } = useLocalSearchParams<{ email?: string; code?: string }>();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({ password: '', confirmPassword: '' });

  const handleFinish = async () => {
    setErrors({ password: '', confirmPassword: '' });

    // Validation logic
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

      /* --- BACKEND LINK SECTION ---
         Replace the setTimeout block below with your real fetch when the API is live.
         Example for local testing: 'http://YOUR_IP_ADDRESS:3000/reset-password'
      */
      
      // SIMULATION: This mimics a network request
      await new Promise((resolve) => setTimeout(resolve, 2000)); 

      /* // REAL FETCH (Uncomment this when ready):
      const response = await fetch('https://your-api.com/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed');
      */

      setLoading(false);
      
      Alert.alert("Success", "Password updated!", [
        { 
          text: "Continue", 
          // Use replace so they can't go back to the password screen
          onPress: () => router.replace('/ProfileSetupScreen') 
        }
      ]);
      
    } catch (error: any) {
      setLoading(false);
      Alert.alert("Error", error.message || "Network request failed. Please check your connection.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header showBack />
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.illustrationSection}>
          <Image 
            source={require('../../assets/images/image.png')}  
            style={styles.image} 
            resizeMode="contain" 
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
            secureTextEntry={!showPwd}
            showToggle
            isPasswordVisible={showPwd}
            onToggle={() => setShowPwd(!showPwd)}
            error={errors.password}
          />

          <InputField 
            label="Confirm Password"
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={(text) => {
                setConfirmPassword(text);
                if(errors.confirmPassword) setErrors({...errors, confirmPassword: ''});
            }}
            secureTextEntry={!showConfirmPwd}
            showToggle
            isPasswordVisible={showConfirmPwd}
            onToggle={() => setShowConfirmPwd(!showConfirmPwd)}
            error={errors.confirmPassword}
          />
          
          <TouchableOpacity 
            style={[styles.finishButton, loading && { opacity: 0.7 }]} 
            onPress={handleFinish} // Only one onPress here!
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <AppText weight="bold" style={styles.finishButtonText}>
                Finish
              </AppText>
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
  illustrationSection: { height: 220, marginVertical: 10, alignItems: 'center' },
  image: { width: '100%', height: '100%' },
  titleText: { fontSize: 26, textAlign: 'center', marginVertical: 20, color: '#000', letterSpacing: 1 },
  formContainer: { marginTop: 10 },
  finishButton: {
    backgroundColor: '#588157',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    width: '65%',
    alignSelf: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  finishButtonText: { color: '#FFF', fontSize: 18 },
});