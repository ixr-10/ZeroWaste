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
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { markMessagesRead } from "../../constants/axios";

type Message = {
  id: string;
  text?: string;
  mine: boolean;
  time: string;
};

export default function ChatConversation() {
  const router = useRouter();
  const {
    conversationId,
    otherUsername,
    otherUserId,
    otherUserIsVerified = "false",
  } = useLocalSearchParams<{
    conversationId: string;
    otherUsername: string;
    otherUserId: string;
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

  // ─── Load user role ───────────────────────────────────────────────────────────
  useEffect(() => {
    const loadRole = async () => {
      const userStr = await AsyncStorage.getItem("user");
      if (userStr) setCurrentUserRole(JSON.parse(userStr).role);
    };
    loadRole();
  }, []);

  // ─── Verification persistence ────────────────────────────────────────────────
  useEffect(() => {
    const checkVerification = async () => {
      if (!otherUserId) return;
      const verified = await AsyncStorage.getItem(`verified_user_${otherUserId}`);
      if (verified === "true") setVerificationDone(true);
    };
    checkVerification();
  }, [otherUserId]);

  // ─── Block Status ─────────────────────────────────────────────────────────────
  const checkBlockStatus = useCallback(async () => {
    if (!otherUserId) return;
    const cached = await AsyncStorage.getItem(`blocked_user_${otherUserId}`);
    if (cached !== null) setIsBlocked(cached === "true");

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
        `ws://10.81.26.147:8000/ws/chat/${conversationId}/?token=${token}`
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

  // ─── Derived flags ────────────────────────────────────────────────────────────
  const isFoodSaver = currentUserRole === "food_saver";
  const showVerificationBanner =
    isFoodSaver && otherUserIsVerified !== "true" && !verificationDone;

  // ─── Handlers ─────────────────────────────────────────────────────────────────
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

  const handleVerifyFromMenu = async () => {
    setMenuVisible(false);
    await handleValidate();
  };

  const handleRateFromMenu = () => {
    setMenuVisible(false);
    router.push({
      pathname: "/(Screens)/Rateexperiencescreen" as any,
      params: { 
        conversationId, 
        donorName: otherUsername 
      },
    });
  };

  const sendMessage = () => {
    if (!message.trim() || isBlocked) return;
    wsRef.current?.send(JSON.stringify({ type: "message", content: message.trim() }));
    setMessage("");
  };

  // ─── Menu options ─────────────────────────────────────────────────────────────
  const menuOptions = [
    {
      label: "View Profile",
      danger: false,
      action: () => {
        setMenuVisible(false);
        router.push({
          pathname: "/(Screens)/UserProfile" as any,
          params: { id: otherUserId },
        });
      },
    },
    ...(isFoodSaver && otherUserIsVerified !== "true" && !verificationDone
      ? [{ label: "Verify User", danger: false, action: handleVerifyFromMenu }]
      : []),
    {
      label: "Rate Experience",
      danger: false,
      action: handleRateFromMenu,
    },
    isBlocked
      ? { label: "Unblock", danger: false, action: () => { setMenuVisible(false); handleUnblock(); } }
      : { label: "Block", danger: true, action: () => { setMenuVisible(false); handleBlock(); } },
    { label: "Report", danger: true, action: handleReport },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Image style={styles.avatar} source={require("../../assets/images/avatar.png")} />
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
                menuOptions.map((opt, index) => (
                  <TouchableOpacity
                    key={opt.label}
                    style={[
                      styles.menuItem,
                      index < menuOptions.length - 1 && styles.menuItemBorder,
                      opt.label === "Verify User" && verifyLoading && { opacity: 0.6 },
                    ]}
                    onPress={opt.action}
                    disabled={opt.label === "Verify User" && verifyLoading}
                  >
                    {opt.label === "Verify User" && verifyLoading ? (
                      <ActivityIndicator size="small" color={COLORS.primary} />
                    ) : (
                      <Text
                        style={[
                          styles.menuText,
                          opt.danger && styles.menuTextDanger,
                          opt.label === "Verify User" && styles.menuTextPrimary,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))
              )}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>

      {/* VERIFICATION BANNER */}
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

      {/* BLOCKED BANNER */}
      {isBlocked && (
        <View style={styles.blockedBanner}>
          <Ionicons name="ban-outline" size={16} color="#fff" />
          <Text style={styles.blockedBannerText}>
            You have blocked {otherUsername}. Unblock to send messages.
          </Text>
        </View>
      )}

      {/* MESSAGES + INPUT */}
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
                <View style={[styles.bubble, item.mine ? styles.bubbleMine : styles.bubbleOther]}>
                  <Text style={[styles.bubbleText, item.mine && styles.bubbleTextMine]}>
                    {item.text}
                  </Text>
                </View>
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
            <TouchableOpacity onPress={sendMessage}>
              <Ionicons name="send" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "white" },

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
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  menuText: { fontSize: 14, color: COLORS.textPrimary, textAlign: "center" },
  menuTextPrimary: { color: COLORS.primary, fontWeight: "700" },
  menuTextDanger: { color: "#c0392b" },

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

  blockedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#c0392b",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  blockedBannerText: { color: "#fff", fontSize: 12, flex: 1 },

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
    color: COLORS.textPrimary,
  },
  bubbleTextMine: { color: COLORS.white },
  timeText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4,
    marginHorizontal: SPACING.xs,
  },

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