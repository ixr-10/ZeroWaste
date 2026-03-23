import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, SafeAreaView, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Header from '../../components/Header';
import OtpInput from '../../components/OtpInput';
import ConfirmationImg from '../../assets/images/image.png';
import AppText from '../../components/AppText';

export default function ConfirmationPage() {
  const router = useRouter();
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);

  // Join the array into a single string to check length
  const fullCode = code.join('');

  const handleFinish = async () => {
    if (fullCode.length < 6) {
      Alert.alert("Invalid Code", "Please enter the full 6-digit confirmation code.");
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API Call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to your main app entry point (e.g., /home or /dashboard)
      Alert.alert("Success", "Account verified successfully!");
      // router.replace('/home'); // Use replace so they can't go back to signup
    } catch (error) {
      Alert.alert("Error", "Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    Alert.alert("Code Sent", "A new verification code has been sent to your device.");
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
          
          <TouchableOpacity 
            style={[
              styles.confirmButton, 
              fullCode.length < 6 && { opacity: 0.7 } // Visual feedback if incomplete
            ]} 
            onPress={handleFinish}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <AppText weight="bold" style={styles.confirmButtonText}>
                Finish
              </AppText>
            )}
          </TouchableOpacity>

          {/* Optional: Add a resend link for better UX */}
          <TouchableOpacity onPress={handleResend} style={styles.resendContainer}>
            <AppText style={styles.resendText}>
              Didn't receive a code? <AppText weight="bold" style={styles.resendLink}>Resend</AppText>
            </AppText>
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
  confirmButton: {
    backgroundColor: '#588157',
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    width: '65%',
    alignSelf: 'center',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 4,
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 18,
  },
  resendContainer: {
    marginTop: 25,
    alignItems: 'center',
  },
  resendText: {
    color: '#588157',
    fontSize: 14,
  },
  resendLink: {
    color: '#588157',
  }
});