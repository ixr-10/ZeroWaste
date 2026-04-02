import React, { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Image, StatusBar, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SPACING, BORDER_RADIUS } from "../../constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "../../constants/axios";

export default function UserProfile() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<"donations" | "reservations">("donations");
  const [donations, setDonations] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userStr = await AsyncStorage.getItem("user");
        if (userStr) setUser(JSON.parse(userStr));

        const [donRes, resRes] = await Promise.all([
          axios.get("/donations/my-donations/"),
          axios.get("/donations/reservations/my-reservations/"),
        ]);
        setDonations(donRes.data);
        setReservations(resRes.data);
      } catch (err) {
        console.log("Error loading profile data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":   return "#588157";
      case "reserved":    return "#E09F3E";
      case "completed":   return "#4A6741";
      case "expired":     return COLORS.emergencyRed;
      case "pending":     return "#E09F3E";
      case "confirmed":   return "#588157";
      case "cancelled":   return COLORS.emergencyRed;
      default:            return COLORS.textMuted;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":  return "ellipse";
      case "reserved":   return "time-outline";
      case "completed":  return "checkmark-circle";
      case "expired":    return "close-circle";
      case "pending":    return "time-outline";
      case "confirmed":  return "checkmark-circle";
      case "cancelled":  return "close-circle";
      default:           return "ellipse";
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView contentContainerStyle={styles.content}>

        {/* ── Profile Card ── */}
        <View style={styles.card}>
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

          <View style={styles.avatarWrapper}>
            <Image style={styles.avatar} source={require("../../assets/images/avatar.png")} />
          </View>

          <View style={styles.nameRow}>
            <Text style={styles.name}>{user?.username ?? "Username"}</Text>
            <Ionicons name="checkmark-circle" size={17} color="black" />
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{donations.length}</Text>
              <Text style={styles.statLabel}>Donations</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{reservations.length}</Text>
              <Text style={styles.statLabel}>Reservations</Text>
            </View>
            <View style={styles.statCard}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.statValue}>{user?.reputation_score ?? 0} </Text>
                <Ionicons name="star" size={13} color="orange" />
              </View>
              <Text style={styles.statLabel}>Score</Text>
            </View>
          </View>
        </View>

        {/* ── Tabs ── */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "donations" && styles.tabActive]}
            onPress={() => setActiveTab("donations")}
          >
            <Text style={[styles.tabText, activeTab === "donations" && styles.tabTextActive]}>
              My Donations
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "reservations" && styles.tabActive]}
            onPress={() => setActiveTab("reservations")}
          >
            <Text style={[styles.tabText, activeTab === "reservations" && styles.tabTextActive]}>
              My Reservations
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Content ── */}
        <View style={styles.postsCard}>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ paddingVertical: 30 }} />
          ) : activeTab === "donations" ? (
            donations.length === 0 ? (
              <Text style={styles.emptyText}>No donations yet</Text>
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
                  {/* Status badge */}
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
            reservations.length === 0 ? (
              <Text style={styles.emptyText}>No reservations yet</Text>
            ) : (
              reservations.map((item) => (
                <View key={item.id} style={styles.postItem}>
                  <View style={[styles.postImage, styles.imageFallback]}>
                    <Ionicons name="bag-handle-outline" size={22} color={COLORS.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.postTitle}>{item.donation_title}</Text>
                    <Text style={styles.postDetails}>
                      Qty: {item.quantity_requested} • from {item.donation_title}
                    </Text>
                    <Text style={styles.postExpiry}>
                      Reserved on: {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                    {item.confirmation_deadline && item.status === "pending" && (
                      <Text style={[styles.postExpiry, { color: "#E09F3E" }]}>
                        Confirm by: {new Date(item.confirmation_deadline).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </Text>
                    )}
                  </View>
                  {/* Status badge */}
                  <View style={[styles.statusBadge, { borderColor: getStatusColor(item.status) }]}>
                    <Ionicons name={getStatusIcon(item.status) as any} size={10} color={getStatusColor(item.status)} />
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                      {item.status}
                    </Text>
                  </View>
                </View>
              ))
            )
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: "white" },
  content:        { padding: SPACING.lg, gap: SPACING.lg },
  card:           { backgroundColor: "#E8EBE1", borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg },
  topRow:         { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.md },
  backBtn:        { width: 32, height: 32, borderRadius: BORDER_RADIUS.full, backgroundColor: COLORS.white, alignItems: "center", justifyContent: "center", elevation: 2 },
  menuWrapper:    { position: "relative" },
  menu:           { position: "absolute", right: 0, top: 24, backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.primary, elevation: 6, zIndex: 999, minWidth: 120 },
  menuItem:       { paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuText:       { fontSize: 14, color: COLORS.textPrimary, textAlign: "center" },
  avatarWrapper:  { alignItems: "center", marginBottom: SPACING.md },
  avatar:         { width: 100, height: 100, borderRadius: BORDER_RADIUS.full },
  nameRow:        { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, marginBottom: SPACING.lg },
  name:           { fontSize: 16, fontWeight: "700", color: COLORS.textPrimary },
  statsRow:       { flexDirection: "row", gap: 6 },
  statCard:       { flex: 1, backgroundColor: "#D9E0C9", padding: SPACING.md, alignItems: "center", borderWidth: 1, borderColor: "#588157", borderRadius: 10 },
  statValue:      { fontSize: 12, fontWeight: "700", color: COLORS.textPrimary },
  statLabel:      { fontSize: 12, fontWeight: "700", color: "black", marginTop: 2 },

  // Tabs
  tabRow:         { flexDirection: "row", backgroundColor: "#E8EBE1", borderRadius: 12, padding: 4 },
  tab:            { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  tabActive:      { backgroundColor: "#588157" },
  tabText:        { fontSize: 13, fontWeight: "600", color: COLORS.textMuted },
  tabTextActive:  { color: COLORS.white },

  // Posts
  postsCard:      { backgroundColor: "#E8EBE1", borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg, gap: SPACING.md },
  postItem:       { flexDirection: "row", alignItems: "center", gap: SPACING.md, backgroundColor: "#F5F5F5", borderRadius: 15, padding: SPACING.sm },
  postImage:      { width: 50, height: 50, borderRadius: 10 },
  imageFallback:  { backgroundColor: "#D9E0C9", alignItems: "center", justifyContent: "center" },
  postTitle:      { fontSize: 14, fontWeight: "600", color: COLORS.textPrimary },
  postDetails:    { fontSize: 12, color: "#A29F9F" },
  postExpiry:     { fontSize: 11, marginTop: 2, fontWeight: "500", color: COLORS.textMuted },
  statusBadge:    { flexDirection: "row", alignItems: "center", gap: 3, borderWidth: 1, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 3 },
  statusText:     { fontSize: 10, fontWeight: "700" },
  emptyText:      { textAlign: "center", color: COLORS.textMuted, paddingVertical: 30 },
});