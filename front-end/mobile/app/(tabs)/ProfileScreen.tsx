import React, { useState, useCallback, useEffect } from 'react';
import {
<<<<<<< HEAD
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Pressable, SafeAreaView, Modal, TextInput,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
=======
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Pressable,
  SafeAreaView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
>>>>>>> ad0502df49bbf7d726e2eb470be7d0d46777fb75
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { BottomNavBar } from '../../components/ButtomNavBar';
import api from '../../constants/axios';

const COLORS = {
<<<<<<< HEAD
  primary: '#4A6741', primaryMedium: '#7A9B71',
  background: '#E8EDE5', white: '#FFFFFF',
  textPrimary: '#1A1A1A', textSecondary: '#555555',
  textMuted: '#888888', cardBg: '#FFFFFF',
  sectionBg: '#DDE6D8', border: '#D5DED0',
  red: '#D94F4F', orange: '#E07B39',
};

type MainTab    = 'posts' | 'reservations';
type PostFilter = 'available' | 'reserved' | 'completed' | 'expired';
type ResFilter  = 'pending' | 'confirmed' | 'rejected';

// ─── Confirm Modal ────────────────────────────────────────────────────────────
const ConfirmModal = ({
  visible, message, confirmLabel = 'Delete', confirmColor = COLORS.red, onConfirm, onCancel,
}: {
  visible: boolean; message: string; confirmLabel?: string;
  confirmColor?: string; onConfirm: () => void; onCancel: () => void;
}) => (
=======
  primary: '#4A6741',
  primaryMedium: '#7A9B71',
  background: '#E8EDE5',
  white: '#FFFFFF',
  textPrimary: '#1A1A1A',
  textSecondary: '#555555',
  textMuted: '#888888',
  cardBg: '#FFFFFF',
  sectionBg: '#DDE6D8',
  border: '#D5DED0',
  red: '#D94F4F',
  orange: '#E07B39',
};

type MainTab = 'posts' | 'reservations';
type PostFilter = 'active' | 'expired' | 'donated';
type ResTab = 'incoming' | 'my_requests';
type ResFilter = 'pending' | 'confirmed' | 'rejected';

// ── Confirm Modal ──
const ConfirmModal = ({ visible, message, confirmLabel = 'Delete', confirmColor = COLORS.red, onConfirm, onCancel }: any) => (
>>>>>>> ad0502df49bbf7d726e2eb470be7d0d46777fb75
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
    <Pressable style={cStyles.backdrop} onPress={onCancel} />
    <View style={cStyles.centerer}>
      <View style={cStyles.box}>
        <Text style={cStyles.message}>{message}</Text>
        <View style={cStyles.buttons}>
          <TouchableOpacity style={cStyles.cancelBtn} onPress={onCancel}>
            <Text style={cStyles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[cStyles.confirmBtn, { backgroundColor: confirmColor }]} onPress={onConfirm}>
            <Text style={cStyles.confirmText}>{confirmLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const cStyles = StyleSheet.create({
<<<<<<< HEAD
  backdrop:    { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  centerer:    { flex: 1, justifyContent: 'center', alignItems: 'center' },
  box:         { backgroundColor: COLORS.white, borderRadius: 18, padding: 24, width: '78%', elevation: 10 },
  message:     { fontSize: 15, color: COLORS.textPrimary, textAlign: 'center', marginBottom: 20, lineHeight: 22 },
  buttons:     { flexDirection: 'row', gap: 12 },
  cancelBtn:   { flex: 1, paddingVertical: 11, borderRadius: 999, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center' },
  cancelText:  { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  confirmBtn:  { flex: 1, paddingVertical: 11, borderRadius: 999, alignItems: 'center' },
  confirmText: { fontSize: 14, fontWeight: '700', color: COLORS.white },
});

// ─── Edit Username Modal ──────────────────────────────────────────────────────
const EditUsernameModal = ({
  visible, currentUsername, onSave, onClose,
}: {
  visible: boolean; currentUsername: string;
  onSave: (name: string) => void; onClose: () => void;
}) => {
  const [value, setValue] = useState(currentUsername);
  useEffect(() => { if (visible) setValue(currentUsername); }, [visible, currentUsername]);
=======
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  centerer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  box: { backgroundColor: COLORS.white, borderRadius: 18, padding: 24, width: '78%', elevation: 10 },
  message: { fontSize: 15, color: COLORS.textPrimary, textAlign: 'center', marginBottom: 20, lineHeight: 22 },
  buttons: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, paddingVertical: 11, borderRadius: 999, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center' },
  cancelText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  confirmBtn: { flex: 1, paddingVertical: 11, borderRadius: 999, alignItems: 'center' },
  confirmText: { fontSize: 14, fontWeight: '700', color: COLORS.white },
});

// ── Edit Username Modal ──
const EditUsernameModal = ({ visible, currentUsername, onSave, onClose }: any) => {
  const [value, setValue] = useState(currentUsername);
  useEffect(() => { if (visible) setValue(currentUsername); }, [visible, currentUsername]);

>>>>>>> ad0502df49bbf7d726e2eb470be7d0d46777fb75
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Pressable style={cStyles.backdrop} onPress={onClose} />
        <View style={eStyles.box}>
          <Text style={eStyles.title}>Edit Username</Text>
<<<<<<< HEAD
          <TextInput style={eStyles.input} value={value} onChangeText={setValue} placeholder="Enter new username" placeholderTextColor={COLORS.textMuted} autoFocus maxLength={30} />
          <View style={cStyles.buttons}>
            <TouchableOpacity style={cStyles.cancelBtn} onPress={onClose}><Text style={cStyles.cancelText}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[cStyles.confirmBtn, { backgroundColor: COLORS.primary }]} onPress={() => { if (value.trim()) { onSave(value.trim()); onClose(); } }}>
=======
          <TextInput
            style={eStyles.input}
            value={value}
            onChangeText={setValue}
            placeholder="Enter new username"
            placeholderTextColor={COLORS.textMuted}
            autoFocus
            maxLength={30}
          />
          <View style={cStyles.buttons}>
            <TouchableOpacity style={cStyles.cancelBtn} onPress={onClose}>
              <Text style={cStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[cStyles.confirmBtn, { backgroundColor: COLORS.primary }]}
              onPress={() => { if (value.trim()) { onSave(value.trim()); onClose(); } }}
            >
>>>>>>> ad0502df49bbf7d726e2eb470be7d0d46777fb75
              <Text style={cStyles.confirmText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const eStyles = StyleSheet.create({
  box: { backgroundColor: COLORS.white, borderRadius: 20, padding: 24, width: '82%', elevation: 10 },
  title: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: COLORS.textPrimary, marginBottom: 20, backgroundColor: '#F7FAF5' },
});

<<<<<<< HEAD
// ─── View Photo Modal ─────────────────────────────────────────────────────────
const ViewPhotoModal = ({ visible, imageUri, onClose }: { visible: boolean; imageUri: string | null; onClose: () => void; }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <Pressable style={vStyles.backdrop} onPress={onClose}>
      <Image source={imageUri ? { uri: imageUri } : require('../../assets/images/me.png')} style={vStyles.fullImage} resizeMode="contain" />
    </Pressable>
  </Modal>
);

const vStyles = StyleSheet.create({
  backdrop:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  fullImage: { width: 300, height: 300, borderRadius: 16 },
});

// ─── PostItem ─────────────────────────────────────────────────────────────────
const PostItem = ({ item, onDelete, onEdit }: { item: any; onDelete: () => void; onEdit: () => void; }) => {
  const getStatusColor = () => {
    switch (item.status) {
      case 'available': return COLORS.primary;
      case 'reserved':  return COLORS.orange;
      case 'completed': return COLORS.primary;
      case 'expired':   return COLORS.red;
      default:          return COLORS.textMuted;
    }
  };
  const getStatusLabel = () => {
    switch (item.status) {
      case 'available': return `Expires: ${item.expiry_date}`;
      case 'reserved':  return 'Reserved';
      case 'completed': return 'Donated ✓';
      case 'expired':   return 'Expired';
      default:          return item.status;
    }
  };
  const canEdit = item.status === 'available';
  return (
    <View style={pStyles.card}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={pStyles.image} />
      ) : (
        <View style={[pStyles.image, pStyles.imageFallback]}>
          <Ionicons name="fast-food-outline" size={22} color={COLORS.primary} />
        </View>
      )}
      <View style={pStyles.info}>
        <Text style={pStyles.title}>{item.title}</Text>
        <Text style={pStyles.subtitle}>{item.available_quantity}/{item.quantity} {item.unit} • {item.category}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
          {item.status === 'completed' && <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} />}
          <Text style={[pStyles.status, { color: getStatusColor() }]}>{getStatusLabel()}</Text>
        </View>
      </View>
      <View style={pStyles.actions}>
        {canEdit && (
          <TouchableOpacity style={pStyles.actionBtn} onPress={onEdit} activeOpacity={0.7}>
            <Ionicons name="create-outline" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        )}
        {item.status !== 'completed' && (
          <TouchableOpacity style={pStyles.actionBtn} onPress={onDelete} activeOpacity={0.7}>
            <Ionicons name="trash-outline" size={22} color={COLORS.red} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const pStyles = StyleSheet.create({
  card:          { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBg, borderRadius: 14, padding: 10, marginBottom: 10 },
  image:         { width: 56, height: 56, borderRadius: 10, backgroundColor: COLORS.border },
  imageFallback: { alignItems: 'center', justifyContent: 'center' },
  info:          { flex: 1, marginLeft: 12 },
  title:         { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  subtitle:      { fontSize: 12, color: COLORS.textMuted, marginTop: 1 },
  status:        { fontSize: 12, fontWeight: '600', marginTop: 3 },
  actions:       { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 8 },
  actionBtn:     { padding: 4 },
});

// ─── ReservationItem ──────────────────────────────────────────────────────────
const ReservationItem = ({ item, onAction }: { item: any; onAction: (id: number, action: 'confirm' | 'reject') => void; }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const isPending   = item.status === 'pending';
  const isConfirmed = item.status === 'confirmed';
  const isRejected  = item.status === 'rejected';
  return (
    <View style={[rStyles.card, isConfirmed && rStyles.cardConfirmed, isRejected && rStyles.cardRejected]}>
      <View style={rStyles.avatar}>
        <Ionicons name="person" size={20} color={COLORS.primaryMedium} />
      </View>
      <View style={rStyles.textContainer}>
        <Text style={rStyles.notifText}>
          <Text style={rStyles.bold}>{item.beneficiary_username || 'User'}</Text> wants to reserve
          <Text style={rStyles.productName}> "{item.donation_title || 'Donation'}"</Text>
        </Text>
        <Text style={rStyles.quantity}>Qty: {item.quantity_requested}</Text>
      </View>
      {isPending ? (
        <View style={{ position: 'relative' }}>
          <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)} style={{ padding: 6 }}>
            <Ionicons name="ellipsis-vertical" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
          {menuOpen && (
            <>
              <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setMenuOpen(false)} />
              <View style={rStyles.menu}>
                <TouchableOpacity style={rStyles.menuItem} onPress={() => { setMenuOpen(false); onAction(item.id, 'confirm'); }}>
                  <Text style={rStyles.menuConfirm}>Confirm</Text>
                </TouchableOpacity>
                <View style={{ height: 1, backgroundColor: COLORS.border }} />
                <TouchableOpacity style={rStyles.menuItem} onPress={() => { setMenuOpen(false); onAction(item.id, 'reject'); }}>
                  <Text style={rStyles.menuReject}>Reject</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      ) : isConfirmed ? (
        <Text style={rStyles.confirmedBadge}>Confirmed ✓</Text>
      ) : (
        <Text style={rStyles.rejectedBadge}>Rejected</Text>
      )}
    </View>
  );
};

const rStyles = StyleSheet.create({
  card:           { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBg, borderRadius: 14, padding: 12, marginBottom: 10, borderWidth: 1.5, borderColor: COLORS.border },
  cardConfirmed:  { borderColor: COLORS.primary },
  cardRejected:   { borderColor: COLORS.red },
  avatar:         { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F5C6C6', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  textContainer:  { flex: 1 },
  notifText:      { fontSize: 13, color: COLORS.textPrimary, lineHeight: 18 },
  bold:           { fontWeight: '700' },
  productName:    { color: COLORS.primary, fontWeight: '600' },
  quantity:       { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  confirmedBadge: { fontSize: 12, color: COLORS.primary, fontWeight: '700' },
  rejectedBadge:  { fontSize: 12, color: COLORS.red, fontWeight: '600' },
  menu:           { position: 'absolute', right: 0, top: 40, backgroundColor: COLORS.white, borderRadius: 10, elevation: 8, zIndex: 999, minWidth: 110, borderWidth: 1, borderColor: COLORS.border },
  menuItem:       { paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center' },
  menuConfirm:    { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  menuReject:     { fontSize: 14, color: COLORS.red, fontWeight: '600' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const router = useRouter();
  const [username, setUsername]           = useState('');
  const [score, setScore]                 = useState<number | null>(null); // ← dynamic score from backend
  const [profileImage, setProfileImage]   = useState<string | null>(null);
  const [editModalVisible, setEditModal]  = useState(false);
  const [menuOpen, setMenuOpen]           = useState(false);
  const [photoMenuOpen, setPhotoMenuOpen]       = useState(false);
  const [viewPhotoVisible, setViewPhotoVisible] = useState(false);
  const [mainTab, setMainTab]           = useState<MainTab>('posts');
  const [postFilter, setPostFilter]     = useState<PostFilter>('available');
  const [resFilter, setResFilter]       = useState<ResFilter>('pending');
  const [donations, setDonations]       = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
=======
// ── PostItem ──
const PostItem = ({ item, onDelete, onEdit }: any) => (
  <View style={{ backgroundColor: COLORS.white, borderRadius: 14, padding: 16, marginBottom: 12 }}>
    <Text style={{ fontWeight: '700', fontSize: 16 }}>{item.title}</Text>
    <Text style={{ color: COLORS.textMuted, marginTop: 4 }}>{item.category} • {item.quantity} {item.unit}</Text>
    <Text style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 2 }}>Expires: {item.expiry_date}</Text>
    <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
      <TouchableOpacity onPress={onEdit}>
        <Ionicons name="create-outline" size={24} color={COLORS.primary} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onDelete}>
        <Ionicons name="trash-outline" size={24} color={COLORS.red} />
      </TouchableOpacity>
    </View>
  </View>
);

// ── ReservationItem ──
const ReservationItem = ({ item, isIncoming, onAction }: any) => (
  <View style={{ backgroundColor: COLORS.white, borderRadius: 14, padding: 16, marginBottom: 12 }}>
    <Text style={{ fontWeight: '700' }}>{item.donation_title || 'Reservation'}</Text>
    <Text style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 4 }}>
      Qty: {item.quantity_requested} • {isIncoming ? `By: ${item.beneficiary_username || 'User'}` : `Donor: ${item.donation?.title || ''}`}
    </Text>
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 }}>
      <View style={{
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
        backgroundColor: item.status === 'confirmed' ? '#e8f5e9' : item.status === 'rejected' ? '#fce4e4' : '#fff9e6'
      }}>
        <Text style={{
          fontSize: 12, fontWeight: '600',
          color: item.status === 'confirmed' ? COLORS.primary : item.status === 'rejected' ? COLORS.red : COLORS.orange
        }}>
          {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Unknown'}
        </Text>
      </View>
    </View>
    {isIncoming && item.status === 'pending' && (
      <View style={{ flexDirection: 'row', gap: 16, marginTop: 12 }}>
        <TouchableOpacity
          style={{ backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 }}
          onPress={() => onAction(item.id, 'confirm')}
        >
          <Text style={{ color: COLORS.white, fontWeight: '600', fontSize: 13 }}>Confirm</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ borderWidth: 1.5, borderColor: COLORS.red, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 }}
          onPress={() => onAction(item.id, 'reject')}
        >
          <Text style={{ color: COLORS.red, fontWeight: '600', fontSize: 13 }}>Reject</Text>
        </TouchableOpacity>
      </View>
    )}
  </View>
);

// ── Main Profile Screen ──
export default function ProfileScreen() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [reputationScore, setReputationScore] = useState(0);
  const [editModalVisible, setEditModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mainTab, setMainTab] = useState<MainTab>('posts');
  const [postFilter, setPostFilter] = useState<PostFilter>('active');
  const [resTab, setResTab] = useState<ResTab>('incoming');
  const [resFilter, setResFilter] = useState<ResFilter>('pending');
  const [loading, setLoading] = useState(true);

  const [activeDonations, setActiveDonations] = useState<any[]>([]);
  const [expiredDonations, setExpiredDonations] = useState<any[]>([]);
  const [donatedDonations, setDonatedDonations] = useState<any[]>([]);

  const [incomingPending, setIncomingPending] = useState<any[]>([]);
  const [incomingConfirmed, setIncomingConfirmed] = useState<any[]>([]);
  const [incomingRejected, setIncomingRejected] = useState<any[]>([]);
  const [myPending, setMyPending] = useState<any[]>([]);
  const [myConfirmed, setMyConfirmed] = useState<any[]>([]);
  const [myRejected, setMyRejected] = useState<any[]>([]);

>>>>>>> ad0502df49bbf7d726e2eb470be7d0d46777fb75
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMsg, setConfirmMsg]         = useState('');
  const [confirmAct, setConfirmAct]         = useState<() => void>(() => {});
  const [confirmLabel, setConfirmLabel]     = useState('Delete');
  const [confirmColor, setConfirmColor]     = useState(COLORS.red);

  const showConfirm = (msg: string, action: () => void, label = 'Delete', color = COLORS.red) => {
    setConfirmMsg(msg); setConfirmAct(() => action);
    setConfirmLabel(label); setConfirmColor(color); setConfirmVisible(true);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
<<<<<<< HEAD
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUsername(user.username || 'Username');
      }

      // Fetch donations, reservations, and profile (for score) in parallel
      const [donRes, resRes, profileRes] = await Promise.all([
        api.get('/donations/my-donations/'),
        api.get('/donations/reservations/received/'),
        api.get('/users/me/'),  // ← your endpoint that returns the user's score
      ]);

      setDonations(donRes.data || []);
      setReservations(resRes.data || []);

      // Supports multiple common backend field names — adjust if needed
      const p = profileRes.data;
      setScore(p?.score ?? p?.rating ?? p?.average_rating ?? null);

    } catch (err) {
      console.log('Error loading profile data:', err);
=======
      const [profileRes, donRes, resRes] = await Promise.all([
        api.get('/users/profile/'),
        api.get('/donations/my-donations/'),
        api.get('/donations/reservations/my-reservations/'),
      ]);

      const user = profileRes.data;
      setUsername(user.username || 'Username');
      setAvatar(user.avatar || null);
      setReputationScore(user.reputation_score || 0);

      const donData = donRes.data || {};
      setActiveDonations(Array.isArray(donData.active) ? donData.active : []);
      setExpiredDonations(Array.isArray(donData.expired) ? donData.expired : []);
      setDonatedDonations(Array.isArray(donData.donated) ? donData.donated : []);

      const resData = resRes.data || {};
      setIncomingPending(Array.isArray(resData.incoming?.pending) ? resData.incoming.pending : []);
      setIncomingConfirmed(Array.isArray(resData.incoming?.confirmed) ? resData.incoming.confirmed : []);
      setIncomingRejected(Array.isArray(resData.incoming?.rejected) ? resData.incoming.rejected : []);
      setMyPending(Array.isArray(resData.my_requests?.pending) ? resData.my_requests.pending : []);
      setMyConfirmed(Array.isArray(resData.my_requests?.confirmed) ? resData.my_requests.confirmed : []);
      setMyRejected(Array.isArray(resData.my_requests?.rejected) ? resData.my_requests.rejected : []);

    } catch (err: any) {
      console.error('Profile load error:', err);
      setActiveDonations([]); setExpiredDonations([]); setDonatedDonations([]);
      setIncomingPending([]); setIncomingConfirmed([]); setIncomingRejected([]);
      setMyPending([]); setMyConfirmed([]); setMyRejected([]);
>>>>>>> ad0502df49bbf7d726e2eb470be7d0d46777fb75
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

<<<<<<< HEAD
  const handleViewPhoto = () => { setPhotoMenuOpen(false); setViewPhotoVisible(true); };

  const handleChangePhoto = async () => {
    setPhotoMenuOpen(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission Denied', 'We need access to your photos.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled && result.assets[0]) setProfileImage(result.assets[0].uri);
  };

  const handleDeletePhoto = () => {
    setPhotoMenuOpen(false);
    showConfirm('Delete your profile photo?', () => setProfileImage(null), 'Delete', COLORS.red);
=======
  const getCurrentDonations = () => {
    if (postFilter === 'active') return activeDonations;
    if (postFilter === 'expired') return expiredDonations;
    return donatedDonations;
  };

  const getCurrentReservations = () => {
    if (resTab === 'incoming') {
      if (resFilter === 'pending') return incomingPending;
      if (resFilter === 'confirmed') return incomingConfirmed;
      return incomingRejected;
    } else {
      if (resFilter === 'pending') return myPending;
      if (resFilter === 'confirmed') return myConfirmed;
      return myRejected;
    }
  };

  const totalDonations = activeDonations.length + expiredDonations.length + donatedDonations.length;
  const totalReservations = incomingPending.length + incomingConfirmed.length + incomingRejected.length +
                            myPending.length + myConfirmed.length + myRejected.length;

  const pickAndUploadAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permission Denied', 'We need access to photos.');

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const uri = result.assets[0].uri;
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'avatar.jpg';
    const type = `image/${filename.split('.').pop() || 'jpeg'}`;
    formData.append('avatar', { uri, name: filename, type } as any);

    try {
      const response = await api.put('/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        transformRequest: (data) => data,
      });
      setAvatar(response.data.avatar || uri);
      Alert.alert('Success', 'Profile picture updated!');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.avatar?.[0] || 'Failed to upload avatar');
    }
  };

  const handleUpdateUsername = async (newUsername: string) => {
    try {
      const response = await api.put('/profile/', { username: newUsername });
      setUsername(response.data.username);
      Alert.alert('Success', 'Username updated!');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.username?.[0] || 'Failed to update username');
    }
>>>>>>> ad0502df49bbf7d726e2eb470be7d0d46777fb75
  };

  const handleReservationAction = async (id: number, action: 'confirm' | 'reject') => {
    try {
<<<<<<< HEAD
      const endpoint = action === 'confirm' ? `/donations/reservations/${id}/confirm/` : `/donations/reservations/${id}/reject/`;
      await api.post(endpoint);
      setReservations((prev) => prev.map((r) => r.id === id ? { ...r, status: action === 'confirm' ? 'confirmed' : 'rejected' } : r));
      if (action === 'confirm') {
        const updatedRes = reservations.find(r => r.id === id);
        setDonations((prev) => prev.map((d) => {
          if (d.id !== updatedRes?.donation) return d;
          const newAvailable = d.available_quantity - updatedRes.quantity_requested;
          return { ...d, available_quantity: newAvailable, status: newAvailable <= 0 ? 'completed' : 'available' };
        }));
      }
      Alert.alert('Success', `Reservation ${action}ed successfully!`);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to update reservation');
=======
      await api.post(`/donations/reservations/${id}/${action}/`);
      loadData();
      Alert.alert('Success', `Reservation ${action}ed!`);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed');
>>>>>>> ad0502df49bbf7d726e2eb470be7d0d46777fb75
    }
  };

  const handleDeletePost = (id: number) => {
    showConfirm('Delete this donation? This cannot be undone.', async () => {
      try {
        await api.delete(`/donations/${id}/`);
<<<<<<< HEAD
        setDonations((prev) => prev.filter((d) => d.id !== id));
      } catch (err: any) {
        Alert.alert('Error', err?.response?.data?.error || 'Failed to delete donation');
=======
        loadData();
      } catch (err: any) {
        Alert.alert('Error', err.response?.data?.error || 'Failed to delete');
>>>>>>> ad0502df49bbf7d726e2eb470be7d0d46777fb75
      }
    });
  };

  const handleEditPost = (item: any) => {
<<<<<<< HEAD
    router.push({ pathname: '/(Screens)/EditPostScreen', params: { post: JSON.stringify(item) } });
=======
    router.push({ pathname: '/(Screens)/EditPostScreen' as any, params: { post: JSON.stringify(item) } });
>>>>>>> ad0502df49bbf7d726e2eb470be7d0d46777fb75
  };

  const handleLogout = () => {
    setMenuOpen(false);
    showConfirm('Are you sure you want to logout?', async () => {
      await AsyncStorage.multiRemove(['access', 'refresh', 'user']);
      router.replace('/auth/login');
    }, 'Logout', COLORS.red);
  };

<<<<<<< HEAD
  const filteredDonations    = donations.filter((d) => d.status === postFilter);
  const filteredReservations = reservations.filter((r) =>
    resFilter === 'rejected' ? r.status === 'rejected' : r.status === resFilter
  );

  // Shows real score from backend, or "— ⭐" while loading / if not set yet
  const scoreDisplay = score !== null ? `${Number(score).toFixed(1)} ⭐` : '— ⭐';

=======
>>>>>>> ad0502df49bbf7d726e2eb470be7d0d46777fb75
  return (
    <SafeAreaView style={styles.safeArea}>
      <ConfirmModal
        visible={confirmVisible} message={confirmMsg}
        confirmLabel={confirmLabel} confirmColor={confirmColor}
        onConfirm={() => { confirmAct(); setConfirmVisible(false); }}
        onCancel={() => setConfirmVisible(false)}
      />
<<<<<<< HEAD
      <EditUsernameModal visible={editModalVisible} currentUsername={username} onSave={setUsername} onClose={() => setEditModal(false)} />
      <ViewPhotoModal visible={viewPhotoVisible} imageUri={profileImage} onClose={() => setViewPhotoVisible(false)} />
=======

      <EditUsernameModal
        visible={editModalVisible}
        currentUsername={username}
        onSave={handleUpdateUsername}
        onClose={() => setEditModal(false)}
      />
>>>>>>> ad0502df49bbf7d726e2eb470be7d0d46777fb75

      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* Dropdown Menu */}
        {menuOpen && (
          <>
            <Pressable style={styles.menuBackdrop} onPress={() => setMenuOpen(false)} />
            <View style={styles.dropdown}>
              <TouchableOpacity style={styles.dropdownItem} onPress={() => { setMenuOpen(false); router.push('/(Screens)/SettingsScreen' as any); }}>
                <Text style={styles.dropdownText}>Settings</Text>
              </TouchableOpacity>
              <View style={styles.dropdownDivider} />
              <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
                <Text style={[styles.dropdownText, { color: COLORS.red }]}>Logout</Text>
                <Ionicons name="log-out-outline" size={16} color={COLORS.red} style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            </View>
          </>
        )}

<<<<<<< HEAD
        {/* ── Profile Card ── */}
=======
        {/* Profile Card */}
>>>>>>> ad0502df49bbf7d726e2eb470be7d0d46777fb75
        <View style={styles.profileCard}>

          {/* ⋮ top-right menu */}
          <TouchableOpacity style={styles.menuBtn} onPress={() => setMenuOpen(!menuOpen)}>
            <Ionicons name="ellipsis-vertical" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
<<<<<<< HEAD
          {menuOpen && (
            <>
              <Pressable style={styles.menuBackdrop} onPress={() => setMenuOpen(false)} />
              <View style={styles.dropdown}>
                <TouchableOpacity style={styles.dropdownItem} onPress={() => { setMenuOpen(false); router.push('/(Screens)/SettingsScreen' as any); }}>
                  <Text style={styles.dropdownText}>Settings</Text>
                </TouchableOpacity>
                <View style={styles.dropdownDivider} />
                <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
                  <Text style={[styles.dropdownText, { color: COLORS.red }]}>Logout</Text>
                  <Ionicons name="log-out-outline" size={16} color={COLORS.red} style={{ marginLeft: 6 }} />
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* ── Avatar + photo menu ── */}
          <TouchableOpacity onPress={() => setPhotoMenuOpen(!photoMenuOpen)} style={styles.avatarWrapper} activeOpacity={0.85}>
            <View style={styles.avatarCircle}>
              {profileImage
                ? <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                : <Image source={require('../../assets/images/me.png')} style={styles.avatarImage} />
              }
=======

          <TouchableOpacity onPress={pickAndUploadAvatar} style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatarImage} />
              ) : (
                <Image source={require('../../assets/images/me.png')} style={styles.avatarImage} />
              )}
>>>>>>> ad0502df49bbf7d726e2eb470be7d0d46777fb75
            </View>
            <View style={styles.editPhotoBadge}>
              <Ionicons name="camera" size={14} color="#fff" />
            </View>
          </TouchableOpacity>

          {photoMenuOpen && (
            <>
              <Pressable style={{ position: 'absolute', top: -300, left: -300, right: -300, bottom: -300, zIndex: 15 }} onPress={() => setPhotoMenuOpen(false)} />
              <View style={styles.photoMenu}>
                <TouchableOpacity style={styles.photoMenuItem} onPress={handleViewPhoto} activeOpacity={0.7}>
                  <Text style={styles.photoMenuText}>View photo</Text>
                </TouchableOpacity>
                <View style={styles.photoMenuDivider} />
                <TouchableOpacity style={styles.photoMenuItem} onPress={handleChangePhoto} activeOpacity={0.7}>
                  <Text style={styles.photoMenuText}>Change photo</Text>
                </TouchableOpacity>
                <View style={styles.photoMenuDivider} />
                <TouchableOpacity style={styles.photoMenuItem} onPress={handleDeletePhoto} activeOpacity={0.7}>
                  <Text style={[styles.photoMenuText, { color: COLORS.red }]}>Delete photo</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          <View style={styles.nameRow}>
            <Text style={styles.username}>{username}</Text>
            <TouchableOpacity style={{ marginLeft: 6 }} onPress={() => setEditModal(true)}>
              <Ionicons name="pencil" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

<<<<<<< HEAD
          {/* ── Stats: real donation count + dynamic score from backend ── */}
=======
          <View style={{ backgroundColor: '#e8f3e8', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 12 }}>
            <Text style={{ color: COLORS.primary, fontWeight: '600', fontSize: 13 }}>⭐ {reputationScore} pts</Text>
          </View>

>>>>>>> ad0502df49bbf7d726e2eb470be7d0d46777fb75
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{totalDonations}</Text>
              <Text style={styles.statLabel}>Donations</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
<<<<<<< HEAD
              <Text style={styles.statValue}>{scoreDisplay}</Text>
              <Text style={styles.statLabel}>Score</Text>
=======
              <Text style={styles.statValue}>{totalReservations}</Text>
              <Text style={styles.statLabel}>Reservations</Text>
>>>>>>> ad0502df49bbf7d726e2eb470be7d0d46777fb75
            </View>
          </View>
        </View>

<<<<<<< HEAD
        {/* ── Content Card ── */}
=======
        {/* Content */}
>>>>>>> ad0502df49bbf7d726e2eb470be7d0d46777fb75
        <View style={styles.contentCard}>
          <View style={styles.mainTabs}>
            {(['posts', 'reservations'] as MainTab[]).map((tab) => (
              <TouchableOpacity key={tab} style={[styles.mainTab, mainTab === tab && styles.mainTabActive]} onPress={() => setMainTab(tab)}>
                <Text style={[styles.mainTabText, mainTab === tab && styles.mainTabTextActive]}>
                  {tab === 'posts' ? 'My Posts' : 'Reservations'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ paddingVertical: 40 }} />
          ) : mainTab === 'posts' ? (
            <>
<<<<<<< HEAD
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {(['available', 'reserved', 'completed', 'expired'] as PostFilter[]).map((f) => (
                    <TouchableOpacity key={f} style={[styles.filterChip, postFilter === f && styles.filterChipActive]} onPress={() => setPostFilter(f)}>
                      <Text style={[styles.filterChipText, postFilter === f && styles.filterChipTextActive]}>
                        {f.charAt(0).toUpperCase() + f.slice(1)}
=======
              {/* Centered Filter Chips */}
              <View style={styles.filterContainer}>
                <View style={styles.filterRow}>
                  {[
                    { key: 'active', label: 'Active' },
                    { key: 'expired', label: 'Expired' },
                    { key: 'donated', label: 'Donated' },
                  ].map(({ key, label }) => (
                    <TouchableOpacity
                      key={key}
                      style={[styles.filterChip, postFilter === key && styles.filterChipActive]}
                      onPress={() => setPostFilter(key as PostFilter)}
                    >
                      <Text style={[styles.filterChipText, postFilter === key && styles.filterChipTextActive]}>
                        {label}
>>>>>>> ad0502df49bbf7d726e2eb470be7d0d46777fb75
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
<<<<<<< HEAD
              </ScrollView>
              {filteredDonations.length === 0 ? (
                <Text style={styles.emptyText}>No {postFilter} donations found</Text>
              ) : (
                filteredDonations.map((item) => (
=======
              </View>

              {getCurrentDonations().length === 0 ? (
                <Text style={styles.emptyText}>No {postFilter} donations found</Text>
              ) : (
                getCurrentDonations().map((item: any) => (
>>>>>>> ad0502df49bbf7d726e2eb470be7d0d46777fb75
                  <PostItem key={item.id} item={item} onDelete={() => handleDeletePost(item.id)} onEdit={() => handleEditPost(item)} />
                ))
              )}
            </>
          ) : (
            <>
<<<<<<< HEAD
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
                {(['pending', 'confirmed', 'rejected'] as ResFilter[]).map((f) => (
                  <TouchableOpacity key={f} style={[styles.filterChip, resFilter === f && styles.filterChipActive]} onPress={() => setResFilter(f)}>
                    <Text style={[styles.filterChipText, resFilter === f && styles.filterChipTextActive]}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {filteredReservations.length === 0 ? (
                <Text style={styles.emptyText}>No {resFilter} reservations found</Text>
              ) : (
                filteredReservations.map((item) => (
                  <ReservationItem key={item.id} item={item} onAction={handleReservationAction} />
=======
              {/* Reservation Sub-tabs */}
              <View style={styles.filterContainer}>
                <View style={styles.filterRow}>
                  {[
                    { key: 'incoming', label: 'Incoming' },
                    { key: 'my_requests', label: 'My Requests' },
                  ].map(({ key, label }) => (
                    <TouchableOpacity
                      key={key}
                      style={[styles.mainTab, resTab === key && styles.mainTabActive]}
                      onPress={() => setResTab(key as ResTab)}
                    >
                      <Text style={[styles.mainTabText, resTab === key && styles.mainTabTextActive]}>{label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Status Filter - Centered */}
              <View style={styles.filterContainer}>
                <View style={styles.filterRow}>
                  {(['pending', 'confirmed', 'rejected'] as ResFilter[]).map((f) => (
                    <TouchableOpacity
                      key={f}
                      style={[styles.filterChip, resFilter === f && styles.filterChipActive]}
                      onPress={() => setResFilter(f)}
                    >
                      <Text style={[styles.filterChipText, resFilter === f && styles.filterChipTextActive]}>
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {getCurrentReservations().length === 0 ? (
                <Text style={styles.emptyText}>No {resFilter} reservations found</Text>
              ) : (
                getCurrentReservations().map((item: any) => (
                  <ReservationItem
                    key={item.id}
                    item={item}
                    isIncoming={resTab === 'incoming'}
                    onAction={handleReservationAction}
                  />
>>>>>>> ad0502df49bbf7d726e2eb470be7d0d46777fb75
                ))
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Fixed Bottom Navigation Bar */}
      <BottomNavBar />
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
<<<<<<< HEAD
  safeArea:      { flex: 1, backgroundColor: COLORS.background },
  scroll:        { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },

  profileCard:     { backgroundColor: COLORS.sectionBg, borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: 16, position: 'relative' },
  menuBtn:         { position: 'absolute', top: 14, right: 14, zIndex: 10 },
  menuBackdrop:    { position: 'absolute', top: -300, left: -300, right: -300, bottom: -300, zIndex: 15 },
  dropdown:        { position: 'absolute', top: 40, right: 14, backgroundColor: COLORS.white, borderRadius: 12, minWidth: 140, zIndex: 20, elevation: 6, overflow: 'hidden' },
  dropdownItem:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
  dropdownDivider: { height: 1, backgroundColor: COLORS.border },
  dropdownText:    { fontSize: 15, color: COLORS.textPrimary, fontWeight: '500' },

  avatarWrapper:   { marginTop: 8, marginBottom: 12, position: 'relative' },
  avatarCircle:    { width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderColor: COLORS.primary, overflow: 'hidden', backgroundColor: '#B8D4E8' },
  avatarImage:     { width: '100%', height: '100%' },
  editPhotoBadge:  { position: 'absolute', bottom: 4, right: 4, backgroundColor: COLORS.primary, borderRadius: 12, padding: 4 },

  photoMenu:        { position: 'absolute', top: 145, right: 30, backgroundColor: COLORS.white, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border, minWidth: 160, zIndex: 30, elevation: 10, overflow: 'hidden' },
  photoMenuItem:    { paddingVertical: 13, paddingHorizontal: 18, alignItems: 'center' },
  photoMenuDivider: { height: 1, backgroundColor: COLORS.border },
  photoMenuText:    { fontSize: 15, color: COLORS.textPrimary, fontWeight: '500' },

  nameRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  username: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },

  statsRow:    { flexDirection: 'row', borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: 12, overflow: 'hidden', width: '80%' },
  statBox:     { flex: 1, alignItems: 'center', paddingVertical: 10 },
  statDivider: { width: 1.5, backgroundColor: COLORS.primary },
  statValue:   { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  statLabel:   { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },

  contentCard:          { backgroundColor: COLORS.sectionBg, borderRadius: 20, padding: 16 },
  mainTabs:             { flexDirection: 'row', marginBottom: 14, gap: 10 },
  mainTab:              { flex: 1, paddingVertical: 9, borderRadius: 999, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center' },
  mainTabActive:        { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  mainTabText:          { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  mainTabTextActive:    { color: COLORS.white, fontWeight: '700' },

  filterChip:           { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center' },
  filterChipActive:     { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterChipText:       { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
=======
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 }, // Extra space for bottom bar

  profileCard: { backgroundColor: COLORS.sectionBg, borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: 16, position: 'relative' },
  menuBtn: { position: 'absolute', top: 16, right: 16, zIndex: 30, padding: 8 },
  menuBackdrop: { ...StyleSheet.absoluteFillObject, zIndex: 40 },
  dropdown: { position: 'absolute', top: 70, right: 20, backgroundColor: COLORS.white, borderRadius: 12, minWidth: 170, zIndex: 50, elevation: 10, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  dropdownItem: { paddingVertical: 14, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center' },
  dropdownDivider: { height: 1, backgroundColor: COLORS.border },
  dropdownText: { fontSize: 15, color: COLORS.textPrimary, fontWeight: '500' },

  avatarWrapper: { marginTop: 8, marginBottom: 12, position: 'relative' },
  avatarCircle: { width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderColor: COLORS.primary, overflow: 'hidden', backgroundColor: '#B8D4E8' },
  avatarImage: { width: '100%', height: '100%' },
  editPhotoBadge: { position: 'absolute', bottom: 4, right: 4, backgroundColor: COLORS.primary, borderRadius: 12, padding: 4 },

  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  username: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },

  statsRow: { flexDirection: 'row', borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: 12, overflow: 'hidden', width: '80%' },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  statDivider: { width: 1.5, backgroundColor: COLORS.primary },
  statValue: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  statLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },

  contentCard: { backgroundColor: COLORS.sectionBg, borderRadius: 20, padding: 16 },

  mainTabs: { flexDirection: 'row', marginBottom: 14, gap: 10 },
  mainTab: { flex: 1, paddingVertical: 9, borderRadius: 999, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center' },
  mainTabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  mainTabText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  mainTabTextActive: { color: COLORS.white, fontWeight: '700' },

  // Centered Filters
  filterContainer: {
    alignItems: 'center',
    marginBottom: 14,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },

  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterChipText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
>>>>>>> ad0502df49bbf7d726e2eb470be7d0d46777fb75
  filterChipTextActive: { color: COLORS.white, fontWeight: '700' },

  emptyText: { textAlign: 'center', color: COLORS.textMuted, marginTop: 24, fontSize: 14 },
});