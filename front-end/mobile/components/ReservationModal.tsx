import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { FoodListing } from '../constants/data';

const COLORS = {
  primary: '#588157',
  primaryLight: '#C8D5C0',
  background: '#F5F5F5',
  white: '#FFFFFF',
  textPrimary: '#1A1A1A',
  textSecondary: '#555555',
  textMuted: '#888888',
  border: '#D5DED0',
  overlay: 'rgba(0,0,0,0.45)',
  success: '#4A6741',
  successLight: '#E8EEE5',
};

interface ReservationModalProps {
  visible: boolean;
  item: FoodListing | null;
  onClose: () => void;
  onConfirm: (itemId: string) => void;
  isSuccess: boolean;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  visible,
  item,
  onClose,
  onConfirm,
  isSuccess,
}) => {
  const insets = useSafeAreaInsets();

  if (!item) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Overlay */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={!isSuccess ? onClose : undefined}
      />

      {/* Bottom Sheet */}
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>

        {/* Handle bar */}
        <View style={styles.handle} />

        {!isSuccess ? (
          /* ── Confirmation view ── */
          <>
            <Text style={styles.sheetTitle}>Confirm Reservation</Text>
            <Text style={styles.sheetSubtitle}>
              You&apos;re about to reserve the following item:
            </Text>

            {/* Item summary card */}
            <View style={styles.itemCard}>
              <View style={styles.itemInfo}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{item.category}</Text>
                </View>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDescription} numberOfLines={2}>
                  {item.description}
                </Text>

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Ionicons name="scale-outline" size={14} color={COLORS.textMuted} />
                    <Text style={styles.metaText}>{item.weight}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} />
                    <Text style={styles.metaText}>{item.expiryDate}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="location-outline" size={14} color={COLORS.textMuted} />
                    <Text style={styles.metaText}>
                      {item.distance < 1000
                        ? `${item.distance} m`
                        : `${(item.distance / 1000).toFixed(1)} km`}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Donor info */}
            <View style={styles.donorRow}>
              <View style={styles.donorAvatar}>
                <Ionicons name="person" size={16} color={COLORS.primary} />
              </View>
              <Text style={styles.donorName}>Shared by {item.username}</Text>
            </View>

            {/* Note */}
            <View style={styles.noteBox}>
              <Ionicons name="information-circle-outline" size={16} color={COLORS.primary} />
              <Text style={styles.noteText}>
                After confirming, you&apos;ll be connected with the donor via chat to arrange pickup.
              </Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={() => onConfirm(item.id)}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          /* ── Success view ── */
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={40} color={COLORS.white} />
            </View>
            <Text style={styles.successTitle}>Reserved!</Text>
            <Text style={styles.successMessage}>
              Your reservation for{' '}
              <Text style={{ fontWeight: '700' }}>{item.title}</Text>{' '}
              is confirmed. Connecting you with {item.username}...
            </Text>
            <View style={styles.redirectNote}>
              <Ionicons name="chatbubble-outline" size={16} color={COLORS.primary} />
              <Text style={styles.redirectText}>Opening chat with donor</Text>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#D5DED0',
    borderRadius: 999,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 16,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D5DED0',
    marginBottom: 12,
  },
  itemInfo: { gap: 6 },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8EEE5',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  categoryText: { fontSize: 11, color: '#4A6741', fontWeight: '600' },
  itemTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A1A' },
  itemDescription: { fontSize: 13, color: '#555555', lineHeight: 18 },
  metaRow: { flexDirection: 'row', gap: 14, marginTop: 4 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#888888' },
  donorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  donorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#C8D5C0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donorName: { fontSize: 14, color: '#555555', fontWeight: '500' },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#E8EEE5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  noteText: { fontSize: 13, color: '#4A6741', flex: 1, lineHeight: 18 },
  buttonRow: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#D5DED0',
    alignItems: 'center',
  },
  cancelText: { fontSize: 15, fontWeight: '600', color: '#555555' },
  confirmBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: '#4A6741',
    alignItems: 'center',
  },
  confirmText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  successContainer: { alignItems: 'center', paddingVertical: 24, gap: 12 },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#4A6741',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  successTitle: { fontSize: 24, fontWeight: '700', color: '#1A1A1A' },
  successMessage: {
    fontSize: 14,
    color: '#555555',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  redirectNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: '#E8EEE5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  redirectText: { fontSize: 13, color: '#4A6741', fontWeight: '600' },
});
