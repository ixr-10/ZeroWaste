import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../constants/axios';

const COLORS = {
  primary: '#4A6741',
  background: '#E8EBE1',
  sectionBg: '#F5F5F5',
  cardBg: '#F5F7F3',
  white: '#FFFFFF',
  textPrimary: '#1A1A1A',
  textMuted: '#999999',
  border: '#E0E7DC',
  error: '#D94F4F',
};

interface InfoRowProps {
  icon: string;
  label: string;
  value: string;
  isLast?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value, isLast }) => (
  <View style={[styles.infoRow, !isLast && styles.infoRowBorder]}>
    <Ionicons name={icon as any} size={22} color={COLORS.textPrimary} style={styles.infoIcon} />
    <View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '—'}</Text>
    </View>
  </View>
);

export default function PersonalInfoScreen() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/profile/');
        setUser(data);
      } catch (err: any) {
        setError('Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Information</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.outerCard}>

            {/* Avatar */}
            <View style={styles.avatarCard}>
              <View style={styles.avatarCircle}>
                {user?.profile_picture ? (
                  <Image source={{ uri: user.profile_picture }} style={styles.avatarImage} />
                ) : (
                  <View style={[styles.avatarImage, styles.avatarPlaceholder]}>
                    <Ionicons name="person" size={40} color={COLORS.primary} />
                  </View>
                )}
              </View>
            </View>

            {/* Info rows */}
            <View style={styles.infoCard}>
              <InfoRow
                icon="person-outline"
                label="Username"
                value={user?.username}
              />
              <InfoRow
                icon="mail-outline"
                label="Email"
                value={user?.email}
              />
              <InfoRow
                icon="call-outline"
                label="Phone number"
                value={user?.phone_number}
              />
              <InfoRow
                icon="location-outline"
                label="Address"
                value={user?.address}
                isLast
              />
            </View>
          </View>
        </ScrollView>
      )}
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
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 14, color: COLORS.error, textAlign: 'center', paddingHorizontal: 24 },
  outerCard: { backgroundColor: COLORS.sectionBg, borderRadius: 20, padding: 16, gap: 12 },
  avatarCard: { backgroundColor: COLORS.cardBg, borderRadius: 16, padding: 20, alignItems: 'center' },
  avatarCircle: {
    width: 90, height: 90, borderRadius: 45,
    borderWidth: 2.5, borderColor: COLORS.primary,
    overflow: 'hidden', backgroundColor: '#B8D4E8',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarPlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8EEE5' },
  infoCard: { backgroundColor: COLORS.cardBg, borderRadius: 16, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  infoIcon: { marginRight: 14 },
  infoLabel: { fontSize: 12, color: COLORS.textMuted },
  infoValue: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary, marginTop: 2 },
});