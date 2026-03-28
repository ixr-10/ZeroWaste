import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

export default function NotificationScreen() {
  return (
  <SafeAreaView style={styles.container}>
    <View style={styles.center}>
      <Ionicons name="notifications-outline" size={64} color={COLORS.primaryLight} />
      <Text style={styles.title}>Notifications</Text>
      <Text style={styles.subtitle}>No new notifications</Text>
    </View>
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  subtitle: { fontSize: 14, color: COLORS.textMuted },
});
