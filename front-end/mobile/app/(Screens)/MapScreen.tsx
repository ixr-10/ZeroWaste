import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import api from '../../constants/axios';

const COLORS = {
  primary: '#588157',
  primaryLight: '#C8D5C0',
  white: '#FFFFFF',
  textPrimary: '#1A1A1A',
  textMuted: '#888888',
  background: '#E8EDE5',
  red: '#D94F4F',
  orange: '#E07B39',
  green: '#4A6741',
};

type Filter = 'all' | 'urgent' | 'superUrgent' | 'superSuperUrgent';
type Urgency = 'green' | 'orange' | 'red';
type ListingStatus = 'available' | 'reserved' | 'expired';

interface Coords {
  latitude: number;
  longitude: number;
}

interface Listing {
  id: string | number;
  title: string;
  category: string;
  status: ListingStatus;
  urgency?: Urgency | null;
  latitude: number;
  longitude: number;
  donor_username: string;
  donor: string | number;
  image?: string | null;
  available_quantity: number;
  unit?: string | null;
  expiry_date: string;
  distance_km?: number | null;
}

const DEFAULT_COORDS: Coords = { latitude: 35.1897, longitude: -0.6311 };

const markerColor = (urgency?: string | null) => {
  if (urgency === 'red') return COLORS.red;
  if (urgency === 'orange') return COLORS.orange;
  return COLORS.green;
};

const statusLabel = (urgency?: string | null) => {
  if (urgency === 'red') return 'Critical';
  if (urgency === 'orange') return 'High Priority';
  return 'Urgent';
};

const EmergencyColorButtons = ({
  filter,
  setFilter,
}: {
  filter: Filter;
  setFilter: React.Dispatch<React.SetStateAction<Filter>>;
}) => {
  const options = [
    { key: 'all', color: '#A8B5A0' },
    { key: 'urgent', color: COLORS.green },
    { key: 'superUrgent', color: COLORS.orange },
    { key: 'superSuperUrgent', color: COLORS.red },
  ] as const;

  return (
    <View style={emergency.container}>
      {options.map((option) => {
        const isActive = filter === option.key;
        return (
          <TouchableOpacity
            key={option.key}
            style={[
              emergency.button,
              isActive && { backgroundColor: `${option.color}15`, borderColor: option.color },
            ]}
            onPress={() => setFilter(option.key)}
            activeOpacity={0.8}
          >
            <View style={[emergency.pinContainer, { backgroundColor: option.color }]}>
              <View style={emergency.pinDot} />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

function MapContent({ coords, listings }: { coords: Coords; listings: Listing[] }) {
  const MapView = require('react-native-maps').default;
  const { Marker, Circle } = require('react-native-maps');
  const router = useRouter();

  const [selected, setSelected] = useState<Listing | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  const visible = useMemo(() => {
    if (filter === 'all') return listings;
    return listings.filter((listing) => {
      if (filter === 'superSuperUrgent') return listing.urgency === 'red';
      if (filter === 'superUrgent') return listing.urgency === 'orange';
      if (filter === 'urgent') return listing.urgency === 'green' || !listing.urgency;
      return true;
    });
  }, [filter, listings]);

  const region = {
    latitude: coords.latitude,
    longitude: coords.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const handleReserve = () => {
    if (!selected) return;
    router.push({
      pathname: '/(Screens)/ReservationScreen' as any,
      params: {
        donationId: String(selected.id),
        title: selected.title,
        category: selected.category,
        date: selected.expiry_date,
        postedBy: selected.donor_username,
        imageUrl: selected.image ?? '',
        maxQuantity: String(selected.available_quantity),
      },
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        mapType="standard"
        initialRegion={region}
        showsUserLocation
        onPress={() => setSelected(null)}
      >
        <Circle
          center={coords}
          radius={900}
          strokeColor="rgba(88,129,87,0.35)"
          fillColor="rgba(88,129,87,0.08)"
          strokeWidth={1.5}
        />

        {visible.map((listing) => (
          <Marker
            key={String(listing.id)}
            coordinate={{ latitude: listing.latitude, longitude: listing.longitude }}
            onPress={() => setSelected(listing)}
          >
            <View style={[pin.wrap, { borderColor: markerColor(listing.urgency) }]}>
              <View style={[pin.dot, { backgroundColor: markerColor(listing.urgency) }]} />
            </View>
          </Marker>
        ))}
      </MapView>

      <View style={overlay.topRow}>
        <TouchableOpacity style={overlay.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <EmergencyColorButtons filter={filter} setFilter={setFilter} />

      <View style={overlay.legend}>
        {[
          { color: COLORS.green, label: 'Urgent' },
          { color: COLORS.orange, label: 'High Priority' },
          { color: COLORS.red, label: 'Critical' },
        ].map((item) => (
          <View key={item.label} style={overlay.legendRow}>
            <View style={[overlay.legendDot, { backgroundColor: item.color }]} />
            <Text style={overlay.legendTxt}>{item.label}</Text>
          </View>
        ))}
      </View>

      {selected && (
        <View style={overlay.card}>
          <TouchableOpacity style={overlay.cardClose} onPress={() => setSelected(null)}>
            <Ionicons name="close" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={overlay.statusRow}>
            <View style={[overlay.statusDot, { backgroundColor: markerColor(selected.urgency) }]} />
            <Text style={[overlay.statusTxt, { color: markerColor(selected.urgency) }]}>
              {statusLabel(selected.urgency)}
            </Text>
            {selected.distance_km != null && (
              <Text style={overlay.distanceTxt}>{selected.distance_km} km away</Text>
            )}
          </View>

          <View style={overlay.cardBody}>
            {selected.image ? (
              <Image source={{ uri: selected.image }} style={overlay.cardImage} />
            ) : (
              <View style={[overlay.cardImage, overlay.cardImagePlaceholder]}>
                <Ionicons name="image-outline" size={24} color={COLORS.textMuted} />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={overlay.cardTitle} numberOfLines={1}>
                {selected.title}
              </Text>
              <Text style={overlay.cardCat}>{selected.category}</Text>
              <Text style={overlay.cardMeta}>
                {selected.available_quantity} {selected.unit ?? 'items'} available
              </Text>
              <Text style={overlay.cardMeta}>By {selected.donor_username}</Text>
            </View>
          </View>

          <TouchableOpacity style={overlay.reserveBtn} onPress={handleReserve}>
            <Text style={overlay.reserveTxt}>Reserve</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={overlay.countBadge}>
        <Text style={overlay.countTxt}>
          {visible.length} donation{visible.length !== 1 ? 's' : ''} near you
        </Text>
      </View>
    </View>
  );
}

export default function MapScreen() {
  const router = useRouter();
  const [coords, setCoords] = useState<Coords | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [status, setStatus] = useState('Requesting location permission...');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      setError(false);
      setLoading(true);
      setStatus('Requesting permission...');

      const { status: permission } = await Location.requestForegroundPermissionsAsync();
      let userCoords: Coords = DEFAULT_COORDS;
      let hasUserCoords = false;

      if (permission !== 'granted') {
        setStatus('Permission denied. Using default location.');
      } else {
        const servicesEnabled = await Location.hasServicesEnabledAsync().catch(() => false);

        if (!servicesEnabled) {
          setStatus('Location services are off. Using default location.');
        } else {
          try {
            setStatus('Getting your position...');
            const last = await Location.getLastKnownPositionAsync({ maxAge: 300000 });

            if (last) {
              userCoords = { latitude: last.coords.latitude, longitude: last.coords.longitude };
            } else {
              setStatus('Acquiring GPS signal...');
              const current = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
              });
              userCoords = { latitude: current.coords.latitude, longitude: current.coords.longitude };
            }
            hasUserCoords = true;
          } catch (locationError) {
            console.log('Location unavailable, using default map location.', locationError);
            setStatus('Location unavailable. Using default location.');
          }
        }
      }

      setCoords(userCoords);
      setStatus('Loading donations...');

      const params = hasUserCoords ? { lat: userCoords.latitude, lng: userCoords.longitude } : undefined;
      const res = await api.get('donations/available/', { params });
      const donations = Array.isArray(res.data) ? res.data : res.data?.results ?? [];

      const mapped: Listing[] = donations
        .filter((donation: any) => donation.latitude != null && donation.longitude != null)
        .map((donation: any) => ({
          id: donation.id,
          title: donation.title,
          category: donation.category,
          status: donation.status || 'available',
          urgency: donation.urgency,
          latitude: Number(donation.latitude),
          longitude: Number(donation.longitude),
          donor_username: donation.donor_username,
          donor: donation.donor,
          image: donation.image,
          available_quantity: donation.available_quantity,
          unit: donation.unit,
          expiry_date: donation.expiry_date,
          distance_km: donation.distance_km,
        }));

      setListings(mapped);
    } catch (e: any) {
      setError(true);
      setStatus(`Error: ${e?.message ?? 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.center}>
        <Ionicons name="map-outline" size={64} color={COLORS.primaryLight} />
        <Text style={styles.msg}>Map is available on mobile only.</Text>
      </View>
    );
  }

  if (!coords || loading) {
    return (
      <View style={styles.center}>
        <TouchableOpacity style={styles.backBtnLoading} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginBottom: 16 }} />
        <Text style={styles.msg}>{status}</Text>
        {error && (
          <TouchableOpacity style={styles.retryBtn} onPress={init}>
            <Text style={styles.retryTxt}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return <MapContent coords={coords} listings={listings} />;
}

const pin = StyleSheet.create({
  wrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2.5,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  dot: { width: 13, height: 13, borderRadius: 7 },
});

const emergency = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 100 : 115,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pinContainer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
  },
});

const overlay = StyleSheet.create({
  topRow: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 54,
    left: 16,
    right: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  legend: {
    position: 'absolute',
    bottom: 160,
    left: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 10,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendTxt: { fontSize: 12, color: COLORS.textPrimary, fontWeight: '500' },
  card: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cardClose: { position: 'absolute', top: 12, right: 12, padding: 4 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusTxt: { fontSize: 12, fontWeight: '600' },
  distanceTxt: { fontSize: 11, color: COLORS.textMuted },
  cardBody: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  cardImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: COLORS.background,
  },
  cardImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  cardCat: { fontSize: 12, color: COLORS.textMuted, marginBottom: 4 },
  cardMeta: { fontSize: 12, color: COLORS.textMuted },
  reserveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  reserveTxt: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  countBadge: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  countTxt: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
});

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  backBtnLoading: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 54,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  msg: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginTop: 8 },
  retryBtn: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 999,
  },
  retryTxt: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
});
