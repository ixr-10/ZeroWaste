import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SPACING, BORDER_RADIUS } from "../../constants/theme";

const POSTS = [
  { id: "1", title: "Whole Milk", details: "1L • 368 Proteins", expiry: "Expires in 2 days", image: require("../../assets/images/milk.png") },
  { id: "2", title: "Chinese Food", details: "1 Box • Cooked Meals", expiry: "Expires in 15 days", image: require("../../assets/images/cooked meals.png") },
  { id: "3", title: "Beef", details: "1 Kg • Meat & Fish", expiry: "Expires in 10 days", image: require("../../assets/images/meat.png") },
];

export default function UserProfile() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const getExpiryColor = (expiryText: string) => {
    const match = expiryText.match(/\d+/);
    if (!match) return COLORS.emergencyRed;
    const days = parseInt(match[0]);
    return days >= 10 ? COLORS.primary : COLORS.emergencyRed;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>

          {/* Top actions */}
          <View style={styles.topRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={20} color={'black'} />
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
                      <Text style={[styles.menuText, option === "Report" && { color: COLORS.emergencyRed }]}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            <Image style={styles.avatar} source={require("../../assets/images/avatar.png")} />
          </View>

          {/* Name */}
          <View style={styles.nameRow}>
            <Text style={styles.name}>Username</Text>
            <Ionicons name="checkmark-circle" size={17} color={'black'} />
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>10</Text>
              <Text style={styles.statLabel}>Donations</Text>
            </View>
            <View style={styles.statCard}>
              <View style={{flexDirection:'row'}}>
                <Text style={styles.statValue}>4.8 </Text>
                <Ionicons name="star" size={17} color={'orange'} />
              </View>
              <Text style={styles.statLabel}>Score</Text>
            </View>
          </View>
        </View>

        {/* Posts */}
        <View style={styles.postsCard}>
          <Text style={styles.postsTitle}>Posts</Text>
          {POSTS.map((post) => (
            <TouchableOpacity key={post.id} style={styles.postItem}>
              <Image source={post.image} style={styles.postImage} />
              <View style={{ flex: 1 }}>
                <Text style={styles.postTitle}>{post.title}</Text>
                <Text style={styles.postDetails}>{post.details}</Text>
                <Text style={[styles.postExpiry, { color: getExpiryColor(post.expiry) }]}>{post.expiry}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'white'},
  content: { padding: SPACING.lg, gap: SPACING.lg },
  card: { backgroundColor: '#E8EBE1', borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.md },
  backBtn: { width: 32, height: 32, borderRadius: BORDER_RADIUS.full, backgroundColor: COLORS.white, alignItems: "center", justifyContent: "center", elevation: 2 },
  menuWrapper: { position: "relative" },
  menu: { position: "absolute", right: 0, top: 24, backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.primary, elevation: 6, zIndex: 999, minWidth: 120 },
  menuItem: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuText: { fontSize: 14, color: COLORS.textPrimary, textAlign: "center" },
  avatarWrapper: { alignItems: "center", marginBottom: SPACING.md },

  avatar: { width: 100, height: 100, borderRadius: BORDER_RADIUS.full },

  nameRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, marginBottom: SPACING.lg },
  name: { fontSize: 16, fontWeight: "700", color: COLORS.textPrimary },

  statsRow: { flexDirection: "row",gap:6  },
  statCard: { flex: 1, backgroundColor: '#D9E0C9', padding: SPACING.md, alignItems: "center",borderWidth:1,borderColor:'#588157',borderRadius:10 ,minWidth:100,minHeight:40 },
  statValue: { fontSize: 12, fontWeight: "700", color: COLORS.textPrimary },
  statLabel: { fontSize: 12, fontWeight: "700",color:'black', marginTop: 2 },

  postsCard: { backgroundColor:'#E8EBE1', borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg, gap: SPACING.md },
  postsTitle: { fontSize: 16, fontWeight: "700", color: COLORS.textPrimary, marginBottom: SPACING.sm },
  postItem: { flexDirection: "row", alignItems: "center", gap: SPACING.md, backgroundColor: '#F5F5F5', borderRadius:15, padding: SPACING.sm },
  postImage: { width: 44, height: 44, borderRadius: 10},
  postTitle: { fontSize: 14,  color: COLORS.textPrimary },
  postDetails: { fontSize: 12, color: '#A29F9F' },
  postExpiry: { fontSize: 11,  marginTop: 2,fontWeight: "500" },
});
