import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList, StatusBar,
  TextInput, KeyboardAvoidingView, Platform, Image, Alert, Modal
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SPACING, BORDER_RADIUS } from "../../constants/theme";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../constants/axios";
import { markMessagesRead } from "../../constants/axios";

type Message = {
  id: string;
  text?: string;
  image?: string;
  mine: boolean;
  time: string;
};

export default function ChatConversation() {
  const router = useRouter();
  const { conversationId, otherUsername, otherUserId } = useLocalSearchParams<{
    conversationId: string;
    otherUsername: string;
    otherUserId: string;
  }>();

  const flatListRef = useRef<FlatList>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false); // ← tracks if WE blocked them

  // ─── Check block status on mount ────────────────────────────────────────────
  useEffect(() => {
    const checkBlockStatus = async () => {
      try {
        const res = await api.get("users/blocked/");
        const blockedIds = res.data.map((b: any) => b.blocked.id);
        setIsBlocked(blockedIds.includes(parseInt(otherUserId)));
      } catch {}
    };
    checkBlockStatus();
  }, [otherUserId]);

  // ─── WebSocket ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const connect = async () => {
      const token = await AsyncStorage.getItem("access");
      const userStr = await AsyncStorage.getItem("user");
      let userId: number | null = null;
      if (userStr) userId = JSON.parse(userStr).id;

      if (conversationId) await markMessagesRead(Number(conversationId));

      const ws = new WebSocket(
        `ws://192.168.1.40:8000/ws/chat/${conversationId}/?token=${token}`
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
                hour: "2-digit", minute: "2-digit",
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
                  hour: "2-digit", minute: "2-digit",
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

  // ─── Actions ─────────────────────────────────────────────────────────────────
  const handleBlock = async () => {
    try {
      await api.post(`users/block/${otherUserId}/`);
      setIsBlocked(true);
      Alert.alert("Blocked", `${otherUsername} has been blocked. You can no longer message each other.`);
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.error || "Failed to block user.");
    }
  };

  const handleUnblock = async () => {
    try {
      await api.post(`users/unblock/${otherUserId}/`);
      setIsBlocked(false);
      Alert.alert("Unblocked", `${otherUsername} has been unblocked.`);
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.error || "Failed to unblock user.");
    }
  };

  const handleReport = () => {
    router.push({
      pathname: "/(Screens)/ReportProfile",
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

  // ─── Menu options — show Block OR Unblock, not both ──────────────────────────
  const menuOptions = [
    { label: "View Profile", action: () => router.push({ pathname: "/(Screens)/UserProfile", params: { id: otherUserId } }) },
    isBlocked
      ? { label: "Unblock", action: handleUnblock }
      : { label: "Block", action: handleBlock },
    { label: "Report", action: handleReport },
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

        <View style={styles.menuWrapper}>
          <TouchableOpacity onPress={() => setMenuVisible(true)} style={{ paddingRight: SPACING.md }}>
            <Ionicons name="ellipsis-vertical" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setMenuVisible(false)}>
              <View style={styles.menu}>
                {menuOptions.map((opt) => (
                  <TouchableOpacity
                    key={opt.label}
                    style={[
                      styles.menuItem,
                      opt.label === "Block" && styles.menuItemDanger,
                    ]}
                    onPress={() => { setMenuVisible(false); opt.action(); }}
                  >
                    <Text style={[styles.menuText, opt.label === "Block" && styles.menuTextDanger]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>
        </View>
      </View>

      {/* Blocked banner */}
      {isBlocked && (
        <View style={styles.blockedBanner}>
          <Ionicons name="ban-outline" size={16} color="#fff" />
          <Text style={styles.blockedBannerText}>
            You have blocked {otherUsername}. Unblock to send messages.
          </Text>
        </View>
      )}

      {/* MESSAGES */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          renderItem={({ item }) => (
            <View style={[styles.messageRow, item.mine && styles.messageRowMine]}>
              {!item.mine && (
                <Image style={styles.avatarSmall} source={require("../../assets/images/avatar.png")} />
              )}
              <View style={{ alignItems: item.mine ? "flex-end" : "flex-start" }}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.imageBubble} />
                ) : (
                  <View style={[styles.bubble, item.mine ? styles.bubbleMine : styles.bubbleOther]}>
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

        {/* INPUT — disabled when blocked */}
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

  header: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#D1D8C4",
    paddingVertical: SPACING.md, elevation: 2, gap: SPACING.sm,
  },
  backBtn: { marginLeft: 5, marginRight: SPACING.xs },
  avatar: { width: 38, height: 38, borderRadius: BORDER_RADIUS.full, backgroundColor: "#e8c8c8" },
  headerName: { flex: 1, fontSize: 15, fontWeight: "700", color: COLORS.textPrimary },

  menuWrapper: { position: "relative" },
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-start", alignItems: "flex-end", paddingTop: 70,
  },
  menu: {
    backgroundColor: COLORS.white, borderRadius: 10,
    borderWidth: 1, borderColor: "#588157",
    elevation: 8, minWidth: 140, marginRight: 12, overflow: "hidden",
  },
  menuItem: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg },
  menuItemDanger: { borderTopWidth: 1, borderTopColor: "#f0e0e0" },
  menuText: { fontSize: 14, color: COLORS.textPrimary, textAlign: "center" },
  menuTextDanger: { color: "#c0392b" },

  blockedBanner: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#c0392b",
    paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
  },
  blockedBannerText: { color: "#fff", fontSize: 12, flex: 1 },

  messagesList: { padding: SPACING.lg, gap: SPACING.md },
  messageRow: { flexDirection: "row", alignItems: "flex-end", gap: SPACING.sm },
  messageRowMine: { justifyContent: "flex-end" },
  avatarSmall: { width: 28, height: 28, borderRadius: BORDER_RADIUS.full },

  bubble: { maxWidth: "80%", borderRadius: BORDER_RADIUS.lg, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md },
  bubbleOther: { backgroundColor: COLORS.white, borderBottomLeftRadius: 4 },
  bubbleMine: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 14, color: COLORS.textPrimary, lineHeight: 20, flexShrink: 1 },
  bubbleTextMine: { color: COLORS.white },
  timeText: { fontSize: 10, color: COLORS.textMuted, marginTop: 4, marginHorizontal: SPACING.xs },
  imageBubble: { width: 200, height: 150, borderRadius: BORDER_RADIUS.md, marginBottom: 2 },

  inputRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  inputRowBlocked: { backgroundColor: "#f9f9f9", opacity: 0.7 },
  input: {
    flex: 1, backgroundColor: COLORS.cardBg,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    fontSize: 14, color: COLORS.textPrimary, maxHeight: 100,
  },
});
