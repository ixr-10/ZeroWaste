import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList, StatusBar,
  TextInput, KeyboardAvoidingView, Platform, Image
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SPACING, BORDER_RADIUS } from "../../constants/theme";
import * as ImagePicker from "expo-image-picker";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { markMessagesRead } from "../../constants/axios";

type Message = {
  id: string;
  text?: string;
  image?: string;
  audio?: string;
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
  const [recording, setRecording] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [dotVisible, setDotVisible] = useState(true);

  
  useEffect(() => {
    let ws: WebSocket;

    const connect = async () => {
      const token = await AsyncStorage.getItem('access');
      const userStr = await AsyncStorage.getItem('user');

      let userId = null;
      if (userStr) {
        userId = JSON.parse(userStr).id;
      }

      if (conversationId) {
        await markMessagesRead(Number(conversationId));
      }

      ws = new WebSocket(
        `ws://192.168.73.147:8000/ws/chat/${conversationId}/?token=${token}`
      );
      wsRef.current = ws;

      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);

        if (data.type === 'history') {
          setMessages(data.messages.map((m: any) => ({
            id: `server-${m.id}-${m.created_at}`,
            text: m.content,
            mine: m.sender_id === userId,
            time: new Date(m.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            }),
          })));
        }

        if (data.type === 'message') {
          const m = data.message;
          const id = `server-${m.id}-${m.created_at}`;

          setMessages(prev => {
            if (prev.some(x => x.id === id)) return prev;
            return [...prev, {
              id,
              text: m.content,
              mine: m.sender_id === userId,
              time: new Date(m.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              }),
            }];
          });
        }

        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      };
    };

    connect();
    return () => wsRef.current?.close();

  }, [conversationId]);

  // recording animation
  useEffect(() => {
    if (!isRecording) return;
    const i = setInterval(() => setDotVisible(v => !v), 500);
    return () => clearInterval(i);
  }, [isRecording]);

  const sendMessage = () => {
    if (!message.trim()) return;

    wsRef.current?.send(JSON.stringify({
      type: "message",
      content: message.trim()
    }));

    setMessage("");
  };

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({});
    if (!res.canceled) {
      setMessages(prev => [...prev, {
        id: `local-${Date.now()}`,
        image: res.assets[0].uri,
        mine: true,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }]);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <Image
          style={styles.avatar}
          source={require('../../assets/images/avatar.png')}
        />

        <Text style={styles.headerName}>{otherUsername || "Chat"}</Text>

        <View style={styles.menuWrapper}>
          <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
            <Ionicons name="ellipsis-vertical" size={20} />
          </TouchableOpacity>

          {menuVisible && (
            <View style={styles.menu}>
              {["View Profile", "Block", "Report"].map(opt => (
                <TouchableOpacity 
                  key={opt} 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    if (opt === "View Profile") {
                      if (!otherUserId) {
                        console.error("Missing otherUserId in chat params");
                        return;
                      }
                      router.push({ 
                        pathname: "/(Screens)/UserProfile" as any, 
                        params: { id: otherUserId } 
                      });
                    }
                  }}
                >
                  <Text style={styles.menuText}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* MESSAGES */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          renderItem={({ item }) => (
            <View style={[styles.messageRow, item.mine && styles.messageRowMine]}>
              {!item.mine && (
                <Image style={styles.avatarSmall} source={require('../../assets/images/avatar.png')} />
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

        {/* INPUT */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            multiline
          />

          <TouchableOpacity onPress={pickImage}>
            <Ionicons name="image-outline" size={22} />
          </TouchableOpacity>

          <TouchableOpacity onPress={sendMessage}>
            <Ionicons name="send" size={20} color={COLORS.primary} />
          </TouchableOpacity>
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
    backgroundColor: '#D1D8C4',
    paddingVertical: SPACING.md,
    elevation: 2,
    gap: SPACING.sm
  },

  backBtn: { marginLeft: 5, marginRight: SPACING.xs },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: "#e8c8c8",
    alignItems: "center",
    justifyContent: "center"
  },

  headerName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary
  },

  menuWrapper: { position: "relative" },
  menuTrigger: { padding: SPACING.xs, marginRight: SPACING.sm },

  menu: {
    position: "absolute",
    right: 0,
    top: 30,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#588157',
    elevation: 8,
    zIndex: 999,
    minWidth: 130
  },

  menuItem: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#588157' },

  menuText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    textAlign: "center"
  },

  messagesList: {
    padding: SPACING.lg,
    gap: SPACING.md
  },

  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: SPACING.sm
  },

  messageRowMine: {
    justifyContent: "flex-end"
  },

  avatarSmall: {
    width: 28,
    height: 28,
    borderRadius: BORDER_RADIUS.full
  },

  
  bubble: {
    maxWidth: "80%", 
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md
  },

  bubbleOther: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4
  },

  bubbleMine: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4
    // ❌ removed alignSelf (it was breaking layout)
  },

 
  bubbleText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 20,
    flexShrink: 1 
  },

  bubbleTextMine: {
    color: COLORS.white
  },

  timeText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4,
    marginHorizontal: SPACING.xs
  },

  imageBubble: {
    width: 200,
    height: 150,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: 2
  },

  audioBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: 'transparent'
  },

  input: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 14,
    color: COLORS.textPrimary,
    maxHeight: 100
  },

  inputActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },

  inputIcon: {
    padding: SPACING.xs
  },

  recordingBtn: {
    backgroundColor: "rgba(217, 79, 79, 0.1)",
    borderRadius: BORDER_RADIUS.full,
    padding: 4
  },

  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.cardBg,
    alignItems: "center",
    justifyContent: "center"
  },

  sendBtnActive: {
    backgroundColor: COLORS.primary
  },

  inputRowRecording: {
    backgroundColor: "rgba(217, 79, 79, 0.06)",
    borderColor: COLORS.emergencyRed
  },

  recordingIndicator: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.sm
  },

  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.emergencyRed
  },

  recordingText: {
    fontSize: 14,
    color: COLORS.emergencyRed,
    fontWeight: "600"
  }
});