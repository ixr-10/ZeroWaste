import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router'; // ← added useLocalSearchParams
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import OtpInput from '../../components/OtpInput';
import ConfirmationImg from '../../assets/images/image.png';
import AppText from '../../components/AppText';
import api from '../../constants/axios';

export default function ConfirmationPage() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>(); // ← get email from params

  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const fullCode = code.join('');

  // in confirmation.tsx, replace handleConfirm:
const handleConfirm = async () => {
  if (fullCode.length < 6) {
    Alert.alert('Invalid Code', 'Please enter the full 6-digit code.');
    return;
  }
  // Don't verify separately — just pass email+code to final-confirmation
  router.push({ 
    pathname: '/auth/final-confirmation', 
    params: { email, code: fullCode } 
  });
};

  const handleResendCode = async () => {
    if (!email) return;
    try {
      setIsResending(true);
      await api.post('/forgot-password/', { email });
      Alert.alert('Code Sent', `A new code has been sent to ${email}.`);
      setCode(['', '', '', '', '', '']);
    } catch (error) {
      Alert.alert('Error', 'Could not resend code. Try again later.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header onBack={() => router.back()} />

      <View style={styles.content}>
        <View style={styles.illustrationSection}>
          <Image source={ConfirmationImg} style={styles.image} resizeMode="contain" />
        </View>

        <AppText weight="bold" style={styles.titleText}>CONFIRMATION</AppText>

        {email ? (
          <AppText style={styles.subtitleText}>
            Enter the 6-digit code sent to {email}
          </AppText>
        ) : null}

        <View style={styles.formContainer}>
          <AppText weight="semibold" style={styles.inputLabel}>Code</AppText>
          <OtpInput code={code} setCode={setCode} />

          <TouchableOpacity
            onPress={handleResendCode}
            disabled={isResending}
            style={styles.resendContainer}
          >
            <AppText style={styles.resendText}>
              {isResending ? 'Sending...' : "Didn't receive a code? Resend"}
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.confirmButton, (loading || fullCode.length < 6) && { opacity: 0.6 }]}
            onPress={handleConfirm}
            activeOpacity={0.8}
            disabled={loading || fullCode.length < 6}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <AppText weight="bold" style={styles.confirmButtonText}>Confirm</AppText>
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
  illustrationSection: { height: '35%', marginVertical: 10, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: '100%' },
  titleText: { fontSize: 26, textAlign: 'center', letterSpacing: 2, marginVertical: 20, color: '#1A1A1A' },
  subtitleText: { fontSize: 14, textAlign: 'center', color: '#666', marginBottom: 10 },
  formContainer: { marginTop: 10 },
  inputLabel: { fontSize: 18, color: '#333', marginLeft: 5, marginBottom: 10 },
  resendContainer: { marginTop: 15, alignSelf: 'center' },
  resendText: { color: '#588157', fontSize: 14, textDecorationLine: 'underline' },
  confirmButton: {
    backgroundColor: '#588157', height: 55, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center',
    marginTop: 30, width: '65%', alignSelf: 'center',
    elevation: 4, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4,
  },
  confirmButtonText: { color: '#FFF', fontSize: 18 },
});
