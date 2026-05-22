import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Pressable,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../../constants/axios';

// ─── Theme ────────────────────────────────────────────────────────────────────
const COLORS = {
  primary: '#588157',
  primaryMedium: '#7A9B71',
  background: '#E8EDE5',
  white: '#FFFFFF',
  textPrimary: '#1A1A1A',
  textSecondary: '#555555',
  textMuted: '#888888',
  cardBg: '#FFFFFF',
  sectionBg: '#E8EBE1',
  border: '#D5DED0',
  red: '#D94F4F',
  orange: '#E07B39',
  green: '#4A6741',
  inputBg: '#F7FAF5',
};

type EmergencyColor = 'green' | 'orange' | 'red';

const CATEGORIES = [
  'Fruit & Vegetables',
  'Pastries',
  'Milk Products',
  'Meat & Fish',
  'Preserved Food',
  'Cooked Meals',
  'Drinks',
  'Other',
];

const UNITS = ['Kg', 'g', 'L', 'Pieces'];

// ─── Category Dropdown ────────────────────────────────────────────────────────
const CategoryDropdown = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ zIndex: 100 }}>
      <TouchableOpacity style={styles.dropdownTrigger} onPress={() => setOpen(!open)} activeOpacity={0.8}>
        <Text style={value ? styles.dropdownValue : styles.dropdownPlaceholder}>
          {value || 'The previous selected category'}
        </Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.primary} />
      </TouchableOpacity>
      {open && (
        <>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setOpen(false)} />
          <View style={styles.dropdownList}>
            {Array.from({ length: Math.ceil(CATEGORIES.length / 2) }).map((_, rowIdx) => (
              <View key={rowIdx} style={styles.dropdownRow}>
                {CATEGORIES.slice(rowIdx * 2, rowIdx * 2 + 2).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.dropdownCell, value === cat && styles.dropdownCellActive]}
                    onPress={() => { onChange(cat); setOpen(false); }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.dropdownCellText, value === cat && styles.dropdownCellTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
};

// ─── Unit Dropdown ────────────────────────────────────────────────────────────
const UnitDropdown = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ zIndex: 200 }}>
      <TouchableOpacity style={styles.unitTrigger} onPress={() => setOpen(!open)} activeOpacity={0.8}>
        <Text style={value ? styles.unitValue : styles.unitPlaceholder}>{value || 'Unit'}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={14} color={COLORS.primary} />
      </TouchableOpacity>
      {open && (
        <>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setOpen(false)} />
          <View style={styles.unitList}>
            {UNITS.map((u) => (
              <TouchableOpacity
                key={u}
                style={[styles.unitItem, value === u && styles.unitItemActive]}
                onPress={() => { onChange(u); setOpen(false); }}
                activeOpacity={0.7}
              >
                <Text style={[styles.unitItemText, value === u && styles.unitItemTextActive]}>{u}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  );
};

// ─── Emergency Color Picker ───────────────────────────────────────────────────
const EmergencyColorPicker = ({
  value,
  onChange,
}: {
  value: EmergencyColor;
  onChange: (v: EmergencyColor) => void;
}) => {
  const options: { key: EmergencyColor; color: string }[] = [
    { key: 'green', color: COLORS.green },
    { key: 'orange', color: COLORS.orange },
    { key: 'red', color: COLORS.red },
  ];
  return (
    <View style={styles.colorRow}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.key}
          style={[styles.colorBtn, value === opt.key && styles.colorBtnActive]}
          onPress={() => onChange(opt.key)}
          activeOpacity={0.8}
        >
          <View style={styles.pinHead}>
            <View style={[styles.pinDot, { backgroundColor: opt.color }]} />
          </View>
          <View style={[styles.pinStick, { backgroundColor: opt.color }]} />
        </TouchableOpacity>
      ))}
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function EditPostScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ post: string }>();

  const [post, setPost] = useState<any | null>(null);

  // Form fields
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [emergencyColor, setEmergencyColor] = useState<EmergencyColor>('orange');
  const [meetingPoint, setMeetingPoint] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Date picker
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Location
  const [locationLoading, setLocationLoading] = useState(false);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/Profile');
  };

  // ── Pre-fill form from the donation object passed via params ──────────────
  useEffect(() => {
    if (!params.post) return;
    try {
      const parsed = JSON.parse(params.post);
      setPost(parsed);

      if (parsed.category)        setCategory(parsed.category);
      if (parsed.quantity)        setQuantity(String(parsed.quantity));
      if (parsed.unit)            setUnit(parsed.unit);
      if (parsed.pickup_address)  setMeetingPoint(parsed.pickup_address); // ✅ correct field name
      if (parsed.description)     setDescription(parsed.description);
      if (parsed.urgency)         setEmergencyColor(parsed.urgency as EmergencyColor); // ✅ correct field name

      if (parsed.expiry_date) {
        const parts = String(parsed.expiry_date).split('-');
        if (parts.length === 3) {
          const [yyyy, mm, dd] = parts;
          setExpirationDate(`${dd}/${mm}/${yyyy}`);
          setSelectedDate(new Date(parsed.expiry_date));
        }
      }
    } catch {
      // silent
    }
  }, [params.post]);

  // ── Date picker ───────────────────────────────────────────────────────────
  const handleDatePickerChange = (_: any, date?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      const dd   = String(date.getDate()).padStart(2, '0');
      const mm   = String(date.getMonth() + 1).padStart(2, '0');
      const yyyy = date.getFullYear();
      setExpirationDate(`${dd}/${mm}/${yyyy}`);
    }
  };

  const handleDateChange = (text: string) => {
    const digits = text.replace(/\D/g, '');
    let f = digits;
    if (digits.length > 2) f = digits.slice(0, 2) + '/' + digits.slice(2);
    if (digits.length > 4) f = digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4, 8);
    setExpirationDate(f);
  };

  // ── Location ──────────────────────────────────────────────────────────────
  const handleGetLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is needed.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [address] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (address) {
        const readable = [address.name, address.street, address.district, address.city]
          .filter(Boolean).join(', ');
        setMeetingPoint(readable);
      } else {
        setMeetingPoint(`${loc.coords.latitude.toFixed(5)}, ${loc.coords.longitude.toFixed(5)}`);
      }
    } catch {
      Alert.alert('Error', 'Could not fetch location. Please try again.');
    } finally {
      setLocationLoading(false);
    }
  };

  // ── "DD/MM/YYYY" → "YYYY-MM-DD" for backend ──────────────────────────────
  const toISO = (ddmmyyyy: string): string | null => {
    const parts = ddmmyyyy.split('/');
    if (parts.length !== 3) return null;
    const [dd, mm, yyyy] = parts;
    if (dd.length !== 2 || mm.length !== 2 || yyyy.length !== 4) return null;
    const dayNum   = parseInt(dd, 10);
    const monthNum = parseInt(mm, 10);
    const yearNum  = parseInt(yyyy, 10);
    if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) return null;
    if (monthNum < 1 || monthNum > 12) return null;
    if (dayNum < 1 || dayNum > 31) return null;
    return `${yyyy}-${mm}-${dd}`;
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!post?.id) {
      Alert.alert('Error', 'Post ID is missing. Please go back and try again.');
      return;
    }

    if (!category || !quantity || !unit || !expirationDate || !meetingPoint) {
      Alert.alert('Missing fields', 'Please fill in all required fields.');
      return;
    }

    const parsedQty = Number(quantity);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      Alert.alert('Invalid quantity', 'Please enter a valid quantity greater than 0.');
      return;
    }

    const isoDate = toISO(expirationDate);
    if (!isoDate) {
      Alert.alert('Invalid date', 'Please enter the expiration date in DD/MM/YYYY format.');
      return;
    }

    setLoading(true);
    try {
      // ✅ PATCH instead of PUT, correct backend field names
      await api.patch(`/donations/${post.id}/edit/`, {
        category,
        quantity:        parsedQty,
        unit,
        expiry_date:     isoDate,
        urgency:         emergencyColor,   // ✅ backend field name
        pickup_address:  meetingPoint,     // ✅ backend field name
        description,
      });

      Alert.alert('Success', 'Post updated successfully!', [
        { text: 'OK', onPress: handleBack },
      ]);
    } catch (err: any) {
      console.log('Edit error — status:', err.response?.status);
      console.log('Edit error — data:', JSON.stringify(err.response?.data));
      console.log('Edit error — message:', err.message);

      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        'Failed to update post. Please try again.';

      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit My Post</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formCard}>

            {/* Product header */}
            <View style={styles.productRow}>
              {post?.image ? (
                <Image source={{ uri: post.image }} style={styles.productImage} />
              ) : (
                <View style={[styles.productImage, { alignItems: 'center', justifyContent: 'center' }]}>
                  <Ionicons name="fast-food-outline" size={22} color={COLORS.primary} />
                </View>
              )}
              <Text style={styles.productName}>{post?.title || '...'}</Text>
              <TouchableOpacity style={styles.productEditIcon} activeOpacity={0.7}>
                <Ionicons name="pencil" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            {/* Category */}
            <Text style={styles.label}>Category</Text>
            <CategoryDropdown value={category} onChange={setCategory} />

            {/* Quantity + Unit */}
            <Text style={styles.label}>Available Quantity</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                value={quantity}
                onChangeText={setQuantity}
                placeholder="The previous selected Quantity"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
              />
              <UnitDropdown value={unit} onChange={setUnit} />
            </View>

            {/* Expiration Date */}
            <Text style={styles.label}>Expiration date</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                value={expirationDate}
                onChangeText={handleDateChange}
                placeholder="dd/mm/yyyy"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
                maxLength={10}
              />
              <TouchableOpacity style={styles.calendarBtn} activeOpacity={0.7} onPress={() => setShowDatePicker(true)}>
                <Ionicons name="calendar-outline" size={22} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            {/* iOS date modal */}
            {showDatePicker && Platform.OS === 'ios' && (
              <Modal transparent animationType="fade">
                <Pressable style={styles.dateModalOverlay} onPress={() => setShowDatePicker(false)}>
                  <View style={styles.dateModalCard}>
                    <DateTimePicker
                      value={selectedDate}
                      mode="date"
                      display="inline"
                      onChange={handleDatePickerChange}
                      minimumDate={new Date()}
                      themeVariant="light"
                      accentColor={COLORS.primary}
                    />
                    <TouchableOpacity style={styles.dateModalDone} onPress={() => setShowDatePicker(false)}>
                      <Text style={styles.dateModalDoneText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                </Pressable>
              </Modal>
            )}

            {/* Android date picker */}
            {showDatePicker && Platform.OS === 'android' && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={handleDatePickerChange}
                minimumDate={new Date()}
              />
            )}

            {/* Emergency Color */}
            <Text style={styles.label}>Emergency color</Text>
            <EmergencyColorPicker value={emergencyColor} onChange={setEmergencyColor} />

            {/* Meeting Point */}
            <Text style={styles.label}>Meeting point</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                value={meetingPoint}
                onChangeText={setMeetingPoint}
                placeholder="The previous Location"
                placeholderTextColor={COLORS.textMuted}
              />
              <TouchableOpacity style={styles.locationBtn} activeOpacity={0.7} onPress={handleGetLocation} disabled={locationLoading}>
                {locationLoading ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <Ionicons name="locate" size={22} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            </View>

            {/* Description */}
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="The previous description"
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Buttons */}
          <TouchableOpacity
            style={[styles.saveBtn, loading && { opacity: 0.7 }]}
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.saveBtnText}>Save edits</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={handleBack} activeOpacity={0.8}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.background },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.sectionBg, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  formCard: { backgroundColor: COLORS.sectionBg, borderRadius: 20, padding: 18, marginBottom: 16 },
  productRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 14, padding: 12, marginBottom: 18 },
  productImage: { width: 52, height: 52, borderRadius: 10, backgroundColor: COLORS.border },
  productName: { flex: 1, marginLeft: 14, fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  productEditIcon: { padding: 4 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 8, marginTop: 14 },
  input: { backgroundColor: COLORS.white, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: COLORS.textPrimary, borderWidth: 1.5, borderColor: COLORS.border, marginBottom: 4 },
  textArea: { height: 100, paddingTop: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  calendarBtn: { width: 48, height: 48, borderRadius: 12, backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  locationBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  unitTrigger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.white, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 12, borderWidth: 1.5, borderColor: COLORS.border, width: 88, gap: 4, height: 48 },
  unitPlaceholder: { fontSize: 13, color: COLORS.textMuted },
  unitValue: { fontSize: 13, color: COLORS.textPrimary, fontWeight: '600' },
  unitList: { position: 'absolute', top: 52, right: 0, backgroundColor: COLORS.white, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border, width: 88, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 6 },
  unitItem: { paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  unitItemActive: { backgroundColor: COLORS.sectionBg },
  unitItemText: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center' },
  unitItemTextActive: { color: COLORS.primary, fontWeight: '700' },
  dropdownTrigger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.white, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1.5, borderColor: COLORS.border },
  dropdownPlaceholder: { fontSize: 14, color: COLORS.textMuted },
  dropdownValue: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '500' },
  dropdownList: { backgroundColor: COLORS.white, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border, marginTop: 4, overflow: 'hidden' },
  dropdownRow: { flexDirection: 'row' },
  dropdownCell: { flex: 1, paddingVertical: 11, paddingHorizontal: 10, alignItems: 'center', borderWidth: 0.5, borderColor: COLORS.border },
  dropdownCellActive: { backgroundColor: COLORS.sectionBg },
  dropdownCellText: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center' },
  dropdownCellTextActive: { color: COLORS.primary, fontWeight: '700' },
  colorRow: { flexDirection: 'row', gap: 16, marginTop: 4 },
  colorBtn: { width: 56, height: 56, borderRadius: 14, backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  colorBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.inputBg },
  pinHead: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  pinDot: { width: 12, height: 12, borderRadius: 6 },
  pinStick: { width: 3, height: 8, borderRadius: 2 },
  dateModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  dateModalCard: { backgroundColor: COLORS.white, borderRadius: 20, padding: 16, width: '100%', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 },
  dateModalDone: { marginTop: 12, backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 40 },
  dateModalDoneText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
  saveBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginBottom: 12 },
  saveBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  cancelBtn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.white },
  cancelBtnText: { color: COLORS.textSecondary, fontSize: 15, fontWeight: '600' },
});