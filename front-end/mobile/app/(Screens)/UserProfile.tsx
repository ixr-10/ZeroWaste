import React, { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Image, StatusBar, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SPACING, BORDER_RADIUS } from "../../constants/theme";
import axios from "../../constants/axios";

// ─── Navigate to this screen like this: ──────────────────────────────────────
// router.push({ pathname: '/(Screens)/UserProfile', params: { userId: String(item.donor_id) } });

export default function UserProfile() {
  const router = useRouter();
<<<<<<< HEAD
  const { userId } = useLocalSearchParams<{ userId: string }>();

  const [menuVisible, setMenuVisible]   = useState(false);
  const [activeTab, setActiveTab]       = useState<"donations" | "reservations">("donations");
  const [donations, setDonations]       = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [user, setUser]                 = useState<any>(null);
  const [error, setError]               = useState(false);

  useEffect(() => {
    if (!userId) { setError(true); setLoading(false); return; }

    const loadProfile = async () => {
      try {
        // ── Fetch public profile ──────────────────────────────────────────────
        const profileRes = await axios.get(`/users/users/${userId}/`);
        setUser(profileRes.data);
        console.log('👤 Public profile:', JSON.stringify(profileRes.data));
=======
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<"donations" | "reservations">("donations");
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const { id } = useLocalSearchParams<{ id: string }>();

  useEffect(() => {
    console.log("UserProfile opened with id:", id);
    const loadData = async () => {
      setLoading(true);
      setUser(null);
      try {
        const meStr = await AsyncStorage.getItem("user");
        if (meStr) setCurrentUser(JSON.parse(meStr));

        if (id) {
          // Viewing someone else
          const [userRes, donRes] = await Promise.all([
            axios.get(`/users/users/${id}/`),
            axios.get(`/donations/available/`), 
          ]);
          setUser(userRes.data);
          // Safety check for map
          const allDonations = Array.isArray(donRes.data) ? donRes.data : (donRes.data?.active || []);
          setDonations(allDonations.filter((d: any) => String(d.donor_id) === String(id)));
        } else {
          // Viewing self
          const userStr = await AsyncStorage.getItem("user");
          if (userStr) setUser(JSON.parse(userStr));
          const donRes = await axios.get("/donations/my-donations/");
          
          const donData = donRes.data || {};
          setDonations(Array.isArray(donData.active) ? donData.active : []);
        }
>>>>>>> beec5ca7ed89bb4867c32357f8bd65ac61158756
      } catch (err) {
        console.log('Error loading public profile:', err);
        setError(true);
      }

      try {
        // ── Fetch this user's public donations ────────────────────────────────
        const donRes = await axios.get(`/donations/available/?donor=${userId}`);
        const data = donRes.data;
        const allDonations = Array.isArray(data)
          ? data
          : [...(data?.active || []), ...(data?.donated || []), ...(data?.expired || [])];
        setDonations(allDonations);
      } catch (err) {
        console.log('Error loading donations:', err);
      }

      setLoading(false);
    };
<<<<<<< HEAD

    loadProfile();
  }, [userId]);

  const isFoodSaver = user?.role === 'food_saver';
=======
    loadData();
  }, [id]);

  const handlePromote = async () => {
    if (!id) return;
    try {
      await axios.post(`/users/promote/${id}/`);
      alert(`Success! ${user?.username} is now a Food Saver.`);
      // Refresh to show gold badge
      const res = await axios.get(`/users/users/${id}/`);
      setUser(res.data);
    } catch (err) {
      alert("Failed to promote user.");
    }
  };

  const handleMessage = async () => {
    // Navigate to chat
    router.push({
      pathname: "/(Screens)/ChatConversation" as any,
      params: { 
        otherUsername: user?.username,
        otherUserId: id?.toString()
      }
    });
  };
>>>>>>> beec5ca7ed89bb4867c32357f8bd65ac61158756

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "#588157";
      case "reserved":  return "#E09F3E";
      case "completed": return "#4A6741";
      case "expired":   return COLORS.emergencyRed;
      default:          return COLORS.textMuted;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available": return "ellipse";
      case "reserved":  return "time-outline";
      case "completed": return "checkmark-circle";
      case "expired":   return "close-circle";
      default:          return "ellipse";
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#588157" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (error || !user) {
    return (
      <SafeAreaView style={styles.safe}>
        <Stack.Screen options={{ headerShown: false }} />
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 20 }}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: COLORS.textMuted }}>Profile not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView contentContainerStyle={styles.content}>

        {/* ── Profile Card ── */}
        <View style={[styles.card, isFoodSaver && styles.cardFoodSaver]}>

          {/* Top row */}
          <View style={styles.topRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={20} color="black" />
            </TouchableOpacity>
            <View style={styles.menuWrapper}>
              <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
                <Ionicons name="ellipsis-vertical" size={20} color={COLORS.textPrimary} />
              </TouchableOpacity>
              {menuVisible && (
                <View style={styles.menu}>
                  {(() => {
                    const opts = ["Block", "Report"];
                    if (currentUser?.role === 'food_saver') {
                      opts.unshift("Send Message");
                      if (user?.role !== 'food_saver') {
                        opts.unshift("Promote to Food Saver");
                      }
                    }
                    return opts.map((option, index) => (
                      <TouchableOpacity
                        key={option}
                        style={[styles.menuItem, index < opts.length - 1 && styles.menuItemBorder]}
                        onPress={() => {
                          setMenuVisible(false);
                          if (option === "Promote to Food Saver") handlePromote();
                          if (option === "Send Message") handleMessage();
                        }}
                      >
                        <Text style={[
                          styles.menuText, 
                          option === "Report" && { color: COLORS.emergencyRed },
                          (option === "Promote to Food Saver" || option === "Send Message") && { color: COLORS.primary, fontWeight: '700' }
                        ]}>
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ));
                  })()}
                </View>
              )}
            </View>
          </View>

          {/* Avatar */}
          <View style={styles.avatarWrapper}>
<<<<<<< HEAD
            <View style={[styles.avatarRing, isFoodSaver && styles.avatarRingFoodSaver]}>
              {user?.avatar ? (
                <Image style={styles.avatar} source={{ uri: user.avatar }} />
              ) : (
                <Image style={styles.avatar} source={require("../../assets/images/avatar.png")} />
              )}
            </View>
            {isFoodSaver && (
              <View style={styles.crownBadge}>
                <Text style={styles.crownEmoji}>👑</Text>
=======
            <View style={[
              styles.avatarContainer,
              user?.role === 'food_saver' && { borderColor: '#E09F3E', borderWidth: 3 }
            ]}>
              <Image style={styles.avatar} source={require("../../assets/images/avatar.png")} />
            </View>
          </View>

          <View style={styles.nameRow}>
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <>
                <Text style={styles.name}>{user?.username || "..."}</Text>
                {user?.role === 'food_saver' ? (
                  
                    <Ionicons name="trophy" size={20} color="orange" />
                  
                  
                ) : (
                  <Ionicons name="checkmark-circle" size={17} color="black" />
                )}
              </>
            )}
          </View>

          <View style={styles.statsRow}>
            <View style={[
              styles.statCard,
              user?.role === 'food_saver' && styles.statCardGold
            ]}>
              <Text style={styles.statValue}>{donations.length}</Text>
              <Text style={styles.statLabel}>Donations</Text>
            </View>
            <View style={[
              styles.statCard,
              user?.role === 'food_saver' && styles.statCardGold
            ]}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.statValue}>{user?.reputation_score ?? 0} </Text>
                <Ionicons name="star" size={13} color="orange" />
>>>>>>> beec5ca7ed89bb4867c32357f8bd65ac61158756
              </View>
            )}
          </View>

          {/* Name */}
          <View style={styles.nameRow}>
            <Text style={[styles.name, isFoodSaver && styles.nameFoodSaver]}>
              {user?.username ?? "Username"}
            </Text>
            {isFoodSaver ? (
              <Text style={styles.crownInline}>👑</Text>
            ) : user?.is_verified ? (
              <Ionicons name="checkmark-circle" size={17} color="#588157" />
            ) : null}
          </View>

          {/* Food Saver certified banner */}
          {isFoodSaver && (
            <View style={styles.certifiedBanner}>
              <Ionicons name="shield-checkmark" size={14} color="#B8860B" />
              <Text style={styles.certifiedText}>
                Certified Food Saver — Trusted by the community
              </Text>
            </View>
          )}

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, isFoodSaver && styles.statCardFoodSaver]}>
              <Text style={[styles.statValue, isFoodSaver && styles.statValueFoodSaver]}>
                {donations.length}
              </Text>
              <Text style={[styles.statLabel, isFoodSaver && styles.statLabelFoodSaver]}>
                Donations
              </Text>
            </View>
            <View style={[styles.statCard, isFoodSaver && styles.statCardFoodSaver]}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={[styles.statValue, isFoodSaver && styles.statValueFoodSaver]}>
                  {user?.reputation_score ?? 0}{" "}
                </Text>
                <Ionicons name="star" size={13} color={isFoodSaver ? "#F5A623" : "orange"} />
              </View>
              <Text style={[styles.statLabel, isFoodSaver && styles.statLabelFoodSaver]}>
                Score
              </Text>
            </View>
          </View>
        </View>

<<<<<<< HEAD
        {/* ── Tabs ── */}
        <View style={[styles.tabRow, isFoodSaver && styles.tabRowFoodSaver]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "donations" && (isFoodSaver ? styles.tabActiveFoodSaver : styles.tabActive)]}
            onPress={() => setActiveTab("donations")}
          >
            <Text style={[styles.tabText, activeTab === "donations" && styles.tabTextActive]}>
              Donations
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "reservations" && (isFoodSaver ? styles.tabActiveFoodSaver : styles.tabActive)]}
            onPress={() => setActiveTab("reservations")}
          >
            <Text style={[styles.tabText, activeTab === "reservations" && styles.tabTextActive]}>
              Reservations
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Posts ── */}
        <View style={[styles.postsCard, isFoodSaver && styles.postsCardFoodSaver]}>
          {activeTab === "donations" ? (
            donations.length === 0 ? (
              <Text style={styles.emptyText}>No donations yet</Text>
            ) : (
              donations.map((item) => (
                <View key={item.id} style={styles.postItem}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.postImage} />
                  ) : (
                    <View style={[styles.postImage, styles.imageFallback]}>
                      <Ionicons name="fast-food-outline" size={22} color="#588157" />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.postTitle}>{item.title}</Text>
                    <Text style={styles.postDetails}>
                      {item.available_quantity}/{item.quantity} {item.unit} • {item.category}
                    </Text>
                    <Text style={styles.postExpiry}>Expires: {item.expiry_date}</Text>
                  </View>
                  <View style={[styles.statusBadge, { borderColor: getStatusColor(item.status) }]}>
                    <Ionicons name={getStatusIcon(item.status) as any} size={10} color={getStatusColor(item.status)} />
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                      {item.status}
                    </Text>
                  </View>
                </View>
              ))
            )
          ) : (
            <Text style={styles.emptyText}>Reservations are private</Text>
=======
        {/* ── Posts ── */}
        <View style={styles.postsCard}>
          <Text style={styles.postsTitle}>Posts</Text>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ paddingVertical: 30 }} />
          ) : donations.length === 0 ? (
            <Text style={styles.emptyText}>No posts yet</Text>
          ) : (
            donations.map((item) => (
              <View key={item.id} style={styles.postItem}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.postImage} />
                ) : (
                  <View style={[styles.postImage, styles.imageFallback]}>
                    <Ionicons name="fast-food-outline" size={22} color={COLORS.primary} />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.postTitle}>{item.title}</Text>
                  <Text style={styles.postDetails}>
                    {item.available_quantity} / {item.quantity} {item.unit} • {item.category}
                  </Text>
                  <Text style={styles.postExpiry}>Expires: {item.expiry_date}</Text>
                </View>
                <View style={[styles.statusBadge, { borderColor: getStatusColor(item.status) }]}>
                  <Ionicons name={getStatusIcon(item.status) as any} size={10} color={getStatusColor(item.status)} />
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                    {item.status}
                  </Text>
                </View>
              </View>
            ))
>>>>>>> beec5ca7ed89bb4867c32357f8bd65ac61158756
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: "white" },
  content: { padding: SPACING.lg, gap: SPACING.lg },

  // ── Card ──────────────────────────────────────────────────────────────────
  card:          { backgroundColor: "#E8EBE1", borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg },
  cardFoodSaver: { backgroundColor: "#FFF8EC", borderWidth: 2, borderColor: "#F5A623" },

  topRow:         { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.md },
  backBtn:        { width: 32, height: 32, borderRadius: BORDER_RADIUS.full, backgroundColor: "white", alignItems: "center", justifyContent: "center", elevation: 2 },
  menuWrapper:    { position: "relative" },
  menu:           { position: "absolute", right: 0, top: 24, backgroundColor: "white", borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: "#D5DED0", elevation: 6, zIndex: 999, minWidth: 120 },
  menuItem:       { paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg },
<<<<<<< HEAD
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: "#D5DED0" },
  menuText:       { fontSize: 14, color: "#1A1A1A", textAlign: "center" },

  // ── Avatar ─────────────────────────────────────────────────────────────────
  avatarWrapper:       { alignItems: "center", marginBottom: SPACING.md, position: "relative" },
  avatarRing:          { width: 104, height: 104, borderRadius: 52, borderWidth: 3, borderColor: "#588157", overflow: "hidden" },
  avatarRingFoodSaver: { borderColor: "#F5A623", borderWidth: 4 },
  avatar:              { width: "100%", height: "100%" },
  crownBadge:          { position: "absolute", bottom: 0, right: "30%", backgroundColor: "#FFF8EC", borderRadius: 12, padding: 2, borderWidth: 1, borderColor: "#F5A623" },
  crownEmoji:          { fontSize: 14 },

  // ── Name ───────────────────────────────────────────────────────────────────
  nameRow:       { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, marginBottom: SPACING.sm },
  name:          { fontSize: 16, fontWeight: "700", color: "#1A1A1A" },
  nameFoodSaver: { color: "#B8860B" },
  crownInline:   { fontSize: 16 },

  // ── Certified banner ────────────────────────────────────────────────────────
  certifiedBanner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, backgroundColor: "#FEF3C7", borderRadius: 20, paddingVertical: 5, paddingHorizontal: 12, marginBottom: SPACING.md, alignSelf: "center" },
  certifiedText:   { fontSize: 11, color: "#B8860B", fontWeight: "600", fontStyle: "italic" },

  // ── Stats ───────────────────────────────────────────────────────────────────
  statsRow:           { flexDirection: "row", gap: 6 },
  statCard:           { flex: 1, backgroundColor: "#D9E0C9", padding: SPACING.md, alignItems: "center", borderWidth: 1, borderColor: "#588157", borderRadius: 10 },
  statCardFoodSaver:  { backgroundColor: "#FEF3C7", borderColor: "#F5A623" },
  statValue:          { fontSize: 12, fontWeight: "700", color: "#1A1A1A" },
  statValueFoodSaver: { color: "#B8860B" },
  statLabel:          { fontSize: 12, fontWeight: "700", color: "black", marginTop: 2 },
  statLabelFoodSaver: { color: "#B8860B" },

  // ── Tabs ────────────────────────────────────────────────────────────────────
  tabRow:             { flexDirection: "row", backgroundColor: "#E8EBE1", borderRadius: 12, padding: 4 },
  tabRowFoodSaver:    { backgroundColor: "#FEF3C7" },
  tab:                { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  tabActive:          { backgroundColor: "#588157" },
  tabActiveFoodSaver: { backgroundColor: "#F5A623" },
  tabText:            { fontSize: 13, fontWeight: "600", color: "#888888" },
  tabTextActive:      { color: "white" },

  // ── Posts ───────────────────────────────────────────────────────────────────
  postsCard:          { backgroundColor: "#E8EBE1", borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg, gap: SPACING.md },
  postsCardFoodSaver: { backgroundColor: "#FFF8EC", borderWidth: 1.5, borderColor: "#F5A623" },
  postItem:           { flexDirection: "row", alignItems: "center", gap: SPACING.md, backgroundColor: "#F5F5F5", borderRadius: 15, padding: SPACING.sm },
  postImage:          { width: 50, height: 50, borderRadius: 10 },
  imageFallback:      { backgroundColor: "#D9E0C9", alignItems: "center", justifyContent: "center" },
  postTitle:          { fontSize: 14, fontWeight: "600", color: "#1A1A1A" },
  postDetails:        { fontSize: 12, color: "#A29F9F" },
  postExpiry:         { fontSize: 11, marginTop: 2, fontWeight: "500", color: "#888888" },
  statusBadge:        { flexDirection: "row", alignItems: "center", gap: 3, borderWidth: 1, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 3 },
  statusText:         { fontSize: 10, fontWeight: "700" },
  emptyText:          { textAlign: "center", color: "#888888", paddingVertical: 30 },
=======
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuText:       { fontSize: 14, color: COLORS.textPrimary, textAlign: "center" },
  avatarWrapper:  { alignItems: "center", marginBottom: SPACING.md },
  avatarContainer: { width: 100, height: 100, borderRadius: 50, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#B8D4E8' },
  avatar:         { width: '100%', height: '100%' },
  nameRow:        { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, marginBottom: SPACING.lg },
  name:           { fontSize: 18, fontWeight: "700", color: COLORS.textPrimary },
  
  foodSaverBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E09F3E', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  foodSaverText: { color: '#fff', fontSize: 11, fontWeight: '700', marginLeft: 4 },

  statsRow:       { flexDirection: "row", gap: 12, justifyContent: 'center' },
  statCard:       { flex: 1, maxWidth: 120, backgroundColor: "#D9E0C9", padding: SPACING.md, alignItems: "center", borderWidth: 1.5, borderColor: "#588157", borderRadius: 15 },
  statCardGold:   { backgroundColor: 'rgba(253, 230, 138, 0.2)', borderColor: '#E09F3E' },
  statValue:      { fontSize: 16, fontWeight: "700", color: COLORS.textPrimary },
  statLabel:      { fontSize: 12, fontWeight: "600", color: COLORS.textSecondary, marginTop: 2 },

  // Posts
  postsCard:      { backgroundColor: "#E8EBE1", borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg, gap: SPACING.md, marginBottom: 20 },
  postsTitle:     { fontSize: 15, fontWeight: "700", color: COLORS.textPrimary, marginBottom: 5 },
  postItem:       { flexDirection: "row", alignItems: "center", gap: SPACING.md, backgroundColor: COLORS.white, borderRadius: 15, padding: SPACING.sm, elevation: 1 },
  postImage:      { width: 50, height: 50, borderRadius: 10 },
  imageFallback:  { backgroundColor: "#D9E0C9", alignItems: "center", justifyContent: "center" },
  postTitle:      { fontSize: 14, fontWeight: "600", color: COLORS.textPrimary },
  postDetails:    { fontSize: 12, color: "#A29F9F" },
  postExpiry:     { fontSize: 11, marginTop: 2, fontWeight: "500", color: COLORS.textMuted },
  statusBadge:    { flexDirection: "row", alignItems: "center", gap: 3, borderWidth: 1, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 3 },
  statusText:     { fontSize: 10, fontWeight: "700" },
  emptyText:      { textAlign: "center", color: COLORS.textMuted, paddingVertical: 30 },
>>>>>>> beec5ca7ed89bb4867c32357f8bd65ac61158756
});