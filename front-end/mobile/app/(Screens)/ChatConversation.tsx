import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack, useLocalSearchParams, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SPACING, BORDER_RADIUS } from "../../constants/theme";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { markMessagesRead } from "../../constants/axios";

type Message = {
  id: string;
  text?: string;
  image?: string;
  mine: boolean;
  time: string;
};

export default function ChatConversation() {
  const router = useRouter();
  const {
    conversationId,
    otherUsername,
    otherUserId,
    reservationId,
    otherUserIsVerified = "false",
  } = useLocalSearchParams<{
    conversationId: string;
    otherUsername: string;
    otherUserId: string;
    reservationId?: string;
    otherUserIsVerified?: string;
  }>();

  const flatListRef = useRef<FlatList>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);

  const [isBlocked, setIsBlocked] = useState<boolean | null>(null);
  const [isBlockLoading, setIsBlockLoading] = useState(false);

  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [verificationDone, setVerificationDone] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [resolvedReservationId, setResolvedReservationId] = useState<string | undefined>(
    reservationId
  );

  // ─── Load user role ───────────────────────────────────────────────────────────
  useEffect(() => {
    const loadRole = async () => {
      const userStr = await AsyncStorage.getItem("user");
      if (userStr) setCurrentUserRole(JSON.parse(userStr).role);
    };
    loadRole();
  }, []);

  // ─── Rating: fetch reservation if not passed, show popup if not yet rated ─────
  useEffect(() => {
    const checkRating = async () => {
      let rid = reservationId;

      // If no reservationId passed (e.g. food_saver), fetch it from the API
      if (!rid && conversationId) {
        try {
          const res = await api.get(
            `donations/reservations/by-conversation/${conversationId}/`
          );
          rid = String(res.data.id);
          setResolvedReservationId(rid);
        } catch {
          // No reservation linked to this conversation — skip popup
          return;
        }
      }

      if (!rid) return;

      const rated = await AsyncStorage.getItem(`rated_reservation_${rid}`);
      if (!rated) setShowRatingPopup(true);
    };

    checkRating();
  }, [reservationId, conversationId]);

  // ─── Verification: check AsyncStorage for persisted verified state ────────────
  useEffect(() => {
    const checkVerification = async () => {
      if (!otherUserId) return;
      const verified = await AsyncStorage.getItem(`verified_user_${otherUserId}`);
      if (verified === "true") setVerificationDone(true);
    };
    checkVerification();
  }, [otherUserId]);

  // ─── Block: load from cache immediately, then confirm with API ────────────────
  const checkBlockStatus = useCallback(async () => {
    if (!otherUserId) return;

    // Load from cache first so UI is instant
    const cached = await AsyncStorage.getItem(`blocked_user_${otherUserId}`);
    if (cached !== null) setIsBlocked(cached === "true");

    // Confirm with server in background
    setIsBlockLoading(true);
    try {
      const res = await api.get("users/blocked/");
      const blockedIds: string[] = res.data.map((b: any) => String(b.blocked.id));
      const currentlyBlocked = blockedIds.includes(String(otherUserId));
      setIsBlocked(currentlyBlocked);
      await AsyncStorage.setItem(`blocked_user_${otherUserId}`, String(currentlyBlocked));
    } catch {
      // Keep cached value
    } finally {
      setIsBlockLoading(false);
    }
  }, [otherUserId]);

  useFocusEffect(useCallback(() => { checkBlockStatus(); }, [checkBlockStatus]));
  useEffect(() => { checkBlockStatus(); }, [checkBlockStatus]);

  // ─── WebSocket ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const connect = async () => {
      const token = await AsyncStorage.getItem("access");
      const userStr = await AsyncStorage.getItem("user");
      let userId: number | null = null;
      if (userStr) userId = JSON.parse(userStr).id;

      if (conversationId) await markMessagesRead(Number(conversationId));

      const ws = new WebSocket(
        `ws://192.168.1.38:8000/ws/chat/${conversationId}/?token=${token}`
      );
      wsRef.current = ws;

      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);

        if (data.type === "history") {
          setMessages(
            data.messages.map((m: any) => ({
              id: `server-${m.id}-${m.created_at}`,
              text: m.content,
              mine: m.sender_id === userId,
              time: new Date(m.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            }))
          );
        }

        if (data.type === "message") {
          const m = data.message;
          const id = `server-${m.id}-${m.created_at}`;
          setMessages((prev) => {
            if (prev.some((x) => x.id === id)) return prev;
            return [
              ...prev,
              {
                id,
                text: m.content,
                mine: m.sender_id === userId,
                time: new Date(m.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              },
            ];
          });
        }

        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      };
    };

    connect();
    return () => wsRef.current?.close();
  }, [conversationId]);

  // ─── Verification banner condition ────────────────────────────────────────────
  const showVerificationBanner =
    currentUserRole === "food_saver" &&
    otherUserIsVerified !== "true" &&
    !verificationDone;

  // ─── Validate: persist so banner stays gone ───────────────────────────────────
  const handleValidate = async () => {
    if (verifyLoading || !otherUserId) return;
    setVerifyLoading(true);
    try {
      const res = await api.post(`users/verify/${otherUserId}/`);
      await AsyncStorage.setItem(`verified_user_${otherUserId}`, "true");
      setVerificationDone(true);
      Alert.alert("✅ Success", res.data.message || "User verified successfully!");
    } catch (err: any) {
      Alert.alert("❌ Failed", err.response?.data?.error || "Verification failed.");
    } finally {
      setVerifyLoading(false);
    }
  };

  // ─── Rating handlers ──────────────────────────────────────────────────────────
  const handleRateYes = async () => {
    if (resolvedReservationId) {
      await AsyncStorage.setItem(`rated_reservation_${resolvedReservationId}`, "true");
    }
    setShowRatingPopup(false);
    router.push({
      pathname: "/(Screens)/Rateexperiencescreen" as any,
      params: { reservationId: resolvedReservationId, donorName: otherUsername },
    });
  };

  const handleRateNotNow = () => setShowRatingPopup(false);

  // ─── Block / Unblock ─────────────────────────────────────────────────────────
  const handleBlock = async () => {
    setIsBlocked(true);
    await AsyncStorage.setItem(`blocked_user_${otherUserId}`, "true");
    try {
      await api.post(`users/block/${otherUserId}/`);
      Alert.alert("Blocked", `${otherUsername} has been blocked.`);
    } catch (err: any) {
      setIsBlocked(false);
      await AsyncStorage.setItem(`blocked_user_${otherUserId}`, "false");
      Alert.alert("Error", err.response?.data?.error || "Failed to block user.");
    }
  };

  const handleUnblock = async () => {
    setIsBlocked(false);
    await AsyncStorage.setItem(`blocked_user_${otherUserId}`, "false");
    try {
      await api.post(`users/unblock/${otherUserId}/`);
      Alert.alert("Unblocked", `${otherUsername} has been unblocked.`);
    } catch (err: any) {
      setIsBlocked(true);
      await AsyncStorage.setItem(`blocked_user_${otherUserId}`, "true");
      Alert.alert("Error", err.response?.data?.error || "Failed to unblock user.");
    }
  };

  const handleReport = () => {
    setMenuVisible(false);
    router.push({
      pathname: "/(Screens)/ReportProfile" as any,
      params: { userId: otherUserId, username: otherUsername },
    });
  };

  const sendMessage = () => {
    if (!message.trim() || isBlocked) return;
    wsRef.current?.send(JSON.stringify({ type: "message", content: message.trim() }));
    setMessage("");
  };

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({});
    if (!res.canceled) {
      setMessages((prev) => [
        ...prev,
        {
          id: `local-${Date.now()}`,
          image: res.assets[0].uri,
          mine: true,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  };

  const menuOptions = [
    {
      label: "View Profile",
      action: () => {
        setMenuVisible(false);
        router.push({
          pathname: "/(Screens)/UserProfile" as any,
          params: { id: otherUserId },
        });
      },
    },
    isBlocked
      ? { label: "Unblock", action: handleUnblock }
      : { label: "Block", action: handleBlock },
    { label: "Report", action: handleReport },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── RATING POPUP ──────────────────────────────────────────────────────── */}
      <Modal
        visible={showRatingPopup}
        transparent
        animationType="fade"
        onRequestClose={handleRateNotNow}
      >
        <View style={styles.popupOverlay}>
          <View style={styles.popupCard}>
            <View style={styles.popupIconWrapper}>
              <Ionicons name="star" size={30} color="#4A6741" />
            </View>
            <Text style={styles.popupTitle}>Rate this experience</Text>
            <Text style={styles.popupSubtitle}>
              How was your interaction with{" "}
              <Text style={styles.popupUsername}>{otherUsername}</Text>?
            </Text>
            <View style={styles.popupButtons}>
              <TouchableOpacity onPress={handleRateNotNow} style={styles.popupNotNowBtn}>
                <Text style={styles.popupNotNowText}>Not Now</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleRateYes} style={styles.popupYesBtn}>
                <Ionicons
                  name="star-outline"
                  size={15}
                  color="#fff"
                  style={{ marginRight: 5 }}
                />
                <Text style={styles.popupYesText}>Rate Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── HEADER ───────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Image
          style={styles.avatar}
          source={require("../../assets/images/avatar.png")}
        />
        <Text style={styles.headerName}>{otherUsername || "Chat"}</Text>

        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          style={{ paddingRight: SPACING.md }}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <Modal
          visible={menuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setMenuVisible(false)}
          >
            <View style={styles.menu}>
              {isBlockLoading ? (
                <ActivityIndicator style={{ padding: SPACING.md }} color={COLORS.primary} />
              ) : (
                menuOptions.map((opt) => (
                  <TouchableOpacity
                    key={opt.label}
                    style={[
                      styles.menuItem,
                      (opt.label === "Block" || opt.label === "Unblock") &&
                        styles.menuItemDanger,
                    ]}
                    onPress={() => { setMenuVisible(false); opt.action(); }}
                  >
                    <Text
                      style={[
                        styles.menuText,
                        opt.label === "Block" && styles.menuTextDanger,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>

      {/* ── VERIFICATION BANNER ──────────────────────────────────────────────── */}
      {showVerificationBanner && (
        <View style={styles.verificationBanner}>
          <Text style={styles.verificationBannerText}>
            New member — ready to verify their account?
          </Text>
          <View style={styles.verificationButtons}>
            <TouchableOpacity
              onPress={() => setVerificationDone(true)}
              style={styles.rejectBtn}
            >
              <Text style={styles.rejectBtnText}>Not Now</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleValidate}
              style={[styles.validateBtn, verifyLoading && { opacity: 0.6 }]}
              disabled={verifyLoading}
            >
              {verifyLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.validateBtnText}>Validate</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── BLOCKED BANNER ───────────────────────────────────────────────────── */}
      {isBlocked && (
        <View style={styles.blockedBanner}>
          <Ionicons name="ban-outline" size={16} color="#fff" />
          <Text style={styles.blockedBannerText}>
            You have blocked {otherUsername}. Unblock to send messages.
          </Text>
        </View>
      )}

      {/* ── MESSAGES + INPUT ─────────────────────────────────────────────────── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          renderItem={({ item }) => (
            <View style={[styles.messageRow, item.mine && styles.messageRowMine]}>
              {!item.mine && (
                <Image
                  style={styles.avatarSmall}
                  source={require("../../assets/images/avatar.png")}
                />
              )}
              <View style={{ alignItems: item.mine ? "flex-end" : "flex-start", maxWidth: "85%" }}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.imageBubble} />
                ) : (
                  <View
                    style={[
                      styles.bubble,
                      item.mine ? styles.bubbleMine : styles.bubbleOther,
                    ]}
                  >
                    <Text style={[styles.bubbleText, item.mine && styles.bubbleTextMine]}>
                      {item.text}
                    </Text>
                  </View>
                )}
                <Text style={styles.timeText}>{item.time}</Text>
              </View>
            </View>
          )}
        />

        <View style={[styles.inputRow, isBlocked && styles.inputRowBlocked]}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder={isBlocked ? "You have blocked this user..." : "Type a message..."}
            placeholderTextColor={isBlocked ? "#bbb" : COLORS.textMuted}
            multiline
            editable={!isBlocked}
          />
          {!isBlocked && (
            <>
              <TouchableOpacity onPress={pickImage}>
                <Ionicons name="image-outline" size={22} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={sendMessage}>
                <Ionicons name="send" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "white" },

  // Rating popup
  popupOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  popupCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: "center",
    width: "100%",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  popupIconWrapper: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#EEF3EC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  popupTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
    textAlign: "center",
  },
  popupSubtitle: {
    fontSize: 13.5,
    color: "#555",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 22,
  },
  popupUsername: { fontWeight: "700", color: "#4A6741" },
  popupButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    justifyContent: "center",
  },
  popupNotNowBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: "#D5DED0",
    alignItems: "center",
  },
  popupNotNowText: { fontSize: 14, color: "#666", fontWeight: "600" },
  popupYesBtn: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 11,
    borderRadius: 25,
    backgroundColor: "#4A6741",
    alignItems: "center",
    justifyContent: "center",
  },
  popupYesText: { fontSize: 14, color: "#fff", fontWeight: "600" },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1D8C4",
    paddingVertical: SPACING.md,
    elevation: 2,
    gap: SPACING.sm,
  },
  backBtn: { marginLeft: 5, marginRight: SPACING.xs },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: "#e8c8c8",
  },
  headerName: { flex: 1, fontSize: 15, fontWeight: "700", color: COLORS.textPrimary },

  // Menu
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 70,
  },
  menu: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#588157",
    minWidth: 160,
    marginRight: 12,
    overflow: "hidden",
  },
  menuItem: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg },
  menuItemDanger: { borderTopWidth: 1, borderTopColor: "#f0e0e0" },
  menuText: { fontSize: 14, color: COLORS.textPrimary, textAlign: "center" },
  menuTextDanger: { color: "#c0392b" },

  // Verification banner
  verificationBanner: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#D5DED0",
    elevation: 2,
  },
  verificationBannerText: {
    flex: 1,
    fontSize: 13.5,
    color: COLORS.textPrimary,
    fontWeight: "500",
  },
  verificationButtons: { flexDirection: "row", gap: SPACING.xs },
  validateBtn: {
    backgroundColor: "#4A6741",
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  validateBtnText: { fontSize: 13, color: "#fff", fontWeight: "600" },
  rejectBtn: {
    backgroundColor: "#F0F0F0",
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  rejectBtnText: { fontSize: 13, color: "#c0392b", fontWeight: "600" },

  // Blocked banner
  blockedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#c0392b",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  blockedBannerText: { color: "#fff", fontSize: 12, flex: 1 },

  // Messages
  messagesList: { padding: SPACING.lg, gap: SPACING.md },
  messageRow: { flexDirection: "row", alignItems: "flex-end", gap: SPACING.sm },
  messageRowMine: { justifyContent: "flex-end" },
  avatarSmall: { width: 28, height: 28, borderRadius: BORDER_RADIUS.full },
  bubble: {
    maxWidth: "100%",
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  bubbleOther: { backgroundColor: COLORS.white, borderBottomLeftRadius: 4 },
  bubbleMine: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
    flexWrap: "wrap",
    color: COLORS.textPrimary,
  },
  bubbleTextMine: { color: COLORS.white },
  timeText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4,
    marginHorizontal: SPACING.xs,
  },
  imageBubble: { width: 200, height: 150, borderRadius: BORDER_RADIUS.md },

  // Input
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  inputRowBlocked: { backgroundColor: "#f9f9f9", opacity: 0.7 },
  input: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 14,
    color: COLORS.textPrimary,
    maxHeight: 100,
  },
});