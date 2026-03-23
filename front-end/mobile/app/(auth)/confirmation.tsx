import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, SafeAreaView, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Header from '../../components/Header';
import OtpInput from '../../components/OtpInput';
import ConfirmationImg from '../../assets/images/image.png';
import AppText from '../../components/AppText';

export default function ConfirmationPage() {
  const router = useRouter();
  
  // 1. State Management
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);

  // 2. Handle Confirmation Logic
  const handleConfirm = async () => {
    const fullCode = code.join(''); // Convert array ['1','2'...] to string "123..."
    
    // Validation
    if (fullCode.length < 6) {
      Alert.alert("Invalid Code", "Please enter the full 6-digit verification code.");
      return;
    }

    try {
      setLoading(true);
      
      // TODO: Replace with  actual API call
      // const response = await api.post('/verify-otp', { otp: fullCode });
      
      console.log("Verifying Code:", fullCode);
      
      // Simulate Backend delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setLoading(false);
      // Navigate to the set password screen or next step
      router.push('/final-confirmation'); 
      
    } catch (error) {
      setLoading(false);
      Alert.alert("Verification Failed", "The code you entered is incorrect or expired.");
    }
  };

  // 3. Handle Resend Logic
  const handleResendCode = async () => {
    try {
      setIsResending(true);
      // TODO: Add resend API call here
      console.log("Resending OTP...");
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      Alert.alert("Code Sent", "A new verification code has been sent to your device.");
    } catch (error) {
      Alert.alert("Error", "Could not resend code. Try again later.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header onBack={() => router.back()} /> 
      
      <View style={styles.content}>
        <View style={styles.illustrationSection}>
          <Image 
            source={ConfirmationImg} 
            style={styles.image} 
            resizeMode="contain" 
          />
        </View>

        <AppText weight="bold" style={styles.titleText}>
          CONFIRMATION
        </AppText>

        <View style={styles.formContainer}>
          <AppText weight="semibold" style={styles.inputLabel}>
            Code
          </AppText>
          
          <OtpInput code={code} setCode={setCode} />

          {/* Resend Code Link */}
          <TouchableOpacity 
            onPress={handleResendCode} 
            disabled={isResending}
            style={styles.resendContainer}
          >
            <AppText style={styles.resendText}>
              {isResending ? "Sending..." : "Didn't receive a code? Resend"}
            </AppText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.confirmButton, loading && { opacity: 0.7 }]} 
            onPress={handleConfirm}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <AppText weight="bold" style={styles.confirmButtonText}>
                Confirm
              </AppText>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 25,
  },
  illustrationSection: {
    height: '35%',
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  titleText: {
    fontSize: 26,
    textAlign: 'center',
    letterSpacing: 2,
    marginVertical: 20,
    color: '#1A1A1A',
  },
  formContainer: {
    marginTop: 10,
  },
  inputLabel: {
    fontSize: 18,
    color: '#333',
    marginLeft: 5,
    marginBottom: 10,
  },
  resendContainer: {
    marginTop: 15,
    alignSelf: 'center',
  },
  resendText: {
    color: '#588157',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  confirmButton: {
    backgroundColor: '#588157',
    height: 55,
    borderRadius: 30,
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
  confirmButtonText: {
    color: '#FFF',
    fontSize: 18,
  },
});