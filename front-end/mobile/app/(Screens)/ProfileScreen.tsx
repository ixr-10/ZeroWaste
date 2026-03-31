import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { BottomNavBar } from '../../components/ButtomNavBar';

// ─── Theme ────────────────────────────────────────────────────────────────────
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

// ─── Types ────────────────────────────────────────────────────────────────────
interface Post {
  id: string;
  title: string;
  subtitle: string;
  status: 'actif' | 'expired' | 'donated';
  imageUrl: string;
  expiresIn: string;
}

interface Reservation {
  id: string;
  username: string;
  product: string;
  status: 'pending' | 'confirmed' | 'rejected';
}

type MainTab = 'posts' | 'reservations';
type PostFilter = 'actif' | 'expired' | 'donated';
type ResFilter = 'pending' | 'confirmed' | 'rejected';

// ─── Initial Data ─────────────────────────────────────────────────────────────
const INITIAL_POSTS: Post[] = [
  { id: '1', title: 'Whole Milk', subtitle: '1L . Milk Products', status: 'actif', imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&q=80', expiresIn: 'Expires in 2 days' },
  { id: '2', title: 'Mixed Berries', subtitle: '2Kg . Fruit & Vegetables', status: 'actif', imageUrl: 'https://images.unsplash.com/photo-1563746924237-f81d3e6e5849?w=200&q=80', expiresIn: 'Expires in 5 days' },
  { id: '3', title: 'Chinese Food', subtitle: '1 piece . Cooked Meals', status: 'actif', imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=200&q=80', expiresIn: 'Expires in 15 days' },
  { id: '4', title: 'Beef', subtitle: '1 Kg . Meat & Fish', status: 'actif', imageUrl: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=200&q=80', expiresIn: 'Expires in 10 days' },
  { id: '5', title: 'Whole Milk', subtitle: '1L . Milk Products', status: 'expired', imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&q=80', expiresIn: 'Expired' },
  { id: '6', title: 'Whole Milk', subtitle: '1L . Milk Products', status: 'donated', imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&q=80', expiresIn: 'Donation made' },
  { id: '7', title: 'Chinese Food', subtitle: '1 piece . Cooked Meals', status: 'donated', imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=200&q=80', expiresIn: 'Donation made' },
];

const INITIAL_RESERVATIONS: Reservation[] = [
  { id: '1', username: 'Sarah M.',   product: 'Whole Milk',     status: 'pending'   },
  { id: '2', username: 'Ahmed K.',   product: 'Mixed Berries',  status: 'pending'   },
  { id: '3', username: 'Fatima Z.',  product: 'Homemade Bread', status: 'pending'   },
  { id: '4', username: 'Youssef B.', product: 'Whole Milk',     status: 'confirmed' },
  { id: '5', username: 'Nadia H.',   product: 'Chinese Food',   status: 'confirmed' },
  { id: '6', username: 'Karim L.',   product: 'Mixed Berries',  status: 'rejected'  },
];

// ─── Custom Confirm Modal ─────────────────────────────────────────────────────
interface ConfirmModalProps {
  visible: boolean;
  message: string;
  confirmLabel?: string;
  confirmColor?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  message,
  confirmLabel = 'Delete',
  confirmColor = COLORS.red,
  onConfirm,
  onCancel,
}) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
    <Pressable style={confirmStyles.backdrop} onPress={onCancel} />
    <View style={confirmStyles.centerer}>
      <View style={confirmStyles.box}>
        <Text style={confirmStyles.message}>{message}</Text>
        <View style={confirmStyles.buttons}>
          <TouchableOpacity style={confirmStyles.cancelBtn} onPress={onCancel} activeOpacity={0.8}>
            <Text style={confirmStyles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[confirmStyles.confirmBtn, { backgroundColor: confirmColor }]}
            onPress={onConfirm}
            activeOpacity={0.8}
          >
            <Text style={confirmStyles.confirmText}>{confirmLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const confirmStyles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  centerer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 24,
    width: '78%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 10,
  },
  message: {
    fontSize: 15,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  buttons: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cancelText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  confirmBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 999,
    alignItems: 'center',
  },
  confirmText: { fontSize: 14, fontWeight: '700', color: COLORS.white },
});

// ─── Edit Username Modal ──────────────────────────────────────────────────────
const EditUsernameModal = ({
  visible,
  currentUsername,
  onSave,
  onClose,
}: {
  visible: boolean;
  currentUsername: string;
  onSave: (name: string) => void;
  onClose: () => void;
}) => {
  const [value, setValue] = useState(currentUsername);

  React.useEffect(() => {
    if (visible) setValue(currentUsername);
  }, [visible, currentUsername]);

  const handleSave = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSave(trimmed);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <Pressable style={confirmStyles.backdrop} onPress={onClose} />
        <View style={editStyles.box}>
          <Text style={editStyles.title}>Edit Username</Text>
          <TextInput
            style={editStyles.input}
            value={value}
            onChangeText={setValue}
            placeholder="Enter new username"
            placeholderTextColor={COLORS.textMuted}
            autoFocus
            maxLength={30}
          />
          <View style={confirmStyles.buttons}>
            <TouchableOpacity style={confirmStyles.cancelBtn} onPress={onClose}>
              <Text style={confirmStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[confirmStyles.confirmBtn, { backgroundColor: COLORS.primary }]}
              onPress={handleSave}
            >
              <Text style={confirmStyles.confirmText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const editStyles = StyleSheet.create({
  box: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    width: '82%',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.textPrimary,
    marginBottom: 20,
    backgroundColor: '#F7FAF5',
  },
});

// ─── PostItem ─────────────────────────────────────────────────────────────────
const PostItem = ({
  item,
  showEdit,
  onDelete,
}: {
  item: Post;
  showEdit: boolean;
  onDelete: () => void;
}) => {
  const isDonated = item.status === 'donated';

  const getStatusColor = () => {
    if (item.status === 'expired') return COLORS.red;
    if (isDonated) return COLORS.primary;
    const days = parseInt(item.expiresIn);
    return days <= 2 ? COLORS.red : COLORS.orange;
  };

  return (
    <View style={postStyles.card}>
      <Image source={{ uri: item.imageUrl }} style={postStyles.image} />
      <View style={postStyles.info}>
        <Text style={postStyles.title}>{item.title}</Text>
        {!isDonated && (
          <Text style={postStyles.subtitle}>{item.subtitle}</Text>
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
          {isDonated && (
            <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} />
          )}
          <Text style={[postStyles.status, { color: getStatusColor() }]}>
            {item.expiresIn}
          </Text>
        </View>
      </View>
      <View style={postStyles.actions}>
        {showEdit && !isDonated && (
          <TouchableOpacity style={postStyles.actionBtn} activeOpacity={0.7}>
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
  info: { flex: 1, marginLeft: 12 },
  title: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  subtitle: { fontSize: 12, color: COLORS.textMuted, marginTop: 1 },
  status: { fontSize: 12, fontWeight: '600', marginTop: 3 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 8 },
  actionBtn: { padding: 4 },
});

// ─── ReservationItem ──────────────────────────────────────────────────────────
const ReservationItem = ({
  item,
  onDelete,
  onConfirm,
  onReject,
}: {
  item: Reservation;
  onDelete: () => void;
  onConfirm?: () => void;
  onReject?: () => void;
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const isPending = item.status === 'pending';
  const isRejected = item.status === 'rejected';
  const isConfirmed = item.status === 'confirmed';

  const getText = () => {
    if (isPending) return (
      <>
        <Text style={resStyles.bold}>{item.username}</Text>
        <Text> wants to reserve </Text>
        <Text style={resStyles.highlight}>&apos;{item.product}&apos;</Text>
      </>
    );
    if (isConfirmed) return (
      <>
        <Text style={resStyles.bold}>{item.username}</Text>
        <Text> has reserved </Text>
        <Text style={resStyles.highlight}>&apos;{item.product}&apos;</Text>
      </>
    );
    return (
      <>
        <Text style={resStyles.bold}>{item.username}</Text>
        <Text>&apos;s reservation for </Text>
        <Text style={resStyles.highlight}>&apos;{item.product}&apos;</Text>
        <Text> was rejected</Text>
      </>
    );
  };

  return (
    <View style={[resStyles.card, isRejected && resStyles.cardRejected, isConfirmed && resStyles.cardConfirmed]}>
      <View style={resStyles.avatar}>
        <Ionicons name="person" size={20} color={COLORS.primaryMedium} />
      </View>
      <Text style={resStyles.text}>{getText()}</Text>

      {isPending ? (
        <View style={{ position: 'relative' }}>
          <TouchableOpacity
            onPress={() => setMenuOpen(!menuOpen)}
            style={{ padding: 4 }}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="ellipsis-vertical" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>

          {menuOpen && (
            <>
              <Pressable
                style={{ position: 'absolute', top: -500, left: -500, right: -500, bottom: -500, zIndex: 8 }}
                onPress={() => setMenuOpen(false)}
              />
              <View style={resStyles.dotMenu}>
                <TouchableOpacity
                  style={resStyles.dotMenuItem}
                  onPress={() => { setMenuOpen(false); onConfirm?.(); }}
                  activeOpacity={0.7}
                >
                  <Text style={resStyles.dotMenuConfirm}>Confirm</Text>
                </TouchableOpacity>
                <View style={resStyles.dotMenuDivider} />
                <TouchableOpacity
                  style={resStyles.dotMenuItem}
                  onPress={() => { setMenuOpen(false); onReject?.(); }}
                  activeOpacity={0.7}
                >
                  <Text style={resStyles.dotMenuReject}>Reject</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      ) : (
        <TouchableOpacity onPress={onDelete} style={{ marginLeft: 8, padding: 4 }} activeOpacity={0.7}>
          <Ionicons name="trash-outline" size={18} color={COLORS.red} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const resStyles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBg, borderRadius: 14, padding: 12, marginBottom: 10, borderWidth: 1.5, borderColor: 'transparent' },
  cardRejected: { borderColor: COLORS.red },
  cardConfirmed: { borderColor: COLORS.primary },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F5C6C6', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  text: { flex: 1, fontSize: 13, color: COLORS.textPrimary, lineHeight: 19 },
  bold: { fontWeight: '700' },
  highlight: { color: COLORS.primary, fontWeight: '600' },
  dotMenu: {
    position: 'absolute',
    right: 0,
    top: 24,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    minWidth: 110,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  dotMenuItem: { paddingVertical: 10, paddingHorizontal: 16, alignItems: 'center' },
  dotMenuDivider: { height: 1, backgroundColor: COLORS.border },
  dotMenuConfirm: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
  dotMenuReject: { fontSize: 14, fontWeight: '600', color: COLORS.red },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const router = useRouter();

  // ── Load username from AsyncStorage on mount ──
  const [username, setUsername] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userStr = await AsyncStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setUsername(user.username || 'Username');
        }
      } catch {
        setUsername('Username');
      }
    };
    loadUser();
  }, []);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mainTab, setMainTab] = useState<MainTab>('posts');
  const [postFilter, setPostFilter] = useState<PostFilter>('actif');
  const [resFilter, setResFilter] = useState<ResFilter>('pending');
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);

  // Confirm modal state
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmLabel, setConfirmLabel] = useState('Delete');
  const [confirmColor, setConfirmColor] = useState(COLORS.red);

  const showConfirm = (message: string, onConfirm: () => void, label = 'Delete', color = COLORS.red) => {
    setConfirmMessage(message);
    setConfirmAction(() => onConfirm);
    setConfirmLabel(label);
    setConfirmColor(color);
    setConfirmVisible(true);
  };

  const handleConfirm = () => {
    confirmAction();
    setConfirmVisible(false);
  };

  const filteredPosts = posts.filter((p) => p.status === postFilter);
  const filteredReservations = reservations.filter((r) => r.status === resFilter);

  const handleDeletePost = (id: string, status: Post['status']) => {
    setPosts((prev) => prev.filter((p) => !(p.id === id && p.status === status)));
  };

  const handleDeleteReservation = (id: string) => {
    setReservations((prev) => prev.filter((r) => r.id !== id));
  };

  const handleConfirmReservation = (id: string) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'confirmed' } : r))
    );
    const reservation = reservations.find((r) => r.id === id);
    if (reservation) {
      setPosts((prev) =>
        prev.map((p) =>
          p.title === reservation.product && p.status === 'actif'
            ? { ...p, status: 'donated', expiresIn: 'Donation made' }
            : p
        )
      );
    }
  };

  const handleRejectReservation = (id: string) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r))
    );
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    showConfirm(
      'Are you sure you want to logout?',
      async () => {
        await AsyncStorage.removeItem('isLoggedIn');
        router.replace('/auth/login');
      },
      'Logout',
      COLORS.red
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ConfirmModal
        visible={confirmVisible}
        message={confirmMessage}
        confirmLabel={confirmLabel}
        confirmColor={confirmColor}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmVisible(false)}
      />

      <EditUsernameModal
        visible={editModalVisible}
        currentUsername={username}
        onSave={setUsername}
        onClose={() => setEditModalVisible(false)}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Profile Card ── */}
        <View style={styles.profileCard}>
          <TouchableOpacity style={styles.menuBtn} onPress={() => setMenuOpen(!menuOpen)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="ellipsis-vertical" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

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

          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              <Image source={require('../../assets/images/me.png')} style={styles.avatarImage} />
            </View>
          </View>

          <View style={styles.nameRow}>
            <Text style={styles.username}>{username}</Text>
            <TouchableOpacity style={{ marginLeft: 6 }} onPress={() => setEditModalVisible(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="pencil" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>10</Text>
              <Text style={styles.statLabel}>Donations</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>4.8 ⭐</Text>
              <Text style={styles.statLabel}>Score</Text>
            </View>
          </View>
        </View>

        {/* ── Content Card ── */}
        <View style={styles.contentCard}>
          {/* Main tabs */}
          <View style={styles.mainTabs}>
            {(['posts', 'reservations'] as MainTab[]).map((tab) => (
              <TouchableOpacity key={tab} style={[styles.mainTab, mainTab === tab && styles.mainTabActive]} onPress={() => setMainTab(tab)}>
                <Text style={[styles.mainTabText, mainTab === tab && styles.mainTabTextActive]}>
                  {tab === 'posts' ? 'My Posts' : 'My Reservations'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {mainTab === 'posts' ? (
            <>
              <View style={styles.filterRow}>
                {(['actif', 'expired', 'donated'] as PostFilter[]).map((f) => (
                  <TouchableOpacity key={f} style={[styles.filterChip, postFilter === f && styles.filterChipActive]} onPress={() => setPostFilter(f)}>
                    <Text style={[styles.filterChipText, postFilter === f && styles.filterChipTextActive]}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {filteredPosts.length === 0 ? (
                <Text style={styles.emptyText}>No items</Text>
              ) : (
                filteredPosts.map((item, i) => (
                  <PostItem
                    key={`${item.id}-${i}`}
                    item={item}
                    showEdit={postFilter === 'actif'}
                    onDelete={() =>
                      showConfirm(
                        `Delete "${item.title}"?`,
                        () => handleDeletePost(item.id, item.status)
                      )
                    }
                  />
                ))
              )}
            </>
          ) : (
            <>
              <View style={styles.filterRow}>
                {(['pending', 'confirmed', 'rejected'] as ResFilter[]).map((f) => (
                  <TouchableOpacity key={f} style={[styles.filterChip, resFilter === f && styles.filterChipActive]} onPress={() => setResFilter(f)}>
                    <Text style={[styles.filterChipText, resFilter === f && styles.filterChipTextActive]}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {filteredReservations.length === 0 ? (
                <Text style={styles.emptyText}>No items</Text>
              ) : (
                filteredReservations.map((item) => (
                  <ReservationItem
                    key={item.id}
                    item={item}
                    onDelete={() =>
                      showConfirm(
                        'Remove this reservation from your list?',
                        () => handleDeleteReservation(item.id),
                        'Remove'
                      )
                    }
                    onConfirm={() => handleConfirmReservation(item.id)}
                    onReject={() => handleRejectReservation(item.id)}
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

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },

  profileCard: { backgroundColor: COLORS.sectionBg, borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: 16, position: 'relative' },
  menuBtn: { position: 'absolute', top: 14, right: 14, zIndex: 10 },
  menuBackdrop: { position: 'absolute', top: -300, left: -300, right: -300, bottom: -300, zIndex: 15 },
  dropdown: { position: 'absolute', top: 40, right: 14, backgroundColor: COLORS.white, borderRadius: 12, minWidth: 140, zIndex: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 6, overflow: 'hidden' },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
  dropdownDivider: { height: 1, backgroundColor: COLORS.border },
  dropdownText: { fontSize: 15, color: COLORS.textPrimary, fontWeight: '500' },

  avatarWrapper: { marginTop: 8, marginBottom: 12 },
  avatarCircle: { width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderColor: COLORS.primary, overflow: 'hidden', backgroundColor: '#B8D4E8' },
  avatarImage: { width: '100%', height: '100%' },

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
  mainTabTextActive: { color: COLORS.white },

  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  filterChip: { flex: 1, paddingVertical: 8, borderRadius: 999, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center' },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterChipText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  filterChipTextActive: { color: COLORS.white, fontWeight: '700' },

  emptyText: { textAlign: 'center', color: COLORS.textMuted, marginTop: 24, fontSize: 14 },
});