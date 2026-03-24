import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, SafeAreaView, Image, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

import Header from '../../components/Header';
import OtpInput from '../../components/OtpInput';
import AppText from '../../components/AppText';

export default function ConfirmationPage() {
  const router = useRouter();
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);

  const fullCode = code.join('');

  const handleFinish = async () => {
    if (fullCode.length < 6) {
      Alert.alert('Invalid Code', 'Please enter the full 6-digit confirmation code.');
      return;
    }

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      Alert.alert('Success', 'Account verified successfully!');
    } catch (error) {
      Alert.alert('Error', 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    Alert.alert('Code Sent', 'A new verification code has been sent to your device.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header showBack onBack={() => router.replace('/auth/ProfileSetupScreen')} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image
            source={require('../../assets/images/image.png')}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        <AppText weight="bold" style={styles.title}>CONFIRMATION</AppText>

        <View style={styles.form}>
          <AppText weight="semibold" style={styles.inputLabel}>
            Code
          </AppText>

          <OtpInput code={code} setCode={setCode} />

          <TouchableOpacity
            style={[styles.finishButton, (fullCode.length < 6 || isLoading) && { opacity: 0.7 }]}
            onPress={handleFinish}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <AppText weight="bold" style={styles.finishButtonText}>
                Finish
              </AppText>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleResend} style={styles.resendContainer}>
            <AppText style={styles.resendText}>
              Didn't receive a code? <AppText weight="bold" style={styles.resendLink}>Resend</AppText>
            </AppText>
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
  title: {
    fontSize: 26,
    letterSpacing: 2,
    marginVertical: 25,
    color: '#000',
    textAlign: 'center',
  },
  form: { width: '100%' },
  inputLabel: {
    fontSize: 18,
    color: '#333',
    marginLeft: 5,
    marginBottom: 10,
  },
  finishButton: {
    backgroundColor: '#588157',
    height: 52,
    width: '40%',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20,
  },
  finishButtonText: { color: '#FFF', fontSize: 17 },
  resendContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  resendText: {
    color: '#588157',
    fontSize: 14,
  },
  resendLink: {
    color: '#588157',
  },
});
