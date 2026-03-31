import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header2 from '../../components/Header2';
import OtpInput from '../../components/OtpInput';
import ConfirmationImg from '../../assets/images/image.png';
import AppText from '../../components/AppText';
import api from '../../constants/axios';

export default function ConfirmationEmail() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();

  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);

  useEffect(() => {
    console.log('✅ Confirmation page loaded with email:', email);
  }, [email]);

  // ====================== VERIFY CODE ======================
  const handleConfirm = async () => {
    const fullCode = code.join('').trim();

    if (fullCode.length !== 6) {
      Alert.alert("Invalid Code", "Please enter the full 6-digit verification code.");
      return;
    }

    if (!email) {
      Alert.alert("Error", "Email is missing.");
      return;
    }

    try {
      setLoading(true);

      await api.post('/verify-email/', {
        email: email.trim(),
        code: fullCode,
      });

      // ✅ Go to OnboardingScreen after successful verification
      Alert.alert(
        " Email Verified Successfully!",
        "Welcome to Zero Waste!\nLet's show you how the app works.",
        [
          {
            text: "Continue",
            onPress: () => router.replace('../(Screens)/OnboardingScreen'),
          },
        ]
      );

    } catch (error: any) {
      setLoading(false);
      const errorMsg = error.response?.data?.error || "Invalid or expired code.";
      Alert.alert("Verification Failed", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ====================== RESEND CODE ======================
  const handleResend = async () => {
    if (!email) {
      Alert.alert("Error", "Email is missing.");
      return;
    }

    try {
      setIsResending(true);
      await api.post('/resend-otp/', { email: email.trim() });
      Alert.alert("Code Sent", "A new verification code has been sent to your email.");
    } catch (error: any) {
      console.log("Resend error:", error.response?.data);
      Alert.alert(
        "Resend Code",
        "New code requested.\n\nPlease check your spam folder if you don't receive it soon."
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header2 showBack={true} />

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

        {email && (
          <AppText style={styles.emailText}>
            We sent a 6-digit code to:{'\n'}
            <AppText weight="semibold" style={styles.emailHighlight}>{email}</AppText>
          </AppText>
        )}

        <View style={styles.formContainer}>
          <AppText weight="semibold" style={styles.inputLabel}>
            Enter Verification Code
          </AppText>

          <OtpInput code={code} setCode={setCode} />

          <TouchableOpacity 
            onPress={handleResend} 
            disabled={isResending}
            style={styles.resendContainer}
          >
            <AppText style={styles.resendText}>
              {isResending ? "Sending new code..." : "Didn't receive a code? Resend"}
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.confirmButton, loading && { opacity: 0.7 }]}
            onPress={handleConfirm}
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
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, paddingHorizontal: 25 },
  illustrationSection: { 
    height: '35%', 
    marginVertical: 10, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  image: { width: '100%', height: '100%' },
  titleText: { 
    fontSize: 26, 
    textAlign: 'center', 
    letterSpacing: 2, 
    marginVertical: 20, 
    color: '#1A1A1A' 
  },
  emailText: { 
    textAlign: 'center', 
    color: '#666', 
    marginBottom: 25, 
    fontSize: 15, 
    lineHeight: 22 
  },
  emailHighlight: { 
    color: '#1A1A1A', 
    fontWeight: '600' 
  },
  formContainer: { marginTop: 10 },
  inputLabel: { 
    fontSize: 18, 
    color: '#333', 
    marginLeft: 5, 
    marginBottom: 10 
  },
  resendContainer: { marginTop: 20, alignSelf: 'center' },
  resendText: { 
    color: '#588157', 
    fontSize: 14, 
    textDecorationLine: 'underline' 
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
  },
  confirmButtonText: { 
    color: '#FFF', 
    fontSize: 18 
  },
});