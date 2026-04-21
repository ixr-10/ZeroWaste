import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../constants/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS = {
  primary: '#588157',
  background: '#E8EBE1',
  sectionBg: '#F5F5F5',
  cardBg: '#F5F7F3',
  white: '#FFFFFF',
  textPrimary: '#1A1A1A',
  textMuted: '#999999',
  border: '#D5DED0',
  borderActive: '#4A6741',
  error: '#D94F4F',
};

export default function ChangeEmailScreen() {
  const router = useRouter();

  const [currentEmail, setCurrentEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Step 1: user enters new email and clicks Send Code
  // Step 2: user enters the OTP they received and clicks Save Changes
  const [codeSent, setCodeSent] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);

  // Load current email from profile on mount
  useEffect(() => {
    const loadEmail = async () => {
      try {
        const { data } = await api.get('/profile/');
        setCurrentEmail(data.email || '');
      } catch {
        // silently fail — current email is just display
      }
    };
    loadEmail();
  }, []);

  // Step 1 — request OTP to new email
  const handleSendCode = async () => {
    setError('');
    if (!newEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (newEmail === currentEmail) {
      setError('New email must be different from your current email.');
      return;
    }
    setSendingCode(true);
    try {
      await api.post('users/change-email/request/', { new_email: newEmail });
      setCodeSent(true);
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to send code. Please try again.';
      setError(msg);
    } finally {
      setSendingCode(false);
    }
  };

  // Step 2 — verify OTP and confirm email change
  const handleSave = async () => {
    setError('');
    if (!confirmCode) {
      setError('Please enter the confirmation code.');
      return;
    }
    setLoading(true);
    try {
      await api.post('users/change-email/confirm/', {
        new_email: newEmail,
        code: confirmCode,
      });
      setSuccess(true);
      const refresh = await AsyncStorage.getItem('refresh');
      if (refresh) await api.post('users/logout/', { refresh });
      await AsyncStorage.multiRemove(['access', 'refresh', 'user', 'isLoggedIn']);
router.replace('/auth/login');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Invalid or expired code. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Change Email</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.outerCard}>
            <View style={styles.formCard}>

              {/* Current email — read only */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Current email</Text>
                <View style={[styles.input, styles.inputReadOnly]}>
                  <Text style={styles.currentEmailText}>
                    {currentEmail || '—'}
                  </Text>
                </View>
              </View>

              {/* New email + Send Code button */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>New email</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={newEmail}
                    onChangeText={(t) => { setNewEmail(t); setCodeSent(false); setError(''); }}
                    placeholder="Enter new email"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!success}
                  />
                </View>

                {/* Send Code button */}
                {!success && (
                  <TouchableOpacity
                    style={[styles.sendCodeBtn, (sendingCode || codeSent) && { opacity: 0.7 }]}
                    onPress={handleSendCode}
                    disabled={sendingCode || codeSent}
                    activeOpacity={0.8}
                  >
                    {sendingCode
                      ? <ActivityIndicator color={COLORS.white} size="small" />
                      : <Text style={styles.sendCodeText}>
                          {codeSent ? '✓ Code sent' : 'Send Code'}
                        </Text>
                    }
                  </TouchableOpacity>
                )}
              </View>

              {/* OTP field — shown after code is sent */}
              {codeSent && !success && (
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Confirmation code</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.textInput}
                      value={confirmCode}
                      onChangeText={setConfirmCode}
                      placeholder="Enter the code from your inbox"
                      placeholderTextColor={COLORS.textMuted}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>
              )}

              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              {success ? (
                <Text style={styles.successText}>✓ Email updated successfully!</Text>
              ) : null}
            </View>
          </View>

          {/* Save button — only shown after code is sent */}
          {codeSent && !success && (
            <TouchableOpacity
              style={[styles.saveBtn, loading && { opacity: 0.7 }]}
              onPress={handleSave}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color={COLORS.white} />
                : <Text style={styles.saveBtnText}>SAVE CHANGES</Text>
              }
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: COLORS.sectionBg,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  content: { padding: 16, paddingBottom: 40 },
  outerCard: { backgroundColor: COLORS.sectionBg, borderRadius: 20, padding: 16, marginBottom: 16 },
  formCard: { backgroundColor: COLORS.cardBg, borderRadius: 16, padding: 16, gap: 16 },
  fieldGroup: { gap: 8 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.borderActive,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: COLORS.cardBg,
  },
  inputReadOnly: { backgroundColor: '#EDEFEB' },
  currentEmailText: { fontSize: 14, color: COLORS.primary },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: COLORS.cardBg,
  },
  inputIcon: { marginRight: 8 },
  textInput: { flex: 1, fontSize: 14, color: COLORS.textPrimary, paddingVertical: 13 },
  sendCodeBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  sendCodeText: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  errorText: { fontSize: 13, color: COLORS.error, marginTop: 4 },
  successText: { fontSize: 13, color: COLORS.primary, fontWeight: '600', marginTop: 4 },
  saveBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  saveBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700', letterSpacing: 1.5 },
});