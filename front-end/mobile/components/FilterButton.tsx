import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { CATEGORIES, DISTANCE_OPTIONS } from '../constants/data';

export type FilterType = 'Category' | 'Emergency' | 'Distance' | 'Filter By';

interface FilterButtonProps {
  activeFilter: FilterType;
  selectedCategory: string | null;
  selectedDistance: number | null;
  onSelectCategory: (cat: string | null) => void;
  onSelectDistance: (dist: number | null) => void;
  onSelectEmergency: (val: boolean) => void;
  emergencyOnly: boolean;
}

export const FilterButton: React.FC<FilterButtonProps> = ({
  activeFilter,
  selectedCategory,
  selectedDistance,
  onSelectCategory,
  onSelectDistance,
  onSelectEmergency,
  emergencyOnly,
}) => {
  const [mainOpen, setMainOpen] = useState(false);
  const [subMenu, setSubMenu] = useState<'Category' | 'Distance' | null>(null);

  const getDistanceLabel = (distance: number): string => {
    if (distance === Infinity) return 'All distances';
    if (distance < 1000) return `< ${distance} m`;
    return `< ${distance / 1000} km`;
  };

  const getLabel = (): string => {
    if (subMenu === 'Category') return 'Category';
    if (subMenu === 'Distance') return 'Distance';
    if (emergencyOnly) return 'Emergency';
    if (selectedCategory) {
      return selectedCategory.length > 10 ? 'Category' : selectedCategory;
    }
    if (selectedDistance !== null) return getDistanceLabel(selectedDistance);
    return activeFilter;
  };

  const isActive =
    selectedCategory !== null || selectedDistance !== null || emergencyOnly;

  const handleMainOption = (option: 'Category' | 'Emergency' | 'Distance') => {
    if (option === 'Category') {
      setSubMenu('Category');
      setMainOpen(false);
    } else if (option === 'Distance') {
      setSubMenu('Distance');
      setMainOpen(false);
    } else {
      onSelectEmergency(!emergencyOnly);
      setMainOpen(false);
    }
  };

  const handleCategorySelect = (cat: string) => {
    onSelectCategory(selectedCategory === cat ? null : cat);
    setSubMenu(null);
  };

  const handleDistanceSelect = (dist: number) => {
    onSelectDistance(selectedDistance === dist ? null : dist);
    setSubMenu(null);
  };

  const closeAll = () => {
    setMainOpen(false);
    setSubMenu(null);
  };

  const label = getLabel();

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={[styles.button, isActive && styles.buttonActive]}
        onPress={() => {
          if (subMenu) {
            setSubMenu(null);
          } else {
            setMainOpen(!mainOpen);
          }
        }}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>{label}</Text>
        <Ionicons
          name={mainOpen || subMenu ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={COLORS.white}
          style={{ marginLeft: 4 }}
        />
      </TouchableOpacity>

      {/* Main dropdown */}
      {mainOpen && (
        <View style={styles.dropdown}>
          {(['Category', 'Emergency', 'Distance'] as const).map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.dropdownItem, opt !== 'Distance' && styles.dropdownBorder]}
              onPress={() => handleMainOption(opt)}
            >
              <Text style={styles.dropdownText}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Category sub-menu */}
      {subMenu === 'Category' && (
        <View style={[styles.dropdown, styles.categoryGrid]}>
          {CATEGORIES.reduce<string[][]>((rows, cat, i) => {
            if (i % 2 === 0) rows.push([cat]);
            else rows[rows.length - 1].push(cat);
            return rows;
          }, []).map((row, ri) => (
            <View key={ri} style={styles.categoryRow}>
              {row.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryItem,
                    selectedCategory === cat && styles.categoryItemActive,
                  ]}
                  onPress={() => handleCategorySelect(cat)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === cat && styles.categoryTextActive,
                    ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
              {row.length === 1 && <View style={[styles.categoryItem, { backgroundColor: 'transparent', borderWidth: 0 }]} />}
            </View>
          ))}
        </View>
      )}

      {/* Distance sub-menu */}
      {subMenu === 'Distance' && (
        <View style={styles.dropdown}>
          {DISTANCE_OPTIONS.map((opt, i) => (
            <TouchableOpacity
              key={opt.label}
              style={[
                styles.dropdownItem,
                i < DISTANCE_OPTIONS.length - 1 && styles.dropdownBorder,
                selectedDistance === opt.value && styles.dropdownItemActive,
              ]}
              onPress={() => handleDistanceSelect(opt.value)}
            >
              <Text
                style={[
                  styles.dropdownText,
                  selectedDistance === opt.value && styles.dropdownTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Backdrop to close */}
      {(mainOpen || subMenu !== null) && (
        <Pressable style={styles.backdrop} onPress={closeAll} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    zIndex: 100,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    height: 44,
    minWidth: 110,
    justifyContent: 'center',
  },
  buttonActive: {
    backgroundColor: COLORS.primaryMedium,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  dropdown: {
    position: 'absolute',
    top: 50,
    right: 0,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 160,
    zIndex: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  categoryGrid: {
    minWidth: 260,
  },
  categoryRow: {
    flexDirection: 'row',
  },
  categoryItem: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.sm,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryItemActive: {
    backgroundColor: COLORS.primaryLight,
  },
  categoryText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  categoryTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  dropdownItem: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
  },
  dropdownBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dropdownItemActive: {
    backgroundColor: COLORS.primaryLight,
  },
  dropdownText: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  dropdownTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  backdrop: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    zIndex: 150,
  },
});
