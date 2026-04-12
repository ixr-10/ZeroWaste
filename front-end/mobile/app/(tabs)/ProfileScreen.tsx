import React, { useState, useEffect, useCallback } from 'react';
import {
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
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

type MainTab   = 'posts' | 'reservations';
type PostFilter = 'available' | 'reserved' | 'completed' | 'expired';
type ResFilter  = 'pending' | 'confirmed' | 'rejected';

// Confirm Modal
const ConfirmModal = ({
  visible, message, confirmLabel = 'Delete', confirmColor = COLORS.red, onConfirm, onCancel,
}: {
  visible: boolean; 
  message: string; 
  confirmLabel?: string;
  confirmColor?: string; 
  onConfirm: () => void; 
  onCancel: () => void;
}) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
    <Pressable style={cStyles.backdrop} onPress={onCancel} />
    <View style={cStyles.centerer}>
      <View style={cStyles.box}>
        <Text style={cStyles.message}>{message}</Text>
        <View style={cStyles.buttons}>
          <TouchableOpacity style={cStyles.cancelBtn} onPress={onCancel}>
            <Text style={cStyles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[cStyles.confirmBtn, { backgroundColor: confirmColor }]} 
            onPress={onConfirm}
          >
            <Text style={cStyles.confirmText}>{confirmLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const cStyles = StyleSheet.create({
  backdrop:   { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  centerer:   { flex: 1, justifyContent: 'center', alignItems: 'center' },
  box:        { backgroundColor: COLORS.white, borderRadius: 18, padding: 24, width: '78%', elevation: 10 },
  message:    { fontSize: 15, color: COLORS.textPrimary, textAlign: 'center', marginBottom: 20, lineHeight: 22 },
  buttons:    { flexDirection: 'row', gap: 12 },
  cancelBtn:  { flex: 1, paddingVertical: 11, borderRadius: 999, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center' },
  cancelText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  confirmBtn: { flex: 1, paddingVertical: 11, borderRadius: 999, alignItems: 'center' },
  confirmText:{ fontSize: 14, fontWeight: '700', color: COLORS.white },
});

// Edit Username Modal
const EditUsernameModal = ({
  visible, currentUsername, onSave, onClose,
}: {
  visible: boolean; 
  currentUsername: string;
  onSave: (name: string) => void; 
  onClose: () => void;
}) => {
  const [value, setValue] = useState(currentUsername);
  
  useEffect(() => { 
    if (visible) setValue(currentUsername); 
  }, [visible, currentUsername]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
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
              onPress={() => { 
                if (value.trim()) { 
                  onSave(value.trim()); 
                  onClose(); 
                } 
              }}
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
  box:   { backgroundColor: COLORS.white, borderRadius: 20, padding: 24, width: '82%', zIndex: 10, elevation: 10 },
  title: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: COLORS.textPrimary, marginBottom: 20, backgroundColor: '#F7FAF5' },
});

// PostItem
const PostItem = ({ item, onDelete }: { item: any; onDelete: () => void; }) => {
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
        <Text style={pStyles.subtitle}>
          {item.available_quantity}/{item.quantity} {item.unit} • {item.category}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
          {item.status === 'completed' && (
            <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} />
          )}
          <Text style={[pStyles.status, { color: getStatusColor() }]}>
            {getStatusLabel()}
          </Text>
        </View>
      </View>
      <View style={pStyles.actions}>
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
  card:         { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBg, borderRadius: 14, padding: 10, marginBottom: 10 },
  image:        { width: 56, height: 56, borderRadius: 10, backgroundColor: COLORS.border },
  imageFallback:{ alignItems: 'center', justifyContent: 'center' },
  info:         { flex: 1, marginLeft: 12 },
  title:        { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  subtitle:     { fontSize: 12, color: COLORS.textMuted, marginTop: 1 },
  status:       { fontSize: 12, fontWeight: '600', marginTop: 3 },
  actions:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 8 },
  actionBtn:    { padding: 4 },
});

// ReservationItem
const ReservationItem = ({ 
  item, 
  onAction 
}: { 
  item: any; 
  onAction: (id: number, action: 'confirm' | 'reject') => void;
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const isPending = item.status === 'pending';
  const isConfirmed = item.status === 'confirmed';
  const isRejected = item.status === 'rejected';

  return (
    <View style={[
      rStyles.card,
      isConfirmed && rStyles.cardConfirmed,
      isRejected && rStyles.cardRejected,
    ]}>
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
                <TouchableOpacity 
                  style={rStyles.menuItem} 
                  onPress={() => { setMenuOpen(false); onAction(item.id, 'confirm'); }}
                >
                  <Text style={rStyles.menuConfirm}>Confirm</Text>
                </TouchableOpacity>
                <View style={{ height: 1, backgroundColor: COLORS.border }} />
                <TouchableOpacity 
                  style={rStyles.menuItem} 
                  onPress={() => { setMenuOpen(false); onAction(item.id, 'reject'); }}
                >
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  cardConfirmed: { borderColor: COLORS.primary },
  cardRejected:  { borderColor: COLORS.red },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F5C6C6',
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  textContainer: { flex: 1 },
  notifText: { fontSize: 13, color: COLORS.textPrimary, lineHeight: 18 },
  bold: { fontWeight: '700' },
  productName: { color: COLORS.primary, fontWeight: '600' },
  quantity: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  confirmedBadge: { fontSize: 12, color: COLORS.primary, fontWeight: '700' },
  rejectedBadge:  { fontSize: 12, color: COLORS.red, fontWeight: '600' },
  menu: {
    position: 'absolute', right: 0, top: 40,
    backgroundColor: COLORS.white, borderRadius: 10,
    elevation: 8, zIndex: 999, minWidth: 110,
    borderWidth: 1, borderColor: COLORS.border,
  },
  menuItem: { paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center' },
  menuConfirm: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  menuReject:  { fontSize: 14, color: COLORS.red, fontWeight: '600' },
});

// Main Screen
export default function ProfileScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [editModalVisible, setEditModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mainTab, setMainTab] = useState<MainTab>('posts');
  const [postFilter, setPostFilter] = useState<PostFilter>('available');
  const [resFilter, setResFilter] = useState<ResFilter>('pending');
  const [donations, setDonations] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUsername(user.username || 'Username');
      }

      const [donRes, resRes] = await Promise.all([
        api.get('/donations/my-donations/'),
        api.get('/donations/reservations/received/'),   // Received reservations (others requesting from me)
      ]);

      setDonations(donRes.data || []);
      setReservations(resRes.data || []);
    } catch (err) {
      console.log('Error loading profile data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const pickProfileImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
    }
  };

  // Confirm / Reject Reservation + Update Donation Status
  const handleReservationAction = async (id: number, action: 'confirm' | 'reject') => {
    try {
      const endpoint = action === 'confirm' 
        ? `/donations/reservations/${id}/confirm/` 
        : `/donations/reservations/${id}/reject/`;

      await api.post(endpoint);

      // Update reservation status
      setReservations((prev) =>
        prev.map((r) =>
          r.id === id 
            ? { ...r, status: action === 'confirm' ? 'confirmed' : 'rejected' } 
            : r
        )
      );

      // If confirmed → mark the related donation as completed
      if (action === 'confirm') {
  const updatedReservation = reservations.find(r => r.id === id);

  setDonations((prev) =>
    prev.map((d) => {
      if (d.id !== updatedReservation?.donation) return d;

      const newAvailable = d.available_quantity - updatedReservation.quantity_requested;

      return {
        ...d,
        available_quantity: newAvailable,
        status: newAvailable <= 0 ? 'completed' : 'available',
      };
    })
  );
}

      Alert.alert('Success', `Reservation ${action}ed successfully!`);
    } catch (err: any) {
      console.log('Reservation action failed:', err.response?.data || err.message);
      Alert.alert('Error', err.response?.data?.error || 'Failed to update reservation');
    }
  };

  const handleDeletePost = (id: number) => {
    showConfirm(
      'Delete this donation? This cannot be undone.',
      async () => {
        try {
          await api.delete(`/donations/${id}/`);
          setDonations((prev) => prev.filter((d) => d.id !== id));
        } catch (err: any) {
          const msg = err?.response?.data?.error || 'Failed to delete donation';
          Alert.alert('Error', msg);
        }
      }
    );
  };

  const handleLogout = () => {
    setMenuOpen(false);
    showConfirm('Are you sure you want to logout?', async () => {
      await AsyncStorage.multiRemove(['access', 'refresh', 'user']);
      router.replace('/auth/login');
    }, 'Logout', COLORS.red);
  };

  const filteredDonations = donations.filter((d) => d.status === postFilter);
  const filteredReservations = reservations.filter((r) => {
    if (resFilter === 'rejected') return r.status === 'rejected';
    return r.status === resFilter;
  });

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
        onSave={setUsername}
        onClose={() => setEditModal(false)}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.profileCard}>
          <TouchableOpacity style={styles.menuBtn} onPress={() => setMenuOpen(!menuOpen)}>
            <Ionicons name="ellipsis-vertical" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          {menuOpen && (
            <>
              <Pressable style={styles.menuBackdrop} onPress={() => setMenuOpen(false)} />
              <View style={styles.dropdown}>
                <TouchableOpacity 
                  style={styles.dropdownItem} 
                  onPress={() => { setMenuOpen(false); router.push('/(Screens)/SettingsScreen' as any); }}
                >
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

          <TouchableOpacity onPress={pickProfileImage} style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatarImage} />
              ) : (
                <Image source={require('../../assets/images/me.png')} style={styles.avatarImage} />
              )}
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

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{donations.length}</Text>
              <Text style={styles.statLabel}>Donations</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{reservations.length}</Text>
              <Text style={styles.statLabel}>Reservations</Text>
            </View>
          </View>
        </View>

        <View style={styles.contentCard}>
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
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {(['available', 'reserved', 'completed', 'expired'] as PostFilter[]).map((f) => (
                    <TouchableOpacity
                      key={f}
                      style={[styles.filterChip, postFilter === f && styles.filterChipActive]}
                      onPress={() => setPostFilter(f)}
                    >
                      <Text style={[styles.filterChipText, postFilter === f && styles.filterChipTextActive]}>
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {filteredDonations.length === 0 ? (
                <Text style={styles.emptyText}>No {postFilter} donations found</Text>
              ) : (
                filteredDonations.map((item) => (
                  <PostItem key={item.id} item={item} onDelete={() => handleDeletePost(item.id)} />
                ))
              )}
            </>
          ) : (
            <>
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

              {filteredReservations.length === 0 ? (
                <Text style={styles.emptyText}>No {resFilter} reservations found</Text>
              ) : (
                filteredReservations.map((item) => (
                  <ReservationItem 
                    key={item.id} 
                    item={item} 
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
  menuBtn: { position: 'absolute', top: 14, right: 14, zIndex: 10 },
  menuBackdrop: { position: 'absolute', top: -300, left: -300, right: -300, bottom: -300, zIndex: 15 },
  dropdown: { position: 'absolute', top: 40, right: 14, backgroundColor: COLORS.white, borderRadius: 12, minWidth: 140, zIndex: 20, elevation: 6, overflow: 'hidden' },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
  dropdownDivider: { height: 1, backgroundColor: COLORS.border },
  dropdownText: { fontSize: 15, color: COLORS.textPrimary, fontWeight: '500' },
  avatarWrapper: { marginTop: 8, marginBottom: 12, position: 'relative' },
  avatarCircle: { width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderColor: COLORS.primary, overflow: 'hidden', backgroundColor: '#B8D4E8' },
  avatarImage: { width: '100%', height: '100%' },
  editPhotoBadge: { position: 'absolute', bottom: 4, right: 4, backgroundColor: COLORS.primary, borderRadius: 12, padding: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
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