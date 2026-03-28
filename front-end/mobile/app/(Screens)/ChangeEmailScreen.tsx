import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

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
  const [newEmail, setNewEmail] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const currentEmail = 'name.name@gmail.com';

  const handleSave = () => {
    setError('');
    if (!newEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (newEmail === currentEmail) {
      setError('New email must be different from current email.');
      return;
    }
    if (!confirmCode) {
      setError('Please enter the confirmation code.');
      return;
    }
    setSuccess(true);
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
              {/* Current email */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Current email</Text>
                <View style={[styles.input, styles.inputReadOnly]}>
                  <Text style={styles.currentEmailText}>{currentEmail}</Text>
                </View>
              </View>

              {/* New email */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>New email</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={newEmail}
                    onChangeText={setNewEmail}
                    placeholder=""
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Confirm code */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Confirm your email</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    value={confirmCode}
                    onChangeText={setConfirmCode}
                    placeholder="enter the code you recieved in your inbox"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>
              </View>

              {/* Error */}
              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              {/* Success */}
              {success ? (
                <Text style={styles.successText}>✓ Email updated successfully!</Text>
              ) : null}
            </View>
          </View>

          {/* Save button */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
            <Text style={styles.saveBtnText}>SAVE CHANGES</Text>
          </TouchableOpacity>
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
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.sectionBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  content: { padding: 16, paddingBottom: 40 },
  outerCard: {
    backgroundColor: COLORS.sectionBg,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  formCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
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
  textInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    paddingVertical: 13,
  },
  errorText: { fontSize: 13, color: COLORS.error, marginTop: 4 },
  successText: { fontSize: 13, color: COLORS.primary, fontWeight: '600', marginTop: 4 },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700', letterSpacing: 1.5 },
});