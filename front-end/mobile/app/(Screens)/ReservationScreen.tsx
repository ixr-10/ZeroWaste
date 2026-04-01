import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, Image, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from '../../constants/axios';

const COLORS = {
  primary: '#4A6741', primaryLight: '#C8D5C0', cardBg: '#DDE6D8',
  white: '#FFFFFF', background: '#F8F8F6', textPrimary: '#1A1A1A',
  textMuted: '#999999', border: '#D5DED0', tagBg: '#EAF0E7',
};

export default function ReservationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // ✅ All params come from HomeScreen.handleReserve with correct keys
  const donationId  = params.donationId  as string;
  const title       = (params.title      as string) ?? 'Item';
  const category    = (params.category   as string) ?? '';
  const date        = (params.date       as string) ?? '';
  const postedBy    = (params.postedBy   as string) ?? 'Unknown';
  const imageUrl    = (params.imageUrl   as string) ?? '';
  const maxQuantity = parseInt((params.maxQuantity as string) ?? '99');

  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);

  const increment = () => setQuantity((q) => Math.min(q + 1, maxQuantity));
  const decrement = () => setQuantity((q) => Math.max(1, q - 1));

  const handleConfirm = async () => {
    if (!donationId || donationId === 'undefined') {
      Alert.alert('Error', 'Invalid donation. Please go back and try again.');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`/donations/available/${donationId}/reserve/`, {
        quantity_requested: quantity,
      });

      setSuccess(true);
      setTimeout(() => {
        router.replace('/(Screens)/ChatList' as any);
      }, 1500);

    } catch (err: any) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        'Reservation failed. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reservation</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>

          {/* Success state */}
          {success ? (
            <View style={styles.successBox}>
              <Ionicons name="checkmark-circle" size={52} color={COLORS.primary} />
              <Text style={styles.successText}>Reservation sent!</Text>
              <Text style={styles.successSub}>Redirecting to your chats…</Text>
            </View>
          ) : (
            <>
              <Text style={styles.instruction}>
                Specify the quantity needed, then confirm your reservation
              </Text>

              <View style={styles.itemRow}>
                {imageUrl ? (
                  <Image source={{ uri: imageUrl }} style={styles.itemImage} />
                ) : (
                  <View style={[styles.itemImage, { backgroundColor: COLORS.border }]} />
                )}
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle}>{title}</Text>
                  <View style={styles.tagsRow}>
                    <View style={styles.tag}><Text style={styles.tagText}>{category}</Text></View>
                    <View style={styles.tag}><Text style={styles.tagText}>{date}</Text></View>
                  </View>
                </View>
              </View>

              <Text style={styles.postedBy}>
                posted by:<Text style={styles.postedByName}> {postedBy}</Text>
              </Text>

              <View style={styles.divider} />

              <Text style={styles.quantityLabel}>
                Needed Quantity{' '}
                <Text style={{ color: COLORS.textMuted, fontWeight: '400', fontSize: 12 }}>
                  (max {maxQuantity})
                </Text>
              </Text>
              <View style={styles.quantityRow}>
                <TouchableOpacity style={styles.qtyBtn} onPress={decrement} activeOpacity={0.8}>
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qtyValue}>{quantity}</Text>
                <TouchableOpacity style={styles.qtyBtn} onPress={increment} activeOpacity={0.8}>
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {!success && (
          <>
            <TouchableOpacity
              style={[styles.confirmBtn, loading && { opacity: 0.7 }]}
              onPress={handleConfirm}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color={COLORS.white} />
                : <Text style={styles.confirmBtnText}>Confirm</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()} activeOpacity={0.7}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:      { flex: 1, backgroundColor: COLORS.background },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  backBtn:       { width: 40, height: 40, borderRadius: 10, backgroundColor: COLORS.tagBg, alignItems: 'center', justifyContent: 'center' },
  headerTitle:   { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  content:       { flex: 1, paddingHorizontal: 16, paddingTop: 40, gap: 14 },
  card:          { backgroundColor: COLORS.cardBg, borderRadius: 20, padding: 18 },
  instruction:   { fontSize: 14, color: COLORS.primary, marginBottom: 16, lineHeight: 20 },
  itemRow:       { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 12 },
  itemImage:     { width: 80, height: 80, borderRadius: 12 },
  itemInfo:      { flex: 1, gap: 8 },
  itemTitle:     { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary },
  tagsRow:       { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  tag:           { backgroundColor: COLORS.white, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  tagText:       { fontSize: 11, color: COLORS.textPrimary, fontWeight: '500' },
  postedBy:      { fontSize: 13, color: COLORS.textPrimary, marginBottom: 14 },
  postedByName:  { color: COLORS.primary, fontWeight: '700' },
  divider:       { height: 1, backgroundColor: COLORS.border, marginBottom: 16 },
  quantityLabel: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 16 },
  quantityRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24 },
  qtyBtn:        { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText:    { fontSize: 22, color: COLORS.primary, fontWeight: '600', lineHeight: 26 },
  qtyValue:      { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary, minWidth: 32, textAlign: 'center' },
  confirmBtn:    { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  confirmBtnText:{ color: COLORS.white, fontSize: 16, fontWeight: '700' },
  cancelBtn:     { backgroundColor: COLORS.white, borderRadius: 14, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  cancelBtnText: { color: COLORS.textMuted, fontSize: 16, fontWeight: '600' },
  successBox:    { alignItems: 'center', paddingVertical: 30, gap: 10 },
  successText:   { fontSize: 20, fontWeight: '700', color: COLORS.primary },
  successSub:    { fontSize: 13, color: COLORS.textMuted },
});