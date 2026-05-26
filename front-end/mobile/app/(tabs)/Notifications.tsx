import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  StatusBar,
  Alert,
  Modal,
  Pressable,
} from "react-native";
import * as Notifications from "expo-notifications";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SPACING, BORDER_RADIUS } from "../../constants/theme";
import { fetchNotifications as fetchNotificationsApi } from "../../constants/axios";
import api from "../../constants/axios";
import { registerPushNotifications } from "../utils/registerPushNotifications";

type Notification = {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "request" | "confirmed" | "rejected" | "info";
  notification_type?: string;
  related_object_id?: number;
  is_read: boolean;
};

const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const created = new Date(dateString);
  const diffMs = now.getTime() - created.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  return `${Math.floor(diffMins / 60)}h ago`;
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{ x: number; y: number } | null>(null);

  const notifListener = useRef<ReturnType<typeof Notifications.addNotificationReceivedListener> | null>(null);
  const responseListener = useRef<ReturnType<typeof Notifications.addNotificationResponseReceivedListener> | null>(null);

  useEffect(() => {
    registerPushNotifications();

    notifListener.current = Notifications.addNotificationReceivedListener(() => {
      fetchNotificationsHandler();
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(() => {
      fetchNotificationsHandler();
    });

    fetchNotificationsHandler();

    return () => {
      if (notifListener.current) notifListener.current.remove();
      if (responseListener.current) responseListener.current.remove();
    };
  }, []);

  const fetchNotificationsHandler = async () => {
    try {
      setLoading(true);
      const res = await fetchNotificationsApi();
      const data = res.data.notifications || [];

      const formatted: Notification[] = data
        // Only exclude message notifications, keep everything else
        .filter((n: any) => n.notification_type !== "new_message")
        .map((n: any) => ({
          id: n.id.toString(),
          title: n.title || "Notification",
          message: n.message || "",
          time: formatTimeAgo(n.created_at),
          type:
            n.notification_type === "new_reservation"
              ? "request"
              : n.notification_type === "reservation_confirmed"
              ? "confirmed"
              : n.notification_type === "reservation_rejected"
              ? "rejected"
              : "info", // nearby_user and anything else
          notification_type: n.notification_type,
          related_object_id: n.related_object_id,
          is_read: n.is_read,
        }));

      setNotifications(formatted);
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  // Same logic as profile page
  const handleReservationAction = async (
    notifId: string,
    reservationId: number | undefined,
    action: "confirm" | "reject"
  ) => {
    if (!reservationId) return;
    try {
      await api.post(`/donations/reservations/${reservationId}/${action}/`);
      setNotifications((prev) => prev.filter((n) => n.id !== notifId));
      Alert.alert("Success", `Reservation ${action}ed!`);
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.error || "Failed");
    }
  };

  const activeNotif = notifications.find((n) => n.id === menuOpenId);

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <Modal
        visible={menuOpenId !== null}
        transparent
        animationType="none"
        onRequestClose={() => setMenuOpenId(null)}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setMenuOpenId(null)}>
          {menuAnchor && activeNotif && (
            <View style={[styles.menu, { top: menuAnchor.y + 24, right: 24 }]}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMenuOpenId(null);
                  handleReservationAction(activeNotif.id, activeNotif.related_object_id, "confirm");
                }}
              >
                <Text style={styles.menuConfirm}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.menuItem, styles.menuItemBorder]}
                onPress={() => {
                  setMenuOpenId(null);
                  handleReservationAction(activeNotif.id, activeNotif.related_object_id, "reject");
                }}
              >
                <Text style={styles.menuReject}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}
        </Pressable>
      </Modal>

      <View style={styles.green}>
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={fetchNotificationsHandler}
          ListEmptyComponent={
            !loading ? (
              <Text style={styles.empty}>No notifications yet</Text>
            ) : null
          }
          renderItem={({ item }) => (
            <View style={[styles.notifCard, !item.is_read && styles.unreadCard]}>
              <View
                style={[
                  styles.dot,
                  item.type === "request"
                    ? styles.requestDot
                    : item.type === "confirmed"
                    ? styles.confirmedDot
                    : item.type === "rejected"
                    ? styles.rejectedDot
                    : styles.infoDot,
                ]}
              />

              <View style={{ flex: 1 }}>
                <Text style={styles.notifTitle}>{item.title}</Text>
                <Text style={styles.notifText}>{item.message}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>

              {/* Only reservation requests get the confirm/reject menu */}
              {item.type === "request" && (
                <View style={styles.menuWrapper}>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.currentTarget.measure((_fx, _fy, _w, _h, px, py) => {
                        setMenuAnchor({ x: px, y: py });
                        setMenuOpenId(menuOpenId === item.id ? null : item.id);
                      });
                    }}
                  >
                    <Ionicons name="ellipsis-vertical" size={18} color={COLORS.textMuted} />
                  </TouchableOpacity>
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
  green: {
    flex: 1,
    backgroundColor: "rgba(209, 216, 196, 0.4)",
    margin: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    overflow: "hidden",
  },
  list: { padding: SPACING.md, gap: SPACING.md },
  notifCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.sm,
    elevation: 1,
    borderColor: "#588157",
    borderWidth: 1,
  },
  unreadCard: { backgroundColor: "#f0f5ee", borderColor: "#3a7d44", borderWidth: 1.5 },
  dot: { width: 12, height: 12, borderRadius: 999, marginTop: 6 },
  requestDot: { backgroundColor: "#588157" },
  confirmedDot: { backgroundColor: "#3a7d44" },
  rejectedDot: { backgroundColor: "#D94F4F" },
  infoDot: { backgroundColor: "#888888" },
  notifTitle: { fontSize: 13, fontWeight: "700", color: COLORS.textPrimary, marginBottom: 2 },
  notifText: { fontSize: 12, color: COLORS.textPrimary, lineHeight: 18, flexShrink: 1 },
  time: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },
  empty: { textAlign: "center", color: COLORS.textMuted, marginTop: 40, fontSize: 14 },
  menuWrapper: { position: "relative" },
  menu: {
    position: "absolute",
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.sm,
    elevation: 10,
    zIndex: 999,
    minWidth: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  menuItem: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, alignItems: "center" },
  menuItemBorder: { borderTopWidth: 1, borderTopColor: COLORS.border },
  menuConfirm: { fontSize: 13, color: COLORS.primary, fontWeight: "600" },
  menuReject: { fontSize: 13, color: COLORS.emergencyRed, fontWeight: "600" },
});