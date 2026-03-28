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
  sectionBg: '#DDE6D8',
  cardBg: '#F5F7F3',
  white: '#FFFFFF',
  textPrimary: '#1A1A1A',
  textMuted: '#999999',
  border: '#D5DED0',
  error: '#D94F4F',
};

interface PasswordFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
}

const PasswordField: React.FC<PasswordFieldProps> = ({ label, placeholder, value, onChangeText }) => {
  const [show, setShow] = useState(false);
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry={!show}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => setShow(!show)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name={show ? 'eye-outline' : 'eye-off-outline'} size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSave = () => {
    setError('');
    setSuccess(false);
    if (!current) { setError('Please enter your current password.'); return; }
    if (newPass.length < 8) { setError('New password must be at least 8 characters.'); return; }
    if (newPass !== confirm) { setError('Passwords do not match.'); return; }
    setSuccess(true);
    setCurrent(''); setNewPass(''); setConfirm('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Change Password</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.outerCard}>
            <View style={styles.formCard}>
              <PasswordField
                label="Current Password"
                placeholder="enter your current password"
                value={current}
                onChangeText={setCurrent}
              />
              <PasswordField
                label="New Password"
                placeholder="At least 8 characters"
                value={newPass}
                onChangeText={setNewPass}
              />
              <PasswordField
                label="Confirm New Password"
                placeholder="Repeat new password"
                value={confirm}
                onChangeText={setConfirm}
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              {success ? <Text style={styles.successText}>✓ Password changed successfully!</Text> : null}
            </View>
          </View>

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
  errorText: { fontSize: 13, color: COLORS.error },
  successText: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  saveBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  saveBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700', letterSpacing: 1.5 },
});