import React, { useState, useEffect, useMemo } from 'react';
import ReservationAcceptedModal from '../../components/ReservationAcceptedModal';
import {
  View, FlatList, StyleSheet, StatusBar,
  Text, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchBar } from '../../components/SearchBar';
import { FilterButton } from '../../components/FilterButton';
import { FoodCard } from '../../components/FoodCard';
import axios from '../../constants/axios';
import * as Location from 'expo-location';
const COLORS = {
  primary: '#588157BF', secondary: '#588157',
  primaryLight: '#D1D8C4', background: '#F8F8F6',
  white: '#FFFFFF', textSecondary: '#555555',
  textMuted: '#888888', border: '#D5DED0', tagBg: '#E8EEE5',
};

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDistance, setSelectedDistance] = useState<number | null>(null);
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        let params = {};
        if (status === 'granted') {
          try {
            const loc = await Location.getCurrentPositionAsync({});
            params = { lat: loc.coords.latitude, lng: loc.coords.longitude };
          } catch (locationError) {
            console.warn('Location unavailable, loading donations without distance.', locationError);
          }
        }
        const res = await axios.get('/donations/available/', { params });
        setDonations(res.data);
      } catch (err) {
        console.log('Error fetching donations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, []);

  const filteredDonations = useMemo(() => {
    return donations.filter((item) => {
      if (
        searchQuery &&
        !item.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) return false;
      if (selectedCategory && item.category !== selectedCategory) return false;
      if (selectedDistance !== null && item.distance_km != null &&
        item.distance_km * 1000 > selectedDistance) return false;
      if (emergencyOnly && item.urgency !== 'red') return false;
      return true;
    });
  }, [searchQuery, selectedCategory, selectedDistance, emergencyOnly, donations]);

  const handleReserve = (donationId: string) => {
    const item = donations.find((d) => String(d.id) === donationId);
    if (!item) return;
    router.push({
      pathname: '/(Screens)/ReservationScreen' as any,
      params: {
        donationId:  String(item.id),
        title:       item.title,
        category:    item.category,
        date:        item.expiry_date,
        postedBy:    item.donor_username,
        imageUrl:    item.image ?? '',
        maxQuantity: String(item.available_quantity),
      },
    });
  };

  const hasActiveFilter = selectedCategory || selectedDistance !== null || emergencyOnly;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ReservationAcceptedModal />
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

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
                {selectedDistance === Infinity ? 'All distances'
                  : selectedDistance < 1000 ? `< ${selectedDistance} m`
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

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
        </View>
      ) : (
        <FlatList
          data={filteredDonations}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <FoodCard
              item={item}
              onReserve={handleReserve}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:        { flex: 1, backgroundColor: COLORS.background },
  centered:        { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, zIndex: 100, gap: 8 },
  mapBtn:          { width: 44, height: 44, borderRadius: 999, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  activeFilterRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  activeFilterTag: { backgroundColor: '#C8D5C0', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  emergencyTag:    { backgroundColor: '#F5C6C6' },
  activeFilterText:{ fontSize: 12, color: COLORS.secondary, fontWeight: '600' },
  listContent:     { paddingTop: 8, paddingBottom: 80 },
  emptyState:      { alignItems: 'center', paddingTop: 80 },
  emptyText:       { fontSize: 18, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 },
  emptySubText:    { fontSize: 14, color: COLORS.textMuted },
});