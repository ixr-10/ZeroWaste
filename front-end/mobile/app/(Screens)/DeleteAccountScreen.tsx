import React, { useState } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../constants/axios';

const COLORS = {
  primary: '#4A6741',
  background: '#E8EBE1',
  sectionBg: '#E8EBE1',
  cardBg: '#F5F5F5',
  white: '#FFFFFF',
  textPrimary: '#1A1A1A',
  textMuted: '#999999',
  border: '#D5DED0',
  red: '#D94F4F',
  error: '#D94F4F',
};

export default function DeleteAccountScreen() {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isConfirmed = confirmText === 'DELETE';

  const handleDelete = async () => {
    if (!isConfirmed) return;
    setError('');
    setLoading(true);
    try {
      // ✅ Call backend to permanently delete account
      await api.delete('/users/delete-account/');

      // ✅ Wipe all local storage and go to login
      await AsyncStorage.clear();
      router.replace('/auth/login');
    } catch (err: any) {
  if (err.response) {
    const msg = err.response.data?.error || 'Failed to delete account.';
    setError(msg);
  } else {
    setError('Network error. Please try again.');
  }
}
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Delete Account</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.outerCard}>
            {/* Warning card */}
            <View style={styles.warningCard}>
              <Ionicons name="trash" size={52} color={COLORS.red} style={{ marginBottom: 12 }} />
              <Text style={styles.warningTitle}>Delete Account?</Text>
              <Text style={styles.warningDesc}>
                This will permanently delete your profile, all your posts, and all your data. This action{' '}
                <Text style={styles.warningBold}>cannot be undone</Text>.
              </Text>
            </View>

            {/* Confirm input card */}
            <View style={styles.confirmCard}>
              <Text style={styles.confirmLabel}>Type DELETE to confirm</Text>
              <TextInput
                style={[styles.confirmInput, isConfirmed && styles.confirmInputActive]}
                value={confirmText}
                onChangeText={setConfirmText}
                placeholder="Type DELETE"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="characters"
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          {/* Delete button */}
          <TouchableOpacity
            style={[
              styles.deleteBtn,
              isConfirmed && styles.deleteBtnActive,
              loading && { opacity: 0.7 },
            ]}
            onPress={handleDelete}
            activeOpacity={isConfirmed ? 0.85 : 1}
            disabled={!isConfirmed || loading}
          >
            {loading
              ? <ActivityIndicator color={COLORS.white} />
              : <Text style={[styles.deleteBtnText, isConfirmed && styles.deleteBtnTextActive]}>
                  DELETE
                </Text>
            }
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
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
  content: { padding: 16, paddingBottom: 40, gap: 12 },
  outerCard: { backgroundColor: COLORS.sectionBg, borderRadius: 20, padding: 16, gap: 12 },
  warningCard: { backgroundColor: COLORS.cardBg, borderRadius: 16, padding: 20, alignItems: 'center' },
  warningTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 10 },
  warningDesc: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 21 },
  warningBold: { fontWeight: '700', color: COLORS.textPrimary },
  confirmCard: { backgroundColor: COLORS.cardBg, borderRadius: 16, padding: 16 },
  confirmLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 12 },
  confirmInput: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.cardBg,
  },
  confirmInputActive: { borderColor: COLORS.red },
  errorText: { fontSize: 13, color: COLORS.error, textAlign: 'center' },
  deleteBtn: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  deleteBtnActive: { backgroundColor: COLORS.red, borderColor: COLORS.red },
  deleteBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 1.5 },
  deleteBtnTextActive: { color: COLORS.white },
  cancelBtn: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelBtnText: { color: COLORS.textMuted, fontSize: 15, fontWeight: '600' },
});