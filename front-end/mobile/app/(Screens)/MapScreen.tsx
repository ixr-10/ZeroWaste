import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
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
  urgency?: 'green' | 'orange' | 'red' | null;
  latitude: number;
  longitude: number;
  donor_username: string;
  donor: string | number;
  image?: string;
  available_quantity: number;
  expiry_date: string;
  distance_km?: number;
}

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

// ─── Emergency Color Buttons (icon only, no labels) ──────────────────────────
const EmergencyColorButtons = ({
  filter,
  setFilter,
}: {
  filter: 'all' | 'urgent' | 'superUrgent' | 'superSuperUrgent';
  setFilter: React.Dispatch<React.SetStateAction<'all' | 'urgent' | 'superUrgent' | 'superSuperUrgent'>>;
}) => {
  const options = [
    { key: 'all', color: '#A8B5A0' as const },
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
              isActive && { backgroundColor: option.color + '15', borderColor: option.color },
            ]}
            onPress={() => setFilter(option.key)}
            activeOpacity={0.8}
          >
            {/* Pin icon only — no label text */}
            <View style={[emergency.pinContainer, { backgroundColor: option.color }]}>
              <View style={emergency.pinDot} />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// ─── Map Content ──────────────────────────────────────────────────────────────
function MapContent({ coords, listings }: { coords: Coords; listings: Listing[] }) {
  const MapView = require('react-native-maps').default;
  const { Marker, Circle } = require('react-native-maps');
  const router = useRouter();

  const [selected, setSelected] = useState<Listing | null>(null);
  const [filter, setFilter] = useState<'all' | 'urgent' | 'superUrgent' | 'superSuperUrgent'>('all');

  const visible = useMemo(() => {
    if (filter === 'all') return listings;
    return listings.filter((l) => {
      if (filter === 'superSuperUrgent') return l.urgency === 'red';
      if (filter === 'superUrgent') return l.urgency === 'orange';
      if (filter === 'urgent') return l.urgency === 'green' || !l.urgency;
      return true;
    });
  }, [listings, filter]);

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
      >
        <Circle
          center={coords}
          radius={900}
          strokeColor="rgba(88,129,87,0.35)"
          fillColor="rgba(88,129,87,0.08)"
          strokeWidth={1.5}
        />

        {visible.map((l) => (
          <Marker
            key={String(l.id)}
            coordinate={{ latitude: l.latitude, longitude: l.longitude }}
            onPress={() => setSelected(l)}
          >
            <View style={[pin.wrap, { borderColor: markerColor(l.urgency) }]}>
              <View style={[pin.dot, { backgroundColor: markerColor(l.urgency) }]} />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Back Button */}
      <View style={overlay.topRow}>
        <TouchableOpacity style={overlay.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Emergency Filter Buttons — icon only */}
      <EmergencyColorButtons filter={filter} setFilter={setFilter} />

      {/* Legend — proper emergency level names */}
      <View style={overlay.legend}>
        {[
          { color: COLORS.green, label: 'Urgent' },
          { color: COLORS.orange, label: 'High Priority' },
          { color: COLORS.red, label: 'Critical' },
        ].map((i) => (
          <View key={i.label} style={overlay.legendRow}>
            <View style={[overlay.legendDot, { backgroundColor: i.color }]} />
            <Text style={overlay.legendTxt}>{i.label}</Text>
          </View>
        ))}
      </View>

      {/* Selected Card */}
      {selected && (
        <View style={overlay.card}>
          <TouchableOpacity style={overlay.cardClose} onPress={() => setSelected(null)}>
            <Ionicons name="close" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <View style={[overlay.statusDot, { backgroundColor: markerColor(selected.urgency) }]} />
            <Text style={[overlay.statusTxt, { color: markerColor(selected.urgency) }]}>
              {statusLabel(selected.urgency)}
            </Text>
          </View>

          <Text style={overlay.cardTitle}>{selected.title}</Text>
          <Text style={overlay.cardCat}>{selected.category}</Text>
          {selected.distance_km && (
            <Text style={overlay.cardDistance}>📍 {selected.distance_km} km away</Text>
          )}

          <TouchableOpacity style={overlay.reserveBtn} onPress={handleReserve}>
            <Text style={overlay.reserveTxt}>Reserve</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Count */}
      <View style={overlay.countBadge}>
        <Text style={overlay.countTxt}>{visible.length} listings near you</Text>
      </View>
    </View>
  );
}

// ─── Main MapScreen ───────────────────────────────────────────────────────────
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
      setStatus('Requesting permission...');

      const { status: perm } = await Location.requestForegroundPermissionsAsync();
      let userCoords: Coords;

      if (perm !== 'granted') {
        setStatus('Permission denied — using default location');
        userCoords = { latitude: 35.1897, longitude: -0.6311 };
      } else {
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
      }

      setCoords(userCoords);
      setStatus('Loading donations...');

      const params = { lat: userCoords.latitude, lng: userCoords.longitude };
      const res = await api.get('donations/available/', { params });

      const donations = Array.isArray(res.data) ? res.data : [];

      const mapped: Listing[] = donations.map((d: any) => ({
        id: d.id,
        title: d.title,
        category: d.category,
        status: d.status || 'available',
        urgency: d.urgency,
        latitude: d.latitude,
        longitude: d.longitude,
        donor_username: d.donor_username,
        donor: d.donor,
        image: d.image,
        available_quantity: d.available_quantity,
        expiry_date: d.expiry_date,
        distance_km: d.distance_km,
      }));

      setListings(mapped);
      setLoading(false);
    } catch (e: any) {
      setError(true);
      setStatus(`Error: ${e?.message ?? 'Unknown error'}`);
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

// ─── Styles ───────────────────────────────────────────────────────────────────
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
    // Reduced vertical padding since there's no label anymore
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
  // Smaller pin icon (was 28×28)
  pinContainer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Smaller inner dot (was 10×10)
  pinDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
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
    bottom: 130,
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
    bottom: 70,
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
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusTxt: { fontSize: 12, fontWeight: '600' },
  cardTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  cardCat: { fontSize: 13, color: COLORS.textMuted, marginBottom: 8 },
  cardDistance: { fontSize: 12, color: COLORS.textMuted, marginBottom: 12, fontWeight: '500' },
  reserveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
  },
  reserveTxt: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  countBadge: {
    position: 'absolute',
    bottom: 20,
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