import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { FoodListing } from '../constants/data';
import { CardMenu } from './CardMenu';

interface FoodCardProps {
  item: FoodListing;
  onReserve: (id: string) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({ item, onReserve }) => {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);

  const isReserved = useAppStore((state) => state.isReserved(item.id));

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${meters} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const handleReserve = () => {
    if (isReserved) return;

    // Navigate to ReservationScreen — confirmation happens there
    router.push({
      pathname: '/(Screens)/ReservationScreen',
      params: {
        id:       item.id,
        title:    item.title,
        category: item.category,
        date:     item.expiryDate,
        postedBy: item.username,
        imageUrl: item.imageUrl ?? '',
      },
    } as any);
  };

  return (
    <View style={styles.card}>
      {/* Image Section */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Distance badge */}
        <View style={styles.distanceBadge}>
          <Ionicons name="location" size={12} color={COLORS.emergencyRed} />
          <Text style={styles.distanceText}>{formatDistance(item.distance)}</Text>
        </View>

        {/* Emergency badge */}
        {item.isEmergency && (
          <View style={styles.emergencyBadge}>
            <Ionicons name="alert-circle" size={12} color={COLORS.white} />
            <Text style={styles.emergencyText}>Emergency</Text>
          </View>
        )}

        {/* 3-dot menu button */}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setMenuVisible(true)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <View style={styles.menuButtonInner}>
            <Ionicons name="ellipsis-vertical" size={18} color={COLORS.black} />
          </View>
        </TouchableOpacity>

        {/* Inline card menu overlay */}
        {menuVisible && (
          <CardMenu
            onReserve={() => { handleReserve(); setMenuVisible(false); }}
            onReport={() => setMenuVisible(false)}
            onNotInterested={() => setMenuVisible(false)}
            onClose={() => setMenuVisible(false)}
          />
        )}
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{item.title}</Text>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryTagText}>{item.category}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaTag}>
            <Text style={styles.metaText}>{item.weight}</Text>
          </View>
          <View style={styles.metaTag}>
            <Text style={styles.metaText}>{item.expiryDate}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.footer}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={18} color={COLORS.primaryMedium} />
            </View>
            <Text style={styles.username}>{item.username}</Text>
          </View>

          {/* ✅ Reserve button — navigates to ReservationScreen */}
          <TouchableOpacity
            style={[styles.reserveButton, isReserved && styles.reservedButton]}
            onPress={handleReserve}
            disabled={isReserved}
            activeOpacity={isReserved ? 1 : 0.8}
          >
            {isReserved && (
              <Ionicons name="checkmark" size={14} color="#888888" style={{ marginRight: 4 }} />
            )}
            <Text style={[styles.reserveButtonText, isReserved && styles.reservedButtonText]}>
              {isReserved ? 'Reserved' : 'Reserve'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: BORDER_RADIUS.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 220,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  distanceBadge: {
    position: 'absolute',
    bottom: SPACING.sm,
    left: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    gap: 3,
  },
  distanceText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  emergencyBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.emergencyRed,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    gap: 3,
  },
  emergencyText: {
    fontSize: 11,
    color: COLORS.white,
    fontWeight: '700',
  },
  menuButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    zIndex: 10,
  },
  menuButtonInner: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.sm,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoSection: {
    padding: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  categoryTag: {
    backgroundColor: COLORS.tagBg,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
  },
  categoryTagText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '500',
  },
  description: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
    marginBottom: SPACING.sm,
  },
  metaRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  metaTag: {
    backgroundColor: COLORS.tagBg,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  username: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  reserveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
  },
  reservedButton: {
    backgroundColor: '#D5DED0',
  },
  reserveButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  reservedButtonText: {
    color: '#888888',
  },
});