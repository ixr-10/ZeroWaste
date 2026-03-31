import React, { useEffect, useState } from 'react';
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

const COLORS = {
  primary: '#4A6741',
  primaryLight: '#C8D5C0',
  white: '#FFFFFF',
  textPrimary: '#1A1A1A',
  textMuted: '#888888',
  background: '#E8EDE5',
  red: '#D94F4F',
  orange: '#E07B39',
  green: '#4A6741',
};

const MOCK_OFFSETS = [
  { id: '1', title: 'Mixed Berries',    category: 'Fruit & Vegetables', status: 'active',    dlat:  0.002, dlng:  0.003 },
  { id: '2', title: 'Homemade Bread',   category: 'Pastries',           status: 'expiring',  dlat: -0.001, dlng:  0.004 },
  { id: '3', title: 'Organic Tomatoes', category: 'Fruit & Vegetables', status: 'active',    dlat:  0.004, dlng: -0.002 },
  { id: '4', title: 'Lentil Soup',      category: 'Cooked Meals',       status: 'emergency', dlat: -0.003, dlng: -0.001 },
  { id: '5', title: 'Whole Milk',       category: 'Milk Products',      status: 'emergency', dlat:  0.001, dlng: -0.004 },
  { id: '6', title: 'Beef',             category: 'Meat & Fish',        status: 'expiring',  dlat: -0.004, dlng:  0.002 },
  { id: '7', title: 'Chinese Food',     category: 'Cooked Meals',       status: 'active',    dlat:  0.003, dlng:  0.001 },
];

type ListingStatus = 'active' | 'expiring' | 'emergency';

interface Coords { latitude: number; longitude: number; }
interface Listing {
  id: string; title: string; category: string;
  status: ListingStatus; latitude: number; longitude: number;
}

const markerColor = (s: ListingStatus) =>
  s === 'emergency' ? COLORS.red : s === 'expiring' ? COLORS.orange : COLORS.green;

const statusLabel = (s: ListingStatus) =>
  s === 'emergency' ? 'Emergency' : s === 'expiring' ? 'Expiring soon' : 'Available';

// ─── Map content (only rendered after location is ready) ──────────────────────
function MapContent({ coords }: { coords: Coords }) {
  // Import maps here so it only loads on native
  const MapView     = require('react-native-maps').default;
  const { Marker, Circle } = require('react-native-maps');

  const router = useRouter();
  const [selected, setSelected]     = useState<Listing | null>(null);
  const [filter, setFilter]         = useState<ListingStatus | 'all'>('all');

  const listings: Listing[] = MOCK_OFFSETS.map((o) => ({
    id: o.id, title: o.title, category: o.category,
    status: o.status as ListingStatus,
    latitude:  coords.latitude  + o.dlat,
    longitude: coords.longitude + o.dlng,
  }));

  const visible = filter === 'all' ? listings : listings.filter((l) => l.status === filter);

  const region = {
    latitude:      coords.latitude,
    longitude:     coords.longitude,
    latitudeDelta:  0.018,
    longitudeDelta: 0.018,
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
  style={StyleSheet.absoluteFillObject}
  mapType="standard"          // uses Apple Maps on iOS
  // on Android without API key it uses OpenStreetMap automatically
  initialRegion={region}
  showsUserLocation
>
        <Circle
          center={coords}
          radius={900}
          strokeColor="rgba(74,103,65,0.35)"
          fillColor="rgba(74,103,65,0.08)"
          strokeWidth={1.5}
        />
        {visible.map((l) => (
          <Marker
            key={l.id}
            coordinate={{ latitude: l.latitude, longitude: l.longitude }}
            onPress={() => setSelected(l)}
          >
            <View style={[pin.wrap, { borderColor: markerColor(l.status) }]}>
              <View style={[pin.dot, { backgroundColor: markerColor(l.status) }]} />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Back */}
      <View style={overlay.topRow}>
        <TouchableOpacity style={overlay.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <View style={overlay.chips}>
        {([
          { key: 'all',       label: 'All'        },
          { key: 'active',    label: '🟢 Fresh'   },
          { key: 'expiring',  label: '🟠 Expiring' },
          { key: 'emergency', label: '🔴 Urgent'  },
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

      {/* Legend */}
      <View style={overlay.legend}>
        {[
          { color: COLORS.green,  label: 'Available' },
          { color: COLORS.orange, label: 'Expiring'  },
          { color: COLORS.red,    label: 'Emergency' },
        ].map((i) => (
          <View key={i.label} style={overlay.legendRow}>
            <View style={[overlay.legendDot, { backgroundColor: i.color }]} />
            <Text style={overlay.legendTxt}>{i.label}</Text>
          </View>
        ))}
      </View>

      {/* Selected card */}
      {selected && (
        <View style={overlay.card}>
          <TouchableOpacity style={overlay.cardClose} onPress={() => setSelected(null)}>
            <Ionicons name="close" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <View style={[overlay.statusDot, { backgroundColor: markerColor(selected.status) }]} />
            <Text style={[overlay.statusTxt, { color: markerColor(selected.status) }]}>
              {statusLabel(selected.status)}
            </Text>
          </View>
          <Text style={overlay.cardTitle}>{selected.title}</Text>
          <Text style={overlay.cardCat}>{selected.category}</Text>
          <TouchableOpacity style={overlay.reserveBtn} onPress={() => { setSelected(null); router.back(); }}>
            <Text style={overlay.reserveTxt}>Reserve</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Listings count */}
      <View style={overlay.countBadge}>
        <Text style={overlay.countTxt}>{visible.length} listings near you</Text>
      </View>
    </View>
  );
}

// ─── Main screen: wait for location, then show map ────────────────────────────
export default function MapScreen() {
  const router = useRouter();
  const [coords, setCoords] = useState<Coords | null>(null);
  const [status, setStatus] = useState('Requesting location permission...');
  const [error,  setError]  = useState(false);

  useEffect(() => { init(); }, []);

  const init = async () => {
    try {
      setError(false);
      setStatus('Requesting permission...');
      const { status: perm } = await Location.requestForegroundPermissionsAsync();

      if (perm !== 'granted') {
        setStatus('Permission denied — using default location (Sidi Bel Abbes)');
        setCoords({ latitude: 35.1897, longitude: -0.6311 });
        return;
      }

      setStatus('Getting your position...');
      // Try last known first (instant)
      const last = await Location.getLastKnownPositionAsync({ maxAge: 300000 });
      if (last) {
        setStatus('Done ✓');
        setCoords({ latitude: last.coords.latitude, longitude: last.coords.longitude });
        return;
      }

      setStatus('Acquiring GPS signal...');
      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
      });
      setStatus('Done ✓');
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

  // Show loading until we have coords
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
    position: 'absolute', top: Platform.OS === 'android' ? 40 : 54,
    left: 16, right: 16,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center',
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
  chipTxt: { fontSize: 12, fontWeight: '600', color: COLORS.textPrimary },
  chipTxtActive: { color: COLORS.white },

  legend: {
    position: 'absolute', bottom: 130, left: 16,
    backgroundColor: COLORS.white, borderRadius: 12,
    padding: 10, gap: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 6, elevation: 4,
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendTxt: { fontSize: 12, color: COLORS.textPrimary, fontWeight: '500' },

  card: {
    position: 'absolute', bottom: 70, left: 16, right: 16,
    backgroundColor: COLORS.white, borderRadius: 18, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
  },
  cardClose: { position: 'absolute', top: 12, right: 12, padding: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusTxt: { fontSize: 12, fontWeight: '600' },
  cardTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  cardCat: { fontSize: 13, color: COLORS.textMuted, marginBottom: 14 },
  reserveBtn: {
    backgroundColor: COLORS.primary, borderRadius: 999,
    paddingVertical: 10, alignItems: 'center',
  },
  reserveTxt: { color: COLORS.white, fontSize: 14, fontWeight: '700' },

  countBadge: {
    position: 'absolute', bottom: 20, alignSelf: 'center',
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
    position: 'absolute', top: Platform.OS === 'android' ? 40 : 54, left: 16,
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 4, elevation: 3,
  },
  msg: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginTop: 8 },
  retryBtn: {
    marginTop: 20, backgroundColor: COLORS.primary,
    paddingHorizontal: 28, paddingVertical: 12, borderRadius: 999,
  },
  retryTxt: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
});