import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import OtpInput from '../../components/OtpInput';
import ConfirmationImg from '../../assets/images/image.png';
import AppText from '../../components/AppText';
import api from '../../constants/axios'; // ← uses your existing axios instance

export default function ConfirmationPage() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();

  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const fullCode = code.join('');

  const handleFinish = async () => {
    if (fullCode.length < 6) {
      Alert.alert('Invalid Code', 'Please enter the full 6-digit confirmation code.');
      return;
    }
    if (!email) {
      Alert.alert('Error', 'Email address is missing. Please go back and try again.');
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await api.post('/verify-email/', { email, code: fullCode });
      Alert.alert('Success', data.message ?? 'Email verified successfully!', [
        { text: 'Login', onPress: () => router.replace('/auth/login') },
      ]);
    } catch (error: any) {
      const message = error.response?.data?.error ?? 'Verification failed. Please try again.';
      Alert.alert('Verification Failed', message);
      setCode(['', '', '', '', '', '']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      Alert.alert('Error', 'Email address is missing. Please go back and try again.');
      return;
    }

    setIsResending(true);
    try {
      await api.post('/forgot-password/', { email });
      Alert.alert('Code Sent', `A new verification code has been sent to ${email}.`);
      setCode(['', '', '', '', '', '']);
    } catch (error: any) {
      Alert.alert('Error', 'Could not resend code. Please try again.');
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

        <AppText weight="bold" style={styles.titleText}>
          CONFIRMATION
        </AppText>

        {email ? (
          <AppText style={styles.subtitleText}>
            Enter the 6-digit code sent to{'\n'}
            <AppText weight="semibold" style={styles.emailText}>
              {email}
            </AppText>
          </AppText>
        ) : null}

        <View style={styles.formContainer}>
          <AppText weight="semibold" style={styles.inputLabel}>
            Code
          </AppText>

          <OtpInput code={code} setCode={setCode} />

          <TouchableOpacity
            style={[styles.confirmButton, (fullCode.length < 6 || isLoading) && styles.confirmButtonDisabled]}
            onPress={handleFinish}
            activeOpacity={0.8}
            disabled={isLoading || fullCode.length < 6}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <AppText weight="bold" style={styles.confirmButtonText}>
                Finish
              </AppText>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleResend}
            style={styles.resendContainer}
            disabled={isResending}
          >
            {isResending ? (
              <ActivityIndicator color="#588157" size="small" />
            ) : (
              <AppText style={styles.resendText}>
                Didn&apos;t receive a code?{' '}
                <AppText weight="bold" style={styles.resendLink}>
                  Resend
                </AppText>
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
  subtitleText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    lineHeight: 22,
    marginBottom: 10,
  },
  emailText: {
    color: '#588157',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 18,
  },
  resendContainer: {
    marginTop: 25,
    alignItems: 'center',
    minHeight: 24,
    justifyContent: 'center',
  },
  resendText: {
    color: '#588157',
    fontSize: 14,
  },
  resendLink: {
    color: '#588157',
  },
});
