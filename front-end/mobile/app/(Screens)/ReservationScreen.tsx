import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

// ─── Theme ────────────────────────────────────────────────────────────────────
const COLORS = {
  primary:      '#4A6741',
  primaryLight: '#C8D5C0',
  cardBg:       '#DDE6D8',
  white:        '#FFFFFF',
  background:   '#F8F8F6',
  textPrimary:  '#1A1A1A',
  textMuted:    '#999999',
  border:       '#D5DED0',
  tagBg:        '#EAF0E7',
};

export default function ReservationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Accept params from navigation or use defaults
  const title      = (params.title      as string) ?? 'Mixed Berries';
  const category   = (params.category   as string) ?? 'Fruit & Vegetables';
  const date       = (params.date       as string) ?? '04/04/2026';
  const postedBy   = (params.postedBy   as string) ?? 'Username';
  const imageUrl   = (params.imageUrl   as string) ??
    'https://images.unsplash.com/photo-1563746924237-f81d3e6e5849?w=300&q=80';

  const [quantity, setQuantity] = useState(1);

  const increment = () => setQuantity((q) => q + 1);
  const decrement = () => setQuantity((q) => Math.max(1, q - 1));

  const handleConfirm = () => {
    // TODO: connect to backend — send reservation request to the donor
    // My Reservations tab only shows incoming requests on YOUR listings
    // so we do NOT add to the reservations store here
    router.back();
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
        {/* ── Main card ── */}
        <View style={styles.card}>
          {/* Instruction */}
          <Text style={styles.instruction}>
            Specify the quantity needed , then confirm your reservation
          </Text>

          {/* Item info row */}
          <View style={styles.itemRow}>
            <Image source={{ uri: imageUrl }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>{title}</Text>
              <View style={styles.tagsRow}>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{category}</Text>
                </View>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{date}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Posted by */}
          <Text style={styles.postedBy}>
            posted by:
            <Text style={styles.postedByName}> {postedBy}</Text>
          </Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Quantity selector */}
          <Text style={styles.quantityLabel}>Needed Quantity</Text>
          <View style={styles.quantityRow}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={decrement}
              activeOpacity={0.8}
            >
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>

            <Text style={styles.qtyValue}>{quantity}</Text>

            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={increment}
              activeOpacity={0.8}
            >
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Confirm button ── */}
        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={handleConfirm}
          activeOpacity={0.85}
        >
          <Text style={styles.confirmBtnText}>Confirm</Text>
        </TouchableOpacity>

        {/* ── Cancel button ── */}
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.tagBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 40,
    gap: 14,
  },

  // Main card
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 18,
  },
  instruction: {
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 16,
    lineHeight: 20,
  },

  // Item row
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: COLORS.border,
  },
  itemInfo: {
    flex: 1,
    gap: 8,
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: COLORS.white,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 11,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },

  // Posted by
  postedBy: {
    fontSize: 13,
    color: COLORS.textPrimary,
    marginBottom: 14,
  },
  postedByName: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 16,
  },

  // Quantity
  quantityLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  qtyBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    fontSize: 22,
    color: COLORS.primary,
    fontWeight: '600',
    lineHeight: 26,
  },
  qtyValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    minWidth: 32,
    textAlign: 'center',
  },

  // Buttons
  confirmBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  cancelBtn: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelBtnText: {
    color: COLORS.textMuted,
    fontSize: 16,
    fontWeight: '600',
  },
});