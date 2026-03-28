import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';

export default function ProfileScreen() {
  return (
  <SafeAreaView style={styles.container}>
    <View style={styles.content}>
      <View style={styles.avatarCircle}>
        <Ionicons name="person" size={48} color={COLORS.primaryMedium} />
      </View>
      <Text style={styles.name}>Username</Text>
      <Text style={styles.email}>user@example.com</Text>

      {['My Listings', 'Reserved Items', 'Settings', 'Log Out'].map((item) => (
        <TouchableOpacity key={item} style={styles.menuItem}>
          <Text style={styles.menuText}>{item}</Text>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
      ))}
    </View>
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, alignItems: 'center', padding: SPACING.xl },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  name: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary },
  email: { fontSize: 14, color: COLORS.textMuted, marginBottom: SPACING.xl },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuText: { fontSize: 16, color: COLORS.textPrimary },
});
