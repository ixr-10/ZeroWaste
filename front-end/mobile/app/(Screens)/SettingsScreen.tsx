import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const COLORS = {
  primary: '#4A6741',
  background: '#E8EDE5',
  sectionBg: '#DDE6D8',
  cardBg: '#F5F7F3',
  white: '#FFFFFF',
  textPrimary: '#1A1A1A',
  textSecondary: '#555555',
  textMuted: '#999999',
  border: '#D5DED0',
  red: '#D94F4F',
  orange: '#E07B39',
};

interface SettingRowProps {
  icon: string;
  iconColor?: string;
  label: string;
  subtitle: string;
  labelColor?: string;
  onPress: () => void;
  isLast?: boolean;
}

const SettingRow: React.FC<SettingRowProps> = ({
  icon,
  iconColor = COLORS.textPrimary,
  label,
  subtitle,
  labelColor = COLORS.textPrimary,
  onPress,
  isLast = false,
}) => (
  <TouchableOpacity
    style={[styles.row, !isLast && styles.rowBorder]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Ionicons name={icon as any} size={22} color={iconColor} style={styles.rowIcon} />
    <View style={styles.rowText}>
      <Text style={[styles.rowLabel, { color: labelColor }]}>{label}</Text>
      <Text style={styles.rowSubtitle}>{subtitle}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
        <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {/* ACCOUNT section */}
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          <View style={styles.group}>
            <SettingRow
              icon="document-text-outline"
              label="Personal Information"
              subtitle="Name ,phone number ,email,address"
              onPress={() => router.push('/(Screens)/PersonalInfoScreen' as any)}
            />
            <SettingRow
              icon="mail-outline"
              label="Change Email"
              subtitle="Update your email address"
              onPress={() => router.push('/(Screens)/ChangeEmailScreen' as any)}
            />
            <SettingRow
              icon="lock-closed-outline"
              label="Change password"
              subtitle="Update your password"
              onPress={() => router.push('/(Screens)/ChangePasswordScreen' as any)}
              isLast
            />
          </View>

          {/* CONTROL section */}
          <Text style={[styles.sectionTitle, { marginTop: 28 }]}>Control</Text>
          <View style={styles.group}>
            <SettingRow
              icon="pause-circle-outline"
              iconColor={COLORS.orange}
              label="Deactivate account"
              subtitle="Temporarily disable your account"
              labelColor={COLORS.orange}
              onPress={() => router.push('/(Screens)/DeactivateAccountScreen' as any)}
            />
            <SettingRow
              icon="trash-outline"
              iconColor={COLORS.red}
              label="Delete account"
              subtitle="Permanently delete all your data"
              labelColor={COLORS.red}
              onPress={() => router.push('/(Screens)/DeleteAccountScreen' as any)}
              isLast
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  backBtn: {
    marginTop: 8,
    marginLeft: 16,
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.sectionBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: COLORS.sectionBg,
    borderRadius: 20,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 1,
    marginBottom: 12,
  },
  group: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.primary,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rowIcon: { marginRight: 12 },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: '600' },
  rowSubtitle: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
});