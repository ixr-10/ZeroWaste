import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';

interface CardMenuProps {
  onReserve: () => void;
  onReport: () => void;
  onNotInterested: () => void;
  onClose: () => void;
}

export const CardMenu: React.FC<CardMenuProps> = ({
  onReserve,
  onReport,
  onNotInterested,
  onClose,
}) => {
  const options = [
    { label: 'Reserve', onPress: onReserve },
    { label: 'Report', onPress: onReport },
    { label: 'Not interested', onPress: onNotInterested },
  ];

  return (
    <>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.menu}>
        {options.map((opt, i) => (
          <TouchableOpacity
            key={opt.label}
            style={[
              styles.menuItem,
              i < options.length - 1 && styles.menuItemBorder,
            ]}
            onPress={opt.onPress}
          >
            <Text style={styles.menuItemText}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 8,
  },
  menu: {
    position: 'absolute',
    top: 8,
    right: 44,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    minWidth: 150,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  menuItem: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'flex-end',
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  menuItemText: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
});