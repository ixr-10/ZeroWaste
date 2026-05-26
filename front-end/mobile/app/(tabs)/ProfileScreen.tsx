import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Pressable, Modal, TextInput,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import api from '../../constants/axios';

const COLORS = {
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

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Pressable style={cStyles.backdrop} onPress={onClose} />
        <View style={eStyles.box}>
          <Text style={eStyles.title}>Edit Username</Text>
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

// ── Post Item ── (matches Figma card style)
const PostItem = ({ item, onDelete, onEdit, showEdit }: any) => {
  const getStatusColor = () => {
    if (item.status === 'expired') return COLORS.red;
    if (item.status === 'completed') return COLORS.textMuted;
    if (!item.expiry_date) return COLORS.orange;
    const days = Math.ceil((new Date(item.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days <= 2 ? COLORS.red : COLORS.orange;
  };

  const getStatusText = () => {
    if (item.status === 'expired') return 'Expired';
    if (item.status === 'completed') return 'Donation made';
    if (!item.expiry_date) return 'Available';
    const days = Math.ceil((new Date(item.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'Expires today';
    return `Expires in ${days} day${days > 1 ? 's' : ''}`;
  };

  return (
    <View style={postStyles.card}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={postStyles.image} />
      ) : (
        <View style={[postStyles.image, postStyles.imageFallback]}>
          <Ionicons name="image-outline" size={22} color={COLORS.textMuted} />
        </View>
      )}
      <View style={postStyles.info}>
        <Text style={postStyles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={postStyles.subtitle}>{item.quantity} {item.unit} · {item.category}</Text>
        <Text style={[postStyles.status, { color: getStatusColor() }]}>{getStatusText()}</Text>
      </View>
      <View style={postStyles.actions}>
        {showEdit && (
          <TouchableOpacity style={postStyles.actionBtn} onPress={onEdit} activeOpacity={0.7}>
            <Ionicons name="create-outline" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={postStyles.actionBtn} onPress={onDelete} activeOpacity={0.7}>
          <Ionicons name="trash-outline" size={22} color={COLORS.red} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const postStyles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBg, borderRadius: 14, padding: 10, marginBottom: 10 },
  image: { width: 56, height: 56, borderRadius: 10, backgroundColor: COLORS.border },
  imageFallback: { alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, marginLeft: 12 },
  title: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  subtitle: { fontSize: 12, color: COLORS.textMuted, marginTop: 1 },
  status: { fontSize: 12, fontWeight: '600', marginTop: 3 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 8 },
  actionBtn: { padding: 4 },
});

// ── Incoming Reservation Card ── (matches Figma with confirm/reject)
const IncomingCard = ({ item, onAction }: any) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const isPending = item.status === 'pending';
  const isConfirmed = item.status === 'confirmed';
  const isRejected = item.status === 'rejected' || item.status === 'cancelled';
  const statusColor = isConfirmed ? COLORS.primary : isRejected ? COLORS.red : COLORS.orange;

  return (
    <View style={[resStyles.card, isConfirmed && { borderColor: COLORS.primary }, isRejected && { borderColor: COLORS.red }]}>
      <View style={resStyles.avatar}>
        <Ionicons name="person" size={20} color={COLORS.primaryMedium} />
      </View>
      <Text style={resStyles.text}>
        {isPending ? (
          <>
            <Text style={resStyles.bold}>{item.beneficiary_username}</Text>
            <Text> wants to reserve </Text>
            <Text style={resStyles.highlight}>{`'${item.donation_title}'`}</Text>
          </>
        ) : isConfirmed ? (
          <>
            <Text style={resStyles.bold}>{item.beneficiary_username}</Text>
            <Text> has reserved </Text>
            <Text style={resStyles.highlight}>{`'${item.donation_title}'`}</Text>
          </>
        ) : (
          <>
            <Text style={resStyles.bold}>{item.beneficiary_username}</Text>
            <Text>{`'s reservation for `}</Text>
            <Text style={resStyles.highlight}>{`'${item.donation_title}'`}</Text>
            <Text> was rejected</Text>
          </>
        )}
      </Text>

      {/* 3-dot menu for pending */}
      {isPending ? (
        <View style={{ position: 'relative' }}>
          <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)} style={{ padding: 4 }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="ellipsis-vertical" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
          {menuOpen && (
            <>
              <Pressable style={{ position: 'absolute', top: -500, left: -500, right: -500, bottom: -500, zIndex: 8 }} onPress={() => setMenuOpen(false)} />
              <View style={resStyles.dotMenu}>
                <TouchableOpacity style={resStyles.dotMenuItem} onPress={() => { setMenuOpen(false); onAction(item.id, 'confirm'); }}>
                  <Text style={resStyles.dotMenuConfirm}>Confirm</Text>
                </TouchableOpacity>
                <View style={{ height: 1, backgroundColor: COLORS.border }} />
                <TouchableOpacity style={resStyles.dotMenuItem} onPress={() => { setMenuOpen(false); onAction(item.id, 'reject'); }}>
                  <Text style={resStyles.dotMenuReject}>Reject</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      ) : (
        <View style={[resStyles.statusPill, { borderColor: statusColor }]}>
          <Text style={[resStyles.statusText, { color: statusColor }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      )}
    </View>
  );
};

// ── My Request Card ── (matches Figma)
const MyRequestCard = ({ item, onCancel }: any) => {
  const isConfirmed = item.status === 'confirmed';
  const isRejected = item.status === 'rejected' || item.status === 'cancelled';
  const isPending = item.status === 'pending';
  const borderColor = isConfirmed ? COLORS.primary : isRejected ? COLORS.red : 'transparent';

  return (
    <View style={[resStyles.card, { borderColor }]}>
      <View style={resStyles.avatar}>
        <Ionicons name="person" size={20} color={COLORS.primaryMedium} />
      </View>
      <Text style={resStyles.text}>
        {isPending ? (
          <>
            <Text style={resStyles.bold}>{item.donor_username || 'Donor'}</Text>
            <Text> wants to reserve </Text>
            <Text style={resStyles.highlight}>{`'${item.donation_title}'`}</Text>
          </>
        ) : isConfirmed ? (
          <>
            <Text style={resStyles.bold}>{item.donor_username || 'Donor'}</Text>
            <Text> confirmed your reservation for </Text>
            <Text style={resStyles.highlight}>{`'${item.donation_title}'`}</Text>
          </>
        ) : (
          <>
            <Text style={resStyles.bold}>{item.donor_username || 'Donor'}</Text>
            <Text> rejected your reservation for </Text>
            <Text style={resStyles.highlight}>{`'${item.donation_title}'`}</Text>
          </>
        )}
      </Text>
      {isPending ? (
        <TouchableOpacity onPress={onCancel} style={resStyles.cancelBtn}>
          <Text style={resStyles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={onCancel} style={{ marginLeft: 8, padding: 4 }}>
          <Ionicons name="trash-outline" size={18} color={COLORS.red} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const resStyles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBg, borderRadius: 14, padding: 12, marginBottom: 10, borderWidth: 1.5, borderColor: 'transparent' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F5C6C6', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  text: { flex: 1, fontSize: 13, color: COLORS.textPrimary, lineHeight: 19 },
  bold: { fontWeight: '700' },
  highlight: { color: COLORS.primary, fontWeight: '600' },
  statusPill: { borderWidth: 1.5, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, marginLeft: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  dotMenu: { position: 'absolute', right: 0, top: 24, backgroundColor: COLORS.white, borderRadius: 10, minWidth: 110, zIndex: 20, elevation: 8, overflow: 'hidden' },
  dotMenuItem: { paddingVertical: 10, paddingHorizontal: 16, alignItems: 'center' },
  dotMenuConfirm: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
  dotMenuReject: { fontSize: 14, fontWeight: '600', color: COLORS.red },
  cancelBtn: { backgroundColor: '#D94F4F15', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: COLORS.red, marginLeft: 8 },
  cancelText: { fontSize: 11, fontWeight: '700', color: COLORS.red },
});

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

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState('');
  const [confirmAct, setConfirmAct] = useState<() => void>(() => {});
  const [confirmLabel, setConfirmLabel] = useState('Delete');
  const [confirmColor, setConfirmColor] = useState(COLORS.red);

  const showConfirm = (msg: string, action: () => void, label = 'Delete', color = COLORS.red) => {
    setConfirmMsg(msg);
    setConfirmAct(() => action);
    setConfirmLabel(label);
    setConfirmColor(color);
    setConfirmVisible(true);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [profileRes, donRes, resRes] = await Promise.all([
        api.get('/users/profile/'),
        api.get('/donations/my-donations/'),
        api.get('/donations/reservations/my-reservations/'),
      ]);

      const user = profileRes.data;
      setUsername(user.username || 'Username');
      setAvatar(user.avatar || null);
      setReputationScore(user.reputation_score || 0);

      const donData = donRes.data;
      setActiveDonations(donData.active || []);
      setExpiredDonations(donData.expired || []);
      setDonatedDonations(donData.donated || []);

      const resData = resRes.data;
      setIncomingPending(resData.incoming?.pending || []);
      setIncomingConfirmed(resData.incoming?.confirmed || []);
      setIncomingRejected(resData.incoming?.rejected || []);
      setMyPending(resData.my_requests?.pending || []);
      setMyConfirmed(resData.my_requests?.confirmed || []);
      setMyRejected(resData.my_requests?.rejected || []);

    } catch (err: any) {
      Alert.alert('Error', 'Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

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

  // Score display: scale 0-100 → 0.0-5.0
  const scoreDisplay = reputationScore > 0
    ? (reputationScore / 20).toFixed(1)
    : '—';

  const pickAndUploadAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission Denied'); return; }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.7,
    });

    if (result.canceled || !result.assets?.[0]) return;
    const uri = result.assets[0].uri;
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'avatar.jpg';
    const type = `image/${filename.split('.').pop() || 'jpeg'}`;
    formData.append('avatar', { uri, name: filename, type } as any);

    try {
      const token = await AsyncStorage.getItem('access');
      const response = await fetch(
        `${require('../../constants/config').BASE_URL}users/profile/`,
        {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        }
      );
      const data = await response.json();
      setAvatar(data.avatar || uri);
      Alert.alert('Success', 'Profile picture updated!');
    } catch {
      Alert.alert('Error', 'Failed to upload avatar');
    }
  };

  const handleUpdateUsername = async (newUsername: string) => {
    try {
      const response = await api.put('/users/profile/', { username: newUsername });
      setUsername(response.data.username);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.username?.[0] || 'Failed to update username');
    }
  };

  const handleReservationAction = async (id: number, action: 'confirm' | 'reject') => {
    try {
      await api.post(`/donations/reservations/${id}/${action}/`);
      loadData();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed');
    }
  };

  const handleDeletePost = (id: number) => {
    showConfirm('Delete this donation?', async () => {
      try {
        await api.delete(`/donations/${id}/delete/`);
        loadData();
      } catch (err: any) {
        Alert.alert('Error', err.response?.data?.error || 'Failed to delete');
      }
    });
  };

  const handleCancelReservation = async (id: number) => {
    try {
      await api.post(`/donations/reservations/${id}/cancel/`);
      loadData();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to cancel');
    }
  };

  const handleEditPost = (item: any) => {
    router.push({
      pathname: '/(Screens)/EditPostScreen' as any,
      params: { post: JSON.stringify(item) },
    });
  };

  const handleLogout = () => {
    setMenuOpen(false);
    showConfirm(
      'Are you sure you want to logout?',
      async () => {
        try {
          const refresh = await AsyncStorage.getItem('refresh');
          if (refresh) await api.post('/users/logout/', { refresh });
        } catch {}
        await AsyncStorage.multiRemove(['access', 'refresh', 'access_token', 'refresh_token', 'isLoggedIn', 'user']);
        router.replace('/auth/login');
      },
      'Logout',
      COLORS.red
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ConfirmModal
        visible={confirmVisible}
        message={confirmMsg}
        confirmLabel={confirmLabel}
        confirmColor={confirmColor}
        onConfirm={() => { confirmAct(); setConfirmVisible(false); }}
        onCancel={() => setConfirmVisible(false)}
      />
      <EditUsernameModal
        visible={editModalVisible}
        currentUsername={username}
        onSave={handleUpdateUsername}
        onClose={() => setEditModal(false)}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

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

        {/* ── Profile Card ── */}
        <View style={styles.profileCard}>
          <TouchableOpacity style={styles.menuBtn} onPress={() => setMenuOpen(!menuOpen)}>
            <Ionicons name="ellipsis-vertical" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>

          {/* Avatar with camera badge */}
          <TouchableOpacity onPress={pickAndUploadAvatar} style={styles.avatarWrapper} activeOpacity={0.8}>
            <View style={styles.avatarCircle}>
              {avatar
                ? <Image source={{ uri: avatar }} style={styles.avatarImage} />
                : <Image source={require('../../assets/images/me.png')} style={styles.avatarImage} />
              }
            </View>
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={14} color={COLORS.white} />
            </View>
          </TouchableOpacity>

          {/* Username + edit */}
          <View style={styles.nameRow}>
            <Text style={styles.username}>{username}</Text>
            <TouchableOpacity style={{ marginLeft: 6 }} onPress={() => setEditModal(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="pencil" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Stats: Donations + Score (matches Figma) */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{totalDonations}</Text>
              <Text style={styles.statLabel}>Donations</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{scoreDisplay} ⭐</Text>
              <Text style={styles.statLabel}>Score</Text>
            </View>
          </View>
        </View>

        {/* ── Content Card ── */}
        <View style={styles.contentCard}>

          {/* Main Tabs */}
          <View style={styles.mainTabs}>
            {(['posts', 'reservations'] as MainTab[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.mainTab, mainTab === tab && styles.mainTabActive]}
                onPress={() => setMainTab(tab)}
              >
                <Text style={[styles.mainTabText, mainTab === tab && styles.mainTabTextActive]}>
                  {tab === 'posts' ? 'My Posts' : 'My Reservations'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ paddingVertical: 40 }} />
          ) : mainTab === 'posts' ? (
            <>
              {/* Post filters: Actif / Expired / Donated (matches Figma labels) */}
              <View style={styles.filterRow}>
                {([
                  { key: 'active', label: 'Actif' },
                  { key: 'expired', label: 'Expired' },
                  { key: 'donated', label: 'Donated' },
                ] as { key: PostFilter; label: string }[]).map(({ key, label }) => (
                  <TouchableOpacity
                    key={key}
                    style={[styles.filterChip, postFilter === key && styles.filterChipActive]}
                    onPress={() => setPostFilter(key)}
                  >
                    <Text style={[styles.filterChipText, postFilter === key && styles.filterChipTextActive]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {getCurrentDonations().length === 0 ? (
                <Text style={styles.emptyText}>No {postFilter} donations found</Text>
              ) : (
                getCurrentDonations().map((item) => (
                  <PostItem
                    key={item.id}
                    item={item}
                    showEdit={postFilter === 'active'}
                    onEdit={() => handleEditPost(item)}
                    onDelete={() => handleDeletePost(item.id)}
                  />
                ))
              )}
            </>
          ) : (
            <>
              {/* Reservation sub-tabs: Incoming / My Requests (matches Figma) */}
              <View style={styles.subTabRow}>
                {([
                  { key: 'incoming', label: 'Incoming' },
                  { key: 'my_requests', label: 'My Requests' },
                ] as { key: ResTab; label: string }[]).map(({ key, label }) => (
                  <TouchableOpacity
                    key={key}
                    style={[styles.subTab, resTab === key && styles.subTabActive]}
                    onPress={() => setResTab(key)}
                  >
                    <Text style={[styles.subTabText, resTab === key && styles.subTabTextActive]}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Status filter: Pending / Confirmed / Rejected */}
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

              {getCurrentReservations().length === 0 ? (
                <Text style={styles.emptyText}>No {resFilter} {resTab === 'incoming' ? 'incoming' : ''} reservations found</Text>
              ) : resTab === 'incoming' ? (
                getCurrentReservations().map((item) => (
                  <IncomingCard key={item.id} item={item} onAction={handleReservationAction} />
                ))
              ) : (
                getCurrentReservations().map((item) => (
                  <MyRequestCard
                    key={item.id}
                    item={item}
                    onCancel={() =>
                      showConfirm(
                        `Cancel reservation for "${item.donation_title}"?`,
                        () => handleCancelReservation(item.id),
                        'Cancel',
                        COLORS.red
                      )
                    }
                  />
                ))
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },

  // Profile card
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
  cameraBadge: { position: 'absolute', bottom: 4, right: 4, backgroundColor: COLORS.primary, borderRadius: 12, padding: 5, borderWidth: 2, borderColor: COLORS.white },

  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  username: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },

  // Stats: 2 boxes (Donations + Score) matching Figma
  statsRow: { flexDirection: 'row', borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: 12, overflow: 'hidden', width: '80%' },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  statDivider: { width: 1.5, backgroundColor: COLORS.primary },
  statValue: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  statLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },

  // Content card
  contentCard: { backgroundColor: COLORS.sectionBg, borderRadius: 20, padding: 16 },

  // Main tabs (My Posts / My Reservations)
  mainTabs: { flexDirection: 'row', marginBottom: 14, gap: 10 },
  mainTab: { flex: 1, paddingVertical: 9, borderRadius: 999, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center' },
  mainTabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  mainTabText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  mainTabTextActive: { color: COLORS.white, fontWeight: '700' },

  // Sub-tabs (Incoming / My Requests) — pill toggle style matching Figma
  subTabRow: { flexDirection: 'row', backgroundColor: COLORS.border, borderRadius: 999, padding: 3, marginBottom: 14, gap: 4 },
  subTab: { flex: 1, paddingVertical: 8, borderRadius: 999, alignItems: 'center' },
  subTabActive: { backgroundColor: COLORS.white },
  subTabText: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },
  subTabTextActive: { color: COLORS.primary, fontWeight: '700' },

  // Filters (Actif/Expired/Donated and Pending/Confirmed/Rejected)
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  filterChip: { flex: 1, paddingVertical: 8, borderRadius: 999, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center' },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterChipText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  filterChipTextActive: { color: COLORS.white, fontWeight: '700' },

  emptyText: { textAlign: 'center', color: COLORS.textMuted, marginTop: 24, fontSize: 14 },
});
