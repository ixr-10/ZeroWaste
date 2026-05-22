import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  UIManager,
  findNodeHandle,
  ActionSheetIOS,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const COLORS = {
  primary: '#588157BF',
  secondary: '#588157',
  primaryLight: '#D1D8C4',
  background: '#F8F8F6',
  white: '#FFFFFF',
  textSecondary: '#555555',
  textMuted: '#888888',
  border: '#D5DED0',
  tagBg: '#E8EEE5',
  pinGreen: '#4A6741',
  pinOrange: '#E07B39',
  pinRed: '#D94F4F',
  pinGray: '#B0B8A8',
};

const screenWidth = Dimensions.get('window').width;

interface FoodCardProps {
  item: {
    id: string | number;
    title: string;
    description: string;
    category: string;
    image?: string;
    available_quantity: number;
    unit?: string;
    expiry_date: string;
    donor_username: string;
    donor: string | number;
    urgency?: string;
    distance_km?: number;
  };
  onReserve: (donationId: string) => void;
  onReport: (donationId: string, title: string) => void;
  onNotInterested: (donationId: string) => void;
}

// ─── Urgency pin — matches the map screen style ───────────────────────────────
const urgencyPinColor = (urgency?: string | null): string => {
  if (urgency === 'red')    return COLORS.pinRed;
  if (urgency === 'orange') return COLORS.pinOrange;
  if (urgency === 'green')  return COLORS.pinGreen;
  return COLORS.pinGray;
};

const UrgencyPin = ({ urgency }: { urgency?: string | null }) => {
  const color = urgencyPinColor(urgency);
  return (
    <View style={[pin.outer, { borderColor: color }]}>
      <View style={[pin.inner, { backgroundColor: color }]} />
    </View>
  );
};

export const FoodCard: React.FC<FoodCardProps> = ({ item, onReserve, onReport, onNotInterested }) => {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const menuRef = useRef(null);

  const formatQuantity = (qty: number, unit?: string) => {
    const u = (unit ?? 'g').trim();
    return `${qty} ${u}`;
  };

  const formatDate = (dateString: string) => {
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

  const handleProfilePress = () => {
    router.push({
      pathname: '/(Screens)/UserProfile' as any,
      params: { id: String(item.donor) },
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
          if (buttonIndex === 1) onReserve(String(item.id));
          else if (buttonIndex === 2) onReport(String(item.id), item.title);
          else if (buttonIndex === 3) onNotInterested(String(item.id));
        }
      );
    } else {
      setMenuVisible(!menuVisible);
    }
  };

  const getUrgencyColor = () => {
    if (item.urgency === 'red')    return '#FFB3B3';
    if (item.urgency === 'orange') return '#FFEBCC';
    return COLORS.tagBg;
  };

  return (
    <View style={styles.cardContainer}>
      {/* Image Container */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image || 'https://via.placeholder.com/350x200?text=No+Image' }}
          style={styles.image}
        />
        <View style={styles.sizeBadge}>
          <Text style={styles.sizeBadgeText}>{formatQuantity(item.available_quantity, item.unit)}</Text>
        </View>

        <TouchableOpacity ref={menuRef} style={styles.menuButton} onPress={handleMenuPress}>
          <Ionicons name="ellipsis-vertical" size={20} color={COLORS.secondary} />
        </TouchableOpacity>

        {Platform.OS === 'android' && menuVisible && (
          <View style={styles.contextMenu}>
            <TouchableOpacity style={styles.menuItem} onPress={() => { onReserve(String(item.id)); setMenuVisible(false); }}>
              <Text style={styles.menuItemText}>Reserve</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { onReport(String(item.id), item.title); setMenuVisible(false); }}>
              <Text style={styles.menuItemText}>Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { onNotInterested(String(item.id)); setMenuVisible(false); }}>
              <Text style={styles.menuItemText}>Not Interested</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Content Container */}
      <View style={styles.contentContainer}>

        {/* Title row: title text + urgency pin after it */}
        <View style={styles.titleRow}>
          <View style={styles.titleWithPin}>
            <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
            {/* ✅ Pin icon always shown; color reflects urgency level */}
            <UrgencyPin urgency={item.urgency} />
          </View>
          <Text style={styles.category}>{item.category}</Text>
        </View>

        {/* Description */}
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        {/* Quantity and Date Row */}
        <View style={styles.infoRow}>
          <View style={[styles.infoBadge, { backgroundColor: getUrgencyColor() }]}>
            <Text style={styles.infoBadgeText}>{formatQuantity(item.available_quantity, item.unit)}</Text>
          </View>
          <Text style={styles.date}>{formatDate(item.expiry_date)}</Text>
        </View>

        {/* User and Reserve Row */}
        <View style={styles.bottomRow}>
          <TouchableOpacity style={styles.userContainer} onPress={handleProfilePress} activeOpacity={0.7}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.donor_username.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.username}>{item.donor_username}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.reserveButton} onPress={() => onReserve(String(item.id))} activeOpacity={0.8}>
            <Text style={styles.reserveButtonText}>Reserve</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// ─── Pin styles ───────────────────────────────────────────────────────────────
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
    // subtle shadow like the map pins
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

// ─── Card styles ──────────────────────────────────────────────────────────────
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
  },
  // ✅ Title + pin sit together in a row
  titleWithPin: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textSecondary,
    flexShrink: 1,
  },
  category: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
    marginLeft: 8,
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
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
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