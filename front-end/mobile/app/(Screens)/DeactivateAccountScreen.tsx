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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  primary: '#588157',
  background: '#E8EBE1',
  sectionBg: '#DDE6D8',
  cardBg: '#F5F5F5',
  white: '#FFFFFF',
  textPrimary: '#1A1A1A',
  textMuted: '#999999',
  border: '#D5DED0',
  orange: '#F5A623',
};

export default function DeactivateAccountScreen() {
  const router = useRouter();
  const [reason, setReason] = useState('');

  const handleDeactivate = async () => {
    await AsyncStorage.removeItem('isLoggedIn');
    router.replace('/auth/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Deactivate Account</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.outerCard}>
            {/* Info card */}
            <View style={styles.infoCard}>
              <View style={styles.iconCircle}>
                <Ionicons name="pause-circle" size={52} color={COLORS.orange} />
              </View>
              <Text style={styles.infoTitle}>Deactivate Account?</Text>
              <Text style={styles.infoDesc}>
                Your profile and posts will be hidden from other users. You can reactivate anytime by logging back in.
              </Text>
            </View>

            {/* Reason card */}
            <View style={styles.reasonCard}>
              <Text style={styles.reasonLabel}>Reason(optional)</Text>
              <TextInput
                style={styles.reasonInput}
                value={reason}
                onChangeText={setReason}
                multiline
                textAlignVertical="top"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
          </View>

          {/* Buttons */}
          <TouchableOpacity style={styles.deactivateBtn} onPress={handleDeactivate} activeOpacity={0.85}>
            <Text style={styles.deactivateBtnText}>Deactivate</Text>
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

  infoCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  iconCircle: { marginBottom: 12 },
  infoTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 10 },
  infoDesc: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 21,
  },

  reasonCard: { backgroundColor: COLORS.cardBg, borderRadius: 16, padding: 16 },
  reasonLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 10 },
  reasonInput: {
    height: 160,
    fontSize: 14,
    color: COLORS.textPrimary,
  },

  deactivateBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  deactivateBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },

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
