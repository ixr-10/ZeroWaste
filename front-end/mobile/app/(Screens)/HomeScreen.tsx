import { ReservationModal } from '../../components/ReservationModal';
import React, { useState, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchBar } from '../../components/SearchBar';
import { FilterButton } from '../../components/FilterButton';
import { FoodCard } from '../../components/FoodCard';
import { MOCK_LISTINGS } from '../../constants/data';

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
};

export default function HomeScreen() {
  const router = useRouter();
  const { addRequest } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDistance, setSelectedDistance] = useState<number | null>(null);
  const [emergencyOnly, setEmergencyOnly] = useState(false);

  const filteredListings = useMemo(() => {
    return MOCK_LISTINGS.filter((item) => {
      if (
        searchQuery &&
        !item.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) return false;
      if (selectedCategory && item.category !== selectedCategory) return false;
      if (selectedDistance !== null && item.distance > selectedDistance) return false;
      if (emergencyOnly && !item.isEmergency) return false;
      return true;
    });
  }, [searchQuery, selectedCategory, selectedDistance, emergencyOnly]);

   const [reservingItem, setReservingItem] = useState<typeof MOCK_LISTINGS[0] | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleReserve = (id: string) => {
    const item = MOCK_LISTINGS.find((l) => l.id === id);
    if (!item) return;
  addRequest({
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      weight: item.weight,
      expiryDate: item.expiryDate,
      distance: item.distance,
      donorName: item.donorName,
      donorId: item.donorId ?? '',
      imageUrl: item.imageUrl ?? '',
      status: 'pending',
    });
  };
  

  const handleConfirm = (itemId: string) => {
    setIsSuccess(true);
    // After 2 seconds → go to chat
    setTimeout(() => {
      setShowModal(false);
      router.push(`/(Screens)/ChatScreen?donorId=${reservingItem?.id}` as any);
    }, 2000);
  };

  const handleClose = () => {
    setShowModal(false);
    setReservingItem(null);
  };

  
  const hasActiveFilter = selectedCategory || selectedDistance !== null || emergencyOnly;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header row: Search | Filter | Map icon */}
      <View style={styles.header}>
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="" />
        <FilterButton
          activeFilter="Filter By"
          selectedCategory={selectedCategory}
          selectedDistance={selectedDistance}
          onSelectCategory={setSelectedCategory}
          onSelectDistance={setSelectedDistance}
          onSelectEmergency={setEmergencyOnly}
          emergencyOnly={emergencyOnly}
        />
        {/* Map icon button */}
        <TouchableOpacity
          style={styles.mapBtn}
          onPress={() => router.push('/(Screens)/MapScreen' as any)}
          activeOpacity={0.8}
        >
          <Ionicons name="map-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Active filter tags */}
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
        renderItem={({ item }) => <FoodCard item={item} onReserve={handleReserve} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No listings found</Text>
            <Text style={styles.emptySubText}>Try adjusting your filters or search</Text>
          </View>
        }
      />
       <ReservationModal
        visible={showModal}
        item={reservingItem}
        onClose={handleClose}
        onConfirm={handleConfirm}
        isSuccess={isSuccess}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    zIndex: 100,
    gap: 8,
  },
  mapBtn: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeFilterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  activeFilterTag: {
    backgroundColor: '#C8D5C0',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  emergencyTag: { backgroundColor: '#F5C6C6' },
  activeFilterText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  listContent: { paddingTop: 8, paddingBottom: 80 },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 18, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 },
  emptySubText: { fontSize: 14, color: COLORS.textMuted },
});
