import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const COLORS = {
  primary: '#588157BF',
  secondary: '#588157',
  primaryLight: '#D1D8C4',
  white: '#FFFFFF',
  black: '#1A1A1A',
  textPrimary: '#1A1A1A',
  textSecondary: '#555555',
  textMuted: '#888888',
  border: '#D5DED0',
  tagBg: '#E8EEE5',
  emergencyRed: '#D94F4F',
  pinGreen: '#4A6741',
  pinOrange: '#E07B39',
  pinRed: '#D94F4F',
  pinGray: '#B0B8A8',
};

interface FoodCardProps {
  item: {
    id: string | number;
    title: string;
    description?: string;
    category?: string;
    image?: string | null;
    available_quantity: number;
    quantity?: number;
    unit?: string;
    expiry_date?: string;
    donor_username?: string;
    donor?: string | number;
    donor_id?: string | number;
    donor_avatar?: string | null;
    urgency?: string | null;
    distance_km?: number | null;
  };
  onReserve: (donationId: string) => void;
  onReport: (donationId: string, title: string) => void;
  onNotInterested: (donationId: string) => void;
  onPressAvatar?: (donorId: string) => void;
}

const urgencyPinColor = (urgency?: string | null): string => {
  if (urgency === 'red') return COLORS.pinRed;
  if (urgency === 'orange') return COLORS.pinOrange;
  if (urgency === 'green') return COLORS.pinGreen;
  return COLORS.pinGray;
};

const urgencyBadgeColor = (urgency?: string | null): string => {
  if (urgency === 'red') return '#FFB3B3';
  if (urgency === 'orange') return '#FFEBCC';
  return COLORS.tagBg;
};

const formatQuantity = (qty: number, unit?: string) => {
  const normalizedUnit = (unit ?? 'g').trim();
  return `${qty} ${normalizedUnit}`;
};

const formatDate = (dateString?: string) => {
  if (!dateString) return 'No expiry date';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

const formatDistance = (distanceKm: number) => {
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  return `${distanceKm.toFixed(1)} km`;
};

const UrgencyPin = ({ urgency }: { urgency?: string | null }) => {
  const color = urgencyPinColor(urgency);

  return (
    <View style={[pin.outer, { borderColor: color }]}>
      <View style={[pin.inner, { backgroundColor: color }]} />
    </View>
  );
};

export const FoodCard: React.FC<FoodCardProps> = ({
  item,
  onReserve,
  onReport,
  onNotInterested,
  onPressAvatar,
}) => {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);

  const donationId = String(item.id);
  const donorId = item.donor ?? item.donor_id;

  const handleProfilePress = () => {
    if (!donorId) return;

    if (onPressAvatar) {
      onPressAvatar(String(donorId));
      return;
    }

    router.push({
      pathname: '/(Screens)/UserProfile' as any,
      params: { userId: String(donorId) },
    });
  };

  const handleMenuPress = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Reserve', 'Report', 'Not Interested'],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 3,
          userInterfaceStyle: 'light',
        },
        (buttonIndex) => {
          if (buttonIndex === 1) onReserve(donationId);
          if (buttonIndex === 2) onReport(donationId, item.title);
          if (buttonIndex === 3) onNotInterested(donationId);
        }
      );
      return;
    }

    setMenuVisible((prev) => !prev);
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image || 'https://via.placeholder.com/350x200?text=No+Image' }}
          style={styles.image}
        />

        <View style={styles.sizeBadge}>
          <Text style={styles.sizeBadgeText}>
            {formatQuantity(item.available_quantity, item.unit)}
          </Text>
        </View>

        {item.distance_km != null && (
          <View style={styles.distanceBadge}>
            <Ionicons name="location" size={12} color={COLORS.emergencyRed} />
            <Text style={styles.distanceText}>{formatDistance(item.distance_km)}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.menuButton}
          onPress={handleMenuPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={COLORS.secondary} />
        </TouchableOpacity>

        {Platform.OS !== 'ios' && menuVisible && (
          <View style={styles.contextMenu}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onReserve(donationId);
                setMenuVisible(false);
              }}
            >
              <Text style={styles.menuItemText}>Reserve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onReport(donationId, item.title);
                setMenuVisible(false);
              }}
            >
              <Text style={styles.menuItemText}>Report</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemLast]}
              onPress={() => {
                onNotInterested(donationId);
                setMenuVisible(false);
              }}
            >
              <Text style={styles.menuItemText}>Not Interested</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.titleRow}>
          <View style={styles.titleWithPin}>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            <UrgencyPin urgency={item.urgency} />
          </View>

          {item.category && (
            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>{item.category}</Text>
            </View>
          )}
        </View>

        {!!item.description && (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View style={styles.infoRow}>
          <View style={[styles.infoBadge, { backgroundColor: urgencyBadgeColor(item.urgency) }]}>
            <Text style={styles.infoBadgeText}>
              {formatQuantity(item.available_quantity, item.unit)}
            </Text>
          </View>
          <Text style={styles.date}>{formatDate(item.expiry_date)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.bottomRow}>
          <TouchableOpacity style={styles.userContainer} onPress={handleProfilePress} activeOpacity={0.7}>
            <View style={styles.avatar}>
              {item.donor_avatar ? (
                <Image source={{ uri: item.donor_avatar }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>
                  {(item.donor_username ?? 'U').charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            <Text style={styles.username} numberOfLines={1}>
              {item.donor_username ?? 'Unknown'}
            </Text>
            {donorId && <Ionicons name="chevron-forward" size={12} color={COLORS.textMuted} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.reserveButton}
            onPress={() => onReserve(donationId)}
            activeOpacity={0.8}
          >
            <Text style={styles.reserveButtonText}>Reserve</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const pin = StyleSheet.create({
  outer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  inner: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
});

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    backgroundColor: '#E0E0E0',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  sizeBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  sizeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  distanceBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  distanceText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  menuButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  contextMenu: {
    position: 'absolute',
    top: 50,
    right: 12,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  contentContainer: {
    padding: 12,
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  titleWithPin: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flexShrink: 1,
  },
  categoryTag: {
    backgroundColor: COLORS.tagBg,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  categoryTagText: {
    fontSize: 11,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  infoBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  date: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  username: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
    flexShrink: 1,
  },
  reserveButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  reserveButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },
});
