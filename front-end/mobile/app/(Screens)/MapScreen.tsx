import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Image,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Config ───────────────────────────────────────────────────────────────────
// Change this to your PC's local IP when testing on phone
const API_BASE = 'http://192.168.162.46:8000';

const COLORS = {
  primary:      '#4A6741',
  primaryLight: '#C8D5C0',
  white:        '#FFFFFF',
  textPrimary:  '#1A1A1A',
  textMuted:    '#888888',
  background:   '#E8EDE5',
  red:          '#D94F4F',
  orange:       '#E07B39',
  green:        '#4A6741',
};

// ─── Types ────────────────────────────────────────────────────────────────────
type Urgency = 'green' | 'orange' | 'red';

interface Donation {
  id: number;
  title: string;
  description: string;
  category: string;
  quantity: number;
  available_quantity: number;
  unit: string;
  expiry_date: string;
  pickup_address: string;
  latitude: number;
  longitude: number;
  status: string;
  urgency: Urgency;
  image: string | null;
  donor_username: string;
  distance_km: number | null;
}

interface Coords {
  latitude: number;
  longitude: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const markerColor = (urgency: Urgency) => {
  if (urgency === 'red')    return COLORS.red;
  if (urgency === 'orange') return COLORS.orange;
  return COLORS.green;
};

const urgencyLabel = (urgency: Urgency) => {
  if (urgency === 'red')    return 'Urgent';
  if (urgency === 'orange') return 'Expiring soon';
  return 'Available';
};

// ─── API ──────────────────────────────────────────────────────────────────────
async function fetchDonations(coords: Coords): Promise<Donation[]> {
  const token = await AsyncStorage.getItem('access_token');
  console.log('TOKEN:', token); 
  const url = `${API_BASE}/api/donations/available/?lat=${coords.latitude}&lng=${coords.longitude}`;

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();

  // Handle paginated or plain array response
  return Array.isArray(data) ? data : (data.results ?? []);
}

// ─── Map Content (rendered after location ready) ──────────────────────────────
function MapContent({ coords }: { coords: Coords }) {
  const MapView           = require('react-native-maps').default;
  const { Marker, Circle } = require('react-native-maps');

  const router = useRouter();
  const [donations, setDonations]   = useState<Donation[]>([]);
  const [selected, setSelected]     = useState<Donation | null>(null);
  const [filter, setFilter]         = useState<Urgency | 'all'>('all');
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadDonations = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const data = await fetchDonations(coords);
      setDonations(data);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load donations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [coords]);

  useEffect(() => { loadDonations(); }, [loadDonations]);

  const visible = filter === 'all'
    ? donations
    : donations.filter((d) => d.urgency === filter);

  const region = {
    latitude:       coords.latitude,
    longitude:      coords.longitude,
    latitudeDelta:  0.018,
    longitudeDelta: 0.018,
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
        {/* Radius circle */}
        <Circle
          center={coords}
          radius={900}
          strokeColor="rgba(74,103,65,0.35)"
          fillColor="rgba(74,103,65,0.08)"
          strokeWidth={1.5}
        />

        {/* Real donation pins */}
        {visible.map((d) => (
          <Marker
            key={d.id}
            coordinate={{ latitude: d.latitude, longitude: d.longitude }}
            onPress={() => setSelected(d)}
          >
            <View style={[pin.wrap, { borderColor: markerColor(d.urgency) }]}>
              <View style={[pin.dot, { backgroundColor: markerColor(d.urgency) }]} />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Back button */}
      <View style={overlay.topRow}>
        <TouchableOpacity style={overlay.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <View style={overlay.chips}>
        {([
          { key: 'all',    label: 'All'         },
          { key: 'green',  label: '🟢 Fresh'    },
          { key: 'orange', label: '🟠 Expiring'  },
          { key: 'red',    label: '🔴 Urgent'   },
        ] as const).map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[overlay.chip, filter === f.key && overlay.chipActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[overlay.chipTxt, filter === f.key && overlay.chipTxtActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Loading overlay */}
      {loading && (
        <View style={overlay.loadingOverlay}>
          <ActivityIndicator color={COLORS.primary} size="small" />
          <Text style={overlay.loadingTxt}>Loading donations...</Text>
        </View>
      )}

      {/* Error banner */}
      {error && (
        <View style={overlay.errorBanner}>
          <Ionicons name="warning-outline" size={14} color={COLORS.orange} />
          <Text style={overlay.errorTxt}>{error}</Text>
          <TouchableOpacity onPress={() => loadDonations()}>
            <Text style={overlay.retryTxt}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Legend */}
      <View style={overlay.legend}>
        {[
          { color: COLORS.green,  label: 'Available' },
          { color: COLORS.orange, label: 'Expiring'  },
          { color: COLORS.red,    label: 'Urgent'    },
        ].map((i) => (
          <View key={i.label} style={overlay.legendRow}>
            <View style={[overlay.legendDot, { backgroundColor: i.color }]} />
            <Text style={overlay.legendTxt}>{i.label}</Text>
          </View>
        ))}
      </View>

      {/* Selected donation card */}
      {selected && (
        <View style={overlay.card}>
          <TouchableOpacity style={overlay.cardClose} onPress={() => setSelected(null)}>
            <Ionicons name="close" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <View style={[overlay.statusDot, { backgroundColor: markerColor(selected.urgency) }]} />
            <Text style={[overlay.statusTxt, { color: markerColor(selected.urgency) }]}>
              {urgencyLabel(selected.urgency)}
            </Text>
            {selected.distance_km !== null && (
              <Text style={overlay.distanceTxt}>• {selected.distance_km} km away</Text>
            )}
          </View>

          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 10 }}>
            {selected.image ? (
              <Image
                source={{ uri: `${API_BASE}${selected.image}` }}
                style={overlay.cardImage}
              />
            ) : (
              <View style={[overlay.cardImage, overlay.cardImagePlaceholder]}>
                <Ionicons name="image-outline" size={24} color={COLORS.textMuted} />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={overlay.cardTitle}>{selected.title}</Text>
              <Text style={overlay.cardCat}>{selected.category}</Text>
              <Text style={overlay.cardMeta}>
                {selected.available_quantity} {selected.unit} available
              </Text>
              <Text style={overlay.cardMeta}>By {selected.donor_username}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={overlay.reserveBtn}
            onPress={() => {
              setSelected(null);
              router.push({
                pathname: '/(Screens)/ReservationScreen',
                params: {
                  id:       String(selected.id),
                  title:    selected.title,
                  category: selected.category,
                  date:     selected.expiry_date,
                  postedBy: selected.donor_username,
                  imageUrl: selected.image ? `${API_BASE}${selected.image}` : '',
                },
              } as any);
            }}
          >
            <Text style={overlay.reserveTxt}>Reserve</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Count badge */}
      {!loading && (
        <View style={overlay.countBadge}>
          <Text style={overlay.countTxt}>
            {visible.length} donation{visible.length !== 1 ? 's' : ''} near you
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function MapScreen() {
  const router = useRouter();
  const [coords, setCoords] = useState<Coords | null>(null);
  const [status, setStatus] = useState('Requesting location permission...');
  const [error, setError]   = useState(false);

  useEffect(() => { init(); }, []);

  const init = async () => {
    try {
      setError(false);
      setStatus('Requesting permission...');
      const { status: perm } = await Location.requestForegroundPermissionsAsync();

      if (perm !== 'granted') {
        setStatus('Permission denied — using default location');
        setCoords({ latitude: 35.1897, longitude: -0.6311 });
        return;
      }

      setStatus('Getting your position...');
      const last = await Location.getLastKnownPositionAsync({ maxAge: 300000 });
      if (last) {
        setCoords({ latitude: last.coords.latitude, longitude: last.coords.longitude });
        return;
      }

      setStatus('Acquiring GPS signal...');
      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
      });
      setCoords({ latitude: current.coords.latitude, longitude: current.coords.longitude });

    } catch (e: any) {
      setError(true);
      setStatus(`Error: ${e?.message ?? 'Unknown error'}`);
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

  if (!coords) {
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

  return <MapContent coords={coords} />;
}

// ─── Pin styles ───────────────────────────────────────────────────────────────
const pin = StyleSheet.create({
  wrap: {
    width: 30, height: 30, borderRadius: 15,
    borderWidth: 2.5, backgroundColor: COLORS.white,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, shadowRadius: 3, elevation: 5,
  },
  dot: { width: 13, height: 13, borderRadius: 7 },
});

// ─── Overlay styles ───────────────────────────────────────────────────────────
const overlay = StyleSheet.create({
  topRow: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 54,
    left: 16, right: 16,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 4, elevation: 4,
  },
  chips: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 92 : 106,
    left: 12, right: 12,
    flexDirection: 'row', gap: 8, flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: COLORS.white, borderRadius: 999,
    paddingHorizontal: 14, paddingVertical: 7,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 3, elevation: 3,
  },
  chipActive: { backgroundColor: COLORS.primary },
  chipTxt:    { fontSize: 12, fontWeight: '600', color: COLORS.textPrimary },
  chipTxtActive: { color: COLORS.white },

  loadingOverlay: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 140 : 154,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.white,
    borderRadius: 999,
    paddingHorizontal: 14, paddingVertical: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 4,
  },
  loadingTxt: { fontSize: 12, color: COLORS.textMuted },

  errorBanner: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 140 : 154,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF8F0',
    borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: COLORS.orange,
  },
  errorTxt:  { fontSize: 11, color: COLORS.orange, flex: 1 },
  retryTxt:  { fontSize: 11, color: COLORS.primary, fontWeight: '700' },

  legend: {
    position: 'absolute', bottom: 160, left: 16,
    backgroundColor: COLORS.white, borderRadius: 12,
    padding: 10, gap: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 6, elevation: 4,
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendTxt: { fontSize: 12, color: COLORS.textPrimary, fontWeight: '500' },

  card: {
    position: 'absolute', bottom: 80, left: 16, right: 16,
    backgroundColor: COLORS.white, borderRadius: 18, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
  },
  cardClose:  { position: 'absolute', top: 12, right: 12, padding: 4 },
  statusDot:  { width: 8, height: 8, borderRadius: 4 },
  statusTxt:  { fontSize: 12, fontWeight: '600' },
  distanceTxt:{ fontSize: 11, color: COLORS.textMuted },
  cardImage: {
    width: 70, height: 70, borderRadius: 10,
    backgroundColor: '#E8EDE5',
  },
  cardImagePlaceholder: {
    alignItems: 'center', justifyContent: 'center',
  },
  cardTitle:  { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  cardCat:    { fontSize: 12, color: COLORS.textMuted, marginBottom: 4 },
  cardMeta:   { fontSize: 12, color: COLORS.textMuted },
  reserveBtn: {
    backgroundColor: COLORS.primary, borderRadius: 999,
    paddingVertical: 10, alignItems: 'center', marginTop: 8,
  },
  reserveTxt: { color: COLORS.white, fontSize: 14, fontWeight: '700' },

  countBadge: {
    position: 'absolute', bottom: 24, alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 999,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  countTxt: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
});

// ─── Loading screen styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  center: {
    flex: 1, backgroundColor: COLORS.background,
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 32,
  },
  backBtnLoading: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 54, left: 16,
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 4, elevation: 3,
  },
  msg:      { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginTop: 8 },
  retryBtn: {
    marginTop: 20, backgroundColor: COLORS.primary,
    paddingHorizontal: 28, paddingVertical: 12, borderRadius: 999,
  },
  retryTxt: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
});