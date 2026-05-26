import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useIsFocused } from '@react-navigation/native';
import {
  View,
  FlatList,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchBar } from '../../components/SearchBar';
import { FilterButton } from '../../components/FilterButton';
import { BottomNavBar } from '../../components/ButtomNavBar';
import { FoodCard } from '../../components/FoodCard';
import api from '../../constants/axios';
import * as Location from 'expo-location';

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

// Sort weight: red = 0 (top), yellow = 1, green = 2, none = 3
const urgencyWeight = (urgency?: string | null): number => {
  if (urgency === 'red')    return 0;
  if (urgency === 'orange') return 1;
  if (urgency === 'green')  return 2;
  return 3;
};

export default function HomeScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  //const reservedRef = useRef<{ id: string; quantity: number } | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDistance, setSelectedDistance] = useState<number | null>(null);
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFocused) fetchDonations();
  }, [isFocused]);

 const fetchDonations = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    let params: any = {};

    if (status === 'granted') {
      try {
        const loc = await Location.getCurrentPositionAsync({});
        params = { lat: loc.coords.latitude, lng: loc.coords.longitude };
        api.put('users/profile/', {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        }).catch(e => console.log('Location sync failed:', e));
      } catch (locationError) {
        console.warn('Location unavailable, loading without distance.', locationError);
      }
    }

    const res = await api.get('donations/available/', { params });
    setDonations(res.data);
  } catch (err) {
    console.log('Error fetching donations:', err);
  } finally {
    setLoading(false);
  }
};

  const filteredDonations = useMemo(() => {
    const filtered = donations.filter((item) => {
      if (
        searchQuery &&
        !item.title?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      ) return false;

      if (selectedCategory && item.category !== selectedCategory) return false;

      if (
        selectedDistance !== null &&
        item.distance_km != null &&
        item.distance_km * 1000 > selectedDistance
      ) return false;

      // Shows any item with ANY urgency level (not just red)
      if (emergencyOnly && !item.urgency) return false;

      return true;
    });

    // Sort Critical → High Priority → Urgent when emergency filter is active
    if (emergencyOnly) {
      filtered.sort((a, b) => urgencyWeight(a.urgency) - urgencyWeight(b.urgency));
    }

    return filtered;
  }, [searchQuery, selectedCategory, selectedDistance, emergencyOnly, donations]);

  const handleNotInterested = async (donationId: string) => {
    try {
      await api.post(`donations/available/${donationId}/not-interested/`);
      setDonations(prev => prev.filter(d => String(d.id) !== donationId));
    } catch (err: any) {
      console.error('Not interested failed:', err.response?.data);
    }
  };

  const handleReport = (donationId: string, donationTitle: string) => {
    router.push({
      pathname: '/(Screens)/ReportPost' as any,
      params: { donationId, donationTitle },
    });
  };

  const handleReserve = (donationId: string) => {
    const item = donations.find((d) => String(d.id) === donationId);
    if (!item) return;
    //reservedRef.current = { id: donationId, quantity: 1 };
    router.push({
      pathname: '/(Screens)/ReservationScreen' as any,
      params: {
        donationId: String(item.id),
        title: item.title,
        category: item.category,
        date: item.expiry_date,
        postedBy: item.donor_username,
        imageUrl: item.image ?? '',
        maxQuantity: String(item.available_quantity),
      },
    });
  };

  const hasActiveFilter = selectedCategory || selectedDistance !== null || emergencyOnly;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
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
        <TouchableOpacity
          style={styles.mapBtn}
          onPress={() => router.push('/(Screens)/MapScreen' as any)}
          activeOpacity={0.8}
        >
          <Ionicons name="map-outline" size={22} color={COLORS.secondary} />
        </TouchableOpacity>
      </View>

      {/* Active Filters Display */}
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

      {/* Content */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
        </View>
      ) : (
        <FlatList
          data={filteredDonations}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            // ✅ item passed as-is — FoodCard handles the urgency pin display
            <FoodCard
              item={item}
              onReserve={handleReserve}
              onNotInterested={handleNotInterested}
              onReport={handleReport}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No listings found</Text>
              <Text style={styles.emptySubText}>Try adjusting your filters or search</Text>
            </View>
          }
        />
      )}

      <BottomNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
  activeFilterText: { fontSize: 12, color: COLORS.secondary, fontWeight: '600' },
  listContent: { paddingTop: 8, paddingBottom: 100 },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 18, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 },
  emptySubText: { fontSize: 14, color: COLORS.textMuted },
});