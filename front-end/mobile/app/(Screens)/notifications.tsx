import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SPACING, BORDER_RADIUS } from "../../constants/theme";

type Notification = {
  id: string;
  username: string;
  action: string;
  product: string;
  time: string;
  type: "request" | "confirmed";
  showMenu?: boolean;
};

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: "1", username: "Username", action: "wants to reserve", product: "product name", time: "1h ago", type: "request", showMenu: true },
  { id: "2", username: "Username", action: "confirmed your reservation for", product: "product name", time: "2h ago", type: "confirmed" },
];

export default function Notifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [menuOpenId, setMenuOpenId] = useState<string | null>("1");

  const handleConfirm = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleReject = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.green}>
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.notifCard}>
              <Image source={require("../../assets/images/avatar.png")} style={styles.avatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.notifText}>
                  <Text style={styles.bold}>{item.username}</Text>
                  {" "}{item.action}{" "}
                  <Text style={styles.bold}>'{item.product}'</Text>
                  {item.type === "confirmed" && (
                    <Text> , <Text style={styles.link}>start chatting</Text></Text>
                  )}
                </Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>

              {/* 3 dots + confirm/reject */}
              {item.type === "request" && (
                <View style={styles.menuWrapper}>
                  <TouchableOpacity onPress={() => setMenuOpenId(menuOpenId === item.id ? null : item.id)}>
                    <Ionicons name="ellipsis-vertical" size={18} color={COLORS.textMuted} />
                  </TouchableOpacity>
                  {menuOpenId === item.id && (
                    <View style={styles.menu}>
                      <TouchableOpacity style={styles.menuItem} onPress={() => handleConfirm(item.id)}>
                        <Text style={styles.menuConfirm}>Confirm</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.menuItem, styles.menuItemBorder]} onPress={() => handleReject(item.id)}>
                        <Text style={styles.menuReject}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}
        />
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  green: { flex: 1, backgroundColor: "rgba(209, 216, 196, 0.4)", margin: SPACING.lg, borderRadius: BORDER_RADIUS.xl, overflow: "hidden" },

  list: { padding: SPACING.md, gap: SPACING.md },
  notifCard: { flexDirection: "row", alignItems: "flex-start", backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, gap: SPACING.sm, elevation: 1,borderColor:'#588157' ,borderWidth:1 },
  avatar: { width: 23.75, height: 23.75, borderRadius: BORDER_RADIUS.full },
  notifText: { fontSize: 12, color: COLORS.textPrimary, lineHeight: 18, flexShrink: 1 },
  bold: { fontWeight: "700" },
  link: { color: COLORS.primary, fontWeight: "600", textDecorationLine: "underline" },
  time: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },
  
  menuWrapper: { position: "relative" },
  menu: { position: "absolute", right: 0, top: 22, backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.sm, elevation: 6, zIndex: 999, minWidth: 100, borderWidth: 1, borderColor: COLORS.border },
  menuItem: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, alignItems: "center" },
  menuItemBorder: { borderTopWidth: 1, borderTopColor: COLORS.border },
  menuConfirm: { fontSize: 13, color: COLORS.primary, fontWeight: "600" },
  menuReject: { fontSize: 13, color: COLORS.emergencyRed, fontWeight: "600" },

});