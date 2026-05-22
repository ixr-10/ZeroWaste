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

    loadProfile();
  }, [userId]);

  const isFoodSaver = user?.role === 'food_saver';

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
                  {["Block", "Report"].map((option, index) => (
                    <TouchableOpacity
                      key={option}
                      style={[styles.menuItem, index === 0 && styles.menuItemBorder]}
                      onPress={() => {
                        setMenuVisible(false);
                        if (option === "Report") router.push("/ReportProfile" as any);
                      }}
                    >
                      <Text style={[styles.menuText, option === "Report" && { color: COLORS.emergencyRed }]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Avatar */}
          <View style={styles.avatarWrapper}>
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
});