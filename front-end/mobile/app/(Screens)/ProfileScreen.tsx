import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Pressable, SafeAreaView, Modal, TextInput,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { BottomNavBar } from '../../components/ButtomNavBar';
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

// ── Post Item ──
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

// ── Reservation Item ──
const ReservationItem = ({ item, isIncoming, onAction }: any) => (
  <View style={{ backgroundColor: COLORS.white, borderRadius: 14, padding: 16, marginBottom: 12 }}>
    <Text style={{ fontWeight: '700' }}>{item.donation_title || 'Reservation'}</Text>
    <Text style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 4 }}>
      Qty: {item.quantity_requested} • {isIncoming ? `By: ${item.beneficiary_username}` : `Donor: ${item.donation_title}`}
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
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
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

  // Donations split by backend structure
  const [activeDonations, setActiveDonations] = useState<any[]>([]);
  const [expiredDonations, setExpiredDonations] = useState<any[]>([]);
  const [donatedDonations, setDonatedDonations] = useState<any[]>([]);

  // Reservations split by backend structure
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

      // Profile
      const user = profileRes.data;
      setUsername(user.username || 'Username');
      setAvatar(user.avatar || null);
      setReputationScore(user.reputation_score || 0);

      // Donations — backend returns {active, expired, donated}
      const donData = donRes.data;
      setActiveDonations(donData.active || []);
      setExpiredDonations(donData.expired || []);
      setDonatedDonations(donData.donated || []);

      // Reservations — backend returns {incoming: {pending, confirmed, rejected}, my_requests: {...}}
      const resData = resRes.data;
      setIncomingPending(resData.incoming?.pending || []);
      setIncomingConfirmed(resData.incoming?.confirmed || []);
      setIncomingRejected(resData.incoming?.rejected || []);
      setMyPending(resData.my_requests?.pending || []);
      setMyConfirmed(resData.my_requests?.confirmed || []);
      setMyRejected(resData.my_requests?.rejected || []);

    } catch (err: any) {
      console.error('Profile load error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  // Get current donations list based on filter
  const getCurrentDonations = () => {
    if (postFilter === 'active') return activeDonations;
    if (postFilter === 'expired') return expiredDonations;
    return donatedDonations;
  };

  // Get current reservations list based on tab + filter
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
  const totalReservations = myPending.length + myConfirmed.length + myRejected.length;

  // Upload Avatar
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
      const response = await api.put('/users/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        transformRequest: (data) => data,
      });
      // ProfileView returns serializer.data directly (not nested under 'user')
      setAvatar(response.data.avatar || uri);
      Alert.alert('Success', 'Profile picture updated!');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.avatar?.[0] || 'Failed to upload avatar');
    }
  };

  // Update Username
  const handleUpdateUsername = async (newUsername: string) => {
    try {
      const response = await api.put('/users/profile/', { username: newUsername });
      setUsername(response.data.username);
      Alert.alert('Success', 'Username updated!');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.username?.[0] || 'Failed to update username');
    }
  };

  // Confirm / Reject reservation (incoming only)
  const handleReservationAction = async (id: number, action: 'confirm' | 'reject') => {
    try {
      await api.post(`/donations/reservations/${id}/${action}/`);
      loadData();
      Alert.alert('Success', `Reservation ${action}ed!`);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed');
    }
  };

  const handleDeletePost = (id: number) => {
    showConfirm('Delete this donation? This cannot be undone.', async () => {
      try {
        await api.delete(`/donations/${id}/`);
        loadData();
      } catch (err: any) {
        Alert.alert('Error', err.response?.data?.error || 'Failed to delete');
      }
    });
  };

  const handleEditPost = (item: any) => {
    router.push({
      pathname: '/(Screens)/EditPostScreen' as any,
      params: { post: JSON.stringify(item) },
    });
  };

  const handleLogout = () => {
    setMenuOpen(false);
    showConfirm('Are you sure you want to logout?', async () => {
      await AsyncStorage.multiRemove(['access', 'refresh', 'user']);
      router.replace('/auth/login');
    }, 'Logout', COLORS.red);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <TouchableOpacity style={styles.menuBtn} onPress={() => setMenuOpen(!menuOpen)}>
            <Ionicons name="ellipsis-vertical" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity onPress={pickAndUploadAvatar} style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              {avatar
                ? <Image source={{ uri: avatar }} style={styles.avatarImage} />
                : <Image source={require('../../assets/images/me.png')} style={styles.avatarImage} />
              }
            </View>
            <View style={styles.editPhotoBadge}>
              <Ionicons name="camera" size={14} color="#fff" />
            </View>
          </TouchableOpacity>

          <View style={styles.nameRow}>
            <Text style={styles.username}>{username}</Text>
            <TouchableOpacity style={{ marginLeft: 6 }} onPress={() => setEditModal(true)}>
              <Ionicons name="pencil" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Reputation Score */}
          <View style={{ backgroundColor: '#e8f3e8', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 12 }}>
            <Text style={{ color: COLORS.primary, fontWeight: '600', fontSize: 13 }}>⭐ {reputationScore} pts</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{totalDonations}</Text>
              <Text style={styles.statLabel}>Donations</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{totalReservations}</Text>
              <Text style={styles.statLabel}>Reservations</Text>
            </View>
          </View>
        </View>

        {/* Content Card */}
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
                  {tab === 'posts' ? 'My Posts' : 'Reservations'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ paddingVertical: 40 }} />
          ) : mainTab === 'posts' ? (
            <>
              {/* Post Filter: active / expired / donated */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {([
                    { key: 'active', label: 'Active' },
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
              </ScrollView>

              {getCurrentDonations().length === 0 ? (
                <Text style={styles.emptyText}>No {postFilter} donations</Text>
              ) : (
                getCurrentDonations().map((item) => (
                  <PostItem key={item.id} item={item} onDelete={() => handleDeletePost(item.id)} onEdit={() => handleEditPost(item)} />
                ))
              )}
            </>
          ) : (
            <>
              {/* Reservation Sub-tabs: incoming / my requests */}
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                {([
                  { key: 'incoming', label: 'Incoming' },
                  { key: 'my_requests', label: 'My Requests' },
                ] as { key: ResTab; label: string }[]).map(({ key, label }) => (
                  <TouchableOpacity
                    key={key}
                    style={[styles.mainTab, resTab === key && styles.mainTabActive]}
                    onPress={() => setResTab(key)}
                  >
                    <Text style={[styles.mainTabText, resTab === key && styles.mainTabTextActive]}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Status Filter: pending / confirmed / rejected */}
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
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
                <Text style={styles.emptyText}>No {resFilter} {resTab === 'incoming' ? 'incoming' : ''} reservations</Text>
              ) : (
                getCurrentReservations().map((item) => (
                  <ReservationItem
                    key={item.id}
                    item={item}
                    isIncoming={resTab === 'incoming'}
                    onAction={handleReservationAction}
                  />
                ))
              )}
            </>
          )}
        </View>
      </ScrollView>

      <BottomNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
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
  filterChip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center' },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterChipText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  filterChipTextActive: { color: COLORS.white, fontWeight: '700' },
  emptyText: { textAlign: 'center', color: COLORS.textMuted, marginTop: 24, fontSize: 14 },
});