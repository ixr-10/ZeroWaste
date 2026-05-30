import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, SPACING, BORDER_RADIUS } from "../../constants/theme";
import api from "../../constants/axios";

export default function UserProfile() {
  const router = useRouter();
  const params = useLocalSearchParams<{ userId?: string; id?: string; username?: string }>();
  const profileUserId = params.userId ?? params.id;

  const [menuVisible, setMenuVisible] = useState(false);
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [error, setError] = useState(false);

  const isFoodSaver = user?.role === "food_saver";
  const isCurrentUserFoodSaver = currentUser?.role === "food_saver";
  const canPromote = Boolean(profileUserId && isCurrentUserFoodSaver && !isFoodSaver);

  useEffect(() => {
    loadProfile();
  }, [profileUserId]);

  const loadProfile = async () => {
    setLoading(true);
    setError(false);

    try {
      const cachedUser = await AsyncStorage.getItem("user");
      const parsedCurrentUser = cachedUser ? JSON.parse(cachedUser) : null;
      setCurrentUser(parsedCurrentUser);

      if (profileUserId) {
        const [profileRes, donationsRes] = await Promise.all([
          api.get(`/users/users/${profileUserId}/`),
          api.get(`/donations/available/?donor=${profileUserId}`),
        ]);
        setUser(profileRes.data);
        setDonations(normalizeDonations(donationsRes.data));
      } else {
        setUser(parsedCurrentUser);
        const donationsRes = await api.get("/donations/my-donations/");
        setDonations(normalizeDonations(donationsRes.data));
      }
    } catch (err) {
      console.log("Error loading public profile:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const normalizeDonations = (data: any) => {
    if (Array.isArray(data)) return data;
    return [
      ...(data?.active ?? []),
      ...(data?.donated ?? []),
      ...(data?.expired ?? []),
      ...(data?.completed ?? []),
    ];
  };

  const menuOptions = useMemo(() => {
    const options = ["Block", "Report"];
    if (profileUserId) options.unshift("Send Message");
    if (canPromote) options.unshift("Promote to Food Saver");
    return options;
  }, [canPromote, profileUserId]);

  const handlePromote = async () => {
    if (!profileUserId) return;
    try {
      await api.post(`/users/promote/${profileUserId}/`);
      Alert.alert("Success", `${user?.username ?? "This user"} is now a Food Saver.`);
      const res = await api.get(`/users/users/${profileUserId}/`);
      setUser(res.data);
    } catch {
      Alert.alert("Promotion failed", "Could not promote this user.");
    }
  };

  const handleMessage = () => {
    if (!profileUserId) return;
    router.push({
      pathname: "/(Screens)/ChatConversation" as any,
      params: {
        otherUsername: user?.username,
        otherUserId: String(profileUserId),
      },
    });
  };

  const handleReport = () => {
    if (!profileUserId) return;
    router.push({
      pathname: "/(Screens)/ReportProfile" as any,
      params: {
        userId: String(profileUserId),
        username: user?.username ?? params.username ?? "User",
      },
    });
  };

  const handleMenuOption = (option: string) => {
    setMenuVisible(false);
    if (option === "Promote to Food Saver") handlePromote();
    if (option === "Send Message") handleMessage();
    if (option === "Report") handleReport();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return COLORS.primary;
      case "reserved": return "#E09F3E";
      case "completed": return "#4A6741";
      case "expired": return COLORS.emergencyRed;
      default: return COLORS.textMuted;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available": return "ellipse";
      case "reserved": return "time-outline";
      case "completed": return "checkmark-circle";
      case "expired": return "close-circle";
      default: return "ellipse";
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (error || !user) {
    return (
      <SafeAreaView style={styles.safe}>
        <Stack.Screen options={{ headerShown: false }} />
        <TouchableOpacity onPress={() => router.back()} style={styles.errorBackBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <View style={styles.errorState}>
          <Text style={styles.emptyText}>Profile not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView contentContainerStyle={styles.content}>

        {/* ── PROFILE CARD ─────────────────────────────────────────────────────── */}
        <View style={[styles.card, isFoodSaver && styles.cardFoodSaver]}>
          <View style={styles.topRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={20} color={COLORS.black} />
            </TouchableOpacity>

            <View style={styles.menuWrapper}>
              <TouchableOpacity onPress={() => setMenuVisible((prev) => !prev)}>
                <Ionicons name="ellipsis-vertical" size={20} color={COLORS.textPrimary} />
              </TouchableOpacity>

              {menuVisible && (
                <View style={styles.menu}>
                  {menuOptions.map((option, index) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.menuItem,
                        index < menuOptions.length - 1 && styles.menuItemBorder,
                      ]}
                      onPress={() => handleMenuOption(option)}
                    >
                      <Text
                        style={[
                          styles.menuText,
                          option === "Report" && { color: COLORS.emergencyRed },
                          (option === "Promote to Food Saver" || option === "Send Message") &&
                            styles.menuTextPrimary,
                        ]}
                      >
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
              <View style={styles.foodSaverBadge}>
                <Ionicons name="trophy" size={14} color="#B8860B" />
              </View>
            )}
          </View>

          {/* Name */}
          <View style={styles.nameRow}>
            <Text style={[styles.name, isFoodSaver && styles.nameFoodSaver]}>
              {user?.username ?? "Username"}
            </Text>
            {isFoodSaver ? (
              <Ionicons name="trophy" size={18} color="#F5A623" />
            ) : user?.is_verified ? (
              <Ionicons name="checkmark-circle" size={17} color={COLORS.primary} />
            ) : null}
          </View>

          {isFoodSaver && (
            <View style={styles.certifiedBanner}>
              <Ionicons name="shield-checkmark" size={14} color="#B8860B" />
              <Text style={styles.certifiedText}>
                Certified Food Saver-Trusted by the community fo
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
                Posts
              </Text>
            </View>
            <View style={[styles.statCard, isFoodSaver && styles.statCardFoodSaver]}>
              <View style={styles.scoreRow}>
                <Text style={[styles.statValue, isFoodSaver && styles.statValueFoodSaver]}>
                  {user?.reputation_score ?? 0}
                </Text>
                <Ionicons name="star" size={13} color={isFoodSaver ? "#F5A623" : "#E09F3E"} />
              </View>
              <Text style={[styles.statLabel, isFoodSaver && styles.statLabelFoodSaver]}>
                Score
              </Text>
            </View>
          </View>
        </View>

        {/* ── POSTS SECTION ────────────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, isFoodSaver && styles.sectionTitleFoodSaver]}>
            Posts
          </Text>
        </View>

        <View style={[styles.postsCard, isFoodSaver && styles.postsCardFoodSaver]}>
          {donations.length === 0 ? (
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
                    {item.available_quantity} / {item.quantity} {item.unit} - {item.category}
                  </Text>
                  <Text style={styles.postExpiry}>Expires: {item.expiry_date}</Text>
                </View>
                <View style={[styles.statusBadge, { borderColor: getStatusColor(item.status) }]}>
                  <Ionicons
                    name={getStatusIcon(item.status) as any}
                    size={10}
                    color={getStatusColor(item.status)}
                  />
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                    {item.status}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, gap: SPACING.lg },
  errorBackBtn: { padding: SPACING.lg },
  errorState: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Profile card
  card: { backgroundColor: "#E8EBE1", borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg },
  cardFoodSaver: { backgroundColor: "#FFF8EC", borderWidth: 2, borderColor: "#F5A623" },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  menuWrapper: { position: "relative" },
  menu: {
    position: "absolute",
    right: 0,
    top: 24,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 6,
    zIndex: 999,
    minWidth: 150,
  },
  menuItem: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuText: { fontSize: 14, color: COLORS.textPrimary, textAlign: "center" },
  menuTextPrimary: { color: COLORS.primary, fontWeight: "700" },

  // Avatar
  avatarWrapper: { alignItems: "center", marginBottom: SPACING.md, position: "relative" },
  avatarRing: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 3,
    borderColor: COLORS.primary,
    overflow: "hidden",
  },
  avatarRingFoodSaver: { borderColor: "#F5A623", borderWidth: 4 },
  avatar: { width: "100%", height: "100%" },
  foodSaverBadge: {
    position: "absolute",
    bottom: 0,
    right: "31%",
    backgroundColor: "#FFF8EC",
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: "#F5A623",
  },

  // Name
  nameRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginBottom: SPACING.sm,
  },
  name: { fontSize: 18, fontWeight: "700", color: COLORS.textPrimary },
  nameFoodSaver: { color: "#B8860B" },
  certifiedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: "#FEF3C7",
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginBottom: SPACING.md,
    alignSelf: "center",
  },
  certifiedText: { fontSize: 11, color: "#B8860B", fontWeight: "600", fontStyle: "italic" },

  // Stats
  statsRow: { flexDirection: "row", gap: 8 },
  statCard: {
    flex: 1,
    backgroundColor: "#D9E0C9",
    padding: SPACING.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 10,
  },
  statCardFoodSaver: { backgroundColor: "#FEF3C7", borderColor: "#F5A623" },
  statValue: { fontSize: 16, fontWeight: "700", color: COLORS.textPrimary },
  statValueFoodSaver: { color: "#B8860B" },
  statLabel: { fontSize: 12, fontWeight: "700", color: COLORS.black, marginTop: 2 },
  statLabelFoodSaver: { color: "#B8860B" },
  scoreRow: { flexDirection: "row", alignItems: "center", gap: 3 },

  // Posts section
  sectionHeader: { paddingHorizontal: SPACING.xs },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  sectionTitleFoodSaver: { color: "#B8860B" },

  postsCard: {
    backgroundColor: "#E8EBE1",
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    gap: SPACING.md,
    marginBottom: 20,
  },
  postsCardFoodSaver: { backgroundColor: "#FFF8EC", borderWidth: 1.5, borderColor: "#F5A623" },
  postItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: SPACING.sm,
    elevation: 1,
  },
  postImage: { width: 50, height: 50, borderRadius: 10 },
  imageFallback: { backgroundColor: "#D9E0C9", alignItems: "center", justifyContent: "center" },
  postTitle: { fontSize: 14, fontWeight: "600", color: COLORS.textPrimary },
  postDetails: { fontSize: 12, color: "#A29F9F" },
  postExpiry: { fontSize: 11, marginTop: 2, fontWeight: "500", color: COLORS.textMuted },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  statusText: { fontSize: 10, fontWeight: "700" },
  emptyText: { textAlign: "center", color: COLORS.textMuted, paddingVertical: 30 },
});