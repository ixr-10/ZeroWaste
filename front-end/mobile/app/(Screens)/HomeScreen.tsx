import React, { useState, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Text,
} from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';
import { SearchBar } from '../../components/SearchBar';
import { FilterButton } from '../../components/FilterButton';
import { FoodCard } from '../../components/FoodCard';
import { MOCK_LISTINGS } from '../../constants/data';

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDistance, setSelectedDistance] = useState<number | null>(null);
  const [emergencyOnly, setEmergencyOnly] = useState(false);

  const filteredListings = useMemo(() => {
    return MOCK_LISTINGS.filter((item) => {
      // Search filter
      if (
        searchQuery &&
        !item.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      // Category filter
      if (selectedCategory && item.category !== selectedCategory) return false;
      // Distance filter
      if (selectedDistance !== null && item.distance > selectedDistance) return false;
      // Emergency filter
      if (emergencyOnly && !item.isEmergency) return false;
      return true;
    });
  }, [searchQuery, selectedCategory, selectedDistance, emergencyOnly]);

  const handleReserve = (id: string) => {
    console.log('Reserved item:', id);
  };

  const hasActiveFilter = selectedCategory || selectedDistance !== null || emergencyOnly;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header with search and filter */}
      <View style={styles.header}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder=""
        />
        <FilterButton
          activeFilter="Filter By"
          selectedCategory={selectedCategory}
          selectedDistance={selectedDistance}
          onSelectCategory={setSelectedCategory}
          onSelectDistance={setSelectedDistance}
          onSelectEmergency={setEmergencyOnly}
          emergencyOnly={emergencyOnly}
        />
      </View>

      {/* Active filter indicator */}
      {hasActiveFilter && (
        <View style={styles.activeFilterRow}>
          {selectedCategory && (
            <View style={styles.activeFilterTag}>
              <Text style={styles.activeFilterText}>{selectedCategory}</Text>
            </View>
          )}
          {selectedDistance !== null && (
            <View style={styles.activeFilterTag}>
              <Text style={styles.activeFilterText}>
                {selectedDistance === Infinity
                  ? 'All distances'
                  : selectedDistance < 1000
                  ? `< ${selectedDistance} m`
                  : `< ${selectedDistance / 1000} km`}
              </Text>
            </View>
          )}
          {emergencyOnly && (
            <View style={[styles.activeFilterTag, styles.emergencyTag]}>
              <Text style={styles.activeFilterText}>Emergency</Text>
            </View>
          )}
        </View>
      )}

      {/* Listings */}
      <FlatList
        data={filteredListings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FoodCard item={item} onReserve={handleReserve} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No listings found</Text>
            <Text style={styles.emptySubText}>
              Try adjusting your filters or search
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    zIndex: 100,
  },
  activeFilterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  activeFilterTag: {
    backgroundColor: '#C8D5C0',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  emergencyTag: {
    backgroundColor: '#F5C6C6',
  },
  activeFilterText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  listContent: {
    paddingTop: SPACING.md,
    paddingBottom: 80,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  emptySubText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
});
