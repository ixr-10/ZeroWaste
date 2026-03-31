import React, { useState, useRef , useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, StatusBar, TextInput, KeyboardAvoidingView, Platform, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack  } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SPACING, BORDER_RADIUS } from "../../constants/theme";
import * as ImagePicker from "expo-image-picker";
// eslint-disable-next-line import/no-unresolved
import { Audio } from "expo-av";

// ─── Types ───────────────────────────────────────────────────────────────────
type Message = {
  id: string;
  text?: string;
  image?: string;
  audio?: string;
  mine: boolean;
  time: string;
};

// ─── Data ────────────────────────────────────────────────────────────────────
const INITIAL_MESSAGES: Message[] = [
  { id: "1", text: "Hey there!", mine: false, time: "10:00" },
  { id: "2", text: "Hello! How can I help?", mine: true, time: "10:01" },
  { id: "3", text: "Is the food still available?", mine: false, time: "10:02" },
  { id: "4", text: "Yes it is!", mine: true, time: "10:02" },
  { id: "5", text: "Great, I'll pick it up.", mine: false, time: "10:03" },
  { id: "6", text: "Sure, see you then!", mine: true, time: "10:04" },
  { id: "7", text: "On my way now", mine: false, time: "10:10" },
];

// ─── Component ───────────────────────────────────────────────────────────────
export default function ChatConversation() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  // ─── State ───────────────────────────────────────────────────────────────
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [menuVisible, setMenuVisible] = useState(false);
  const [recording, setRecording] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);

  // ─── Helpers ─────────────────────────────────────────────────────────────
  const getTime = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // ─── Send text ───────────────────────────────────────────────────────────
  const sendMessage = () => {
    if (!message.trim()) return;
    setMessages((prev) => [...prev, { id: String(Date.now()), text: message.trim(), mine: true, time: getTime() }]);
    setMessage("");
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  // ─── Pick image ──────────────────────────────────────────────────────────
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setMessages((prev) => [...prev, { id: String(Date.now()), image: result.assets[0].uri, mine: true, time: getTime() }]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  // ─── Record audio ────────────────────────────────────────────────────────

  const [dotVisible, setDotVisible] = useState(true);
  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(() => setDotVisible((v) => !v), 500);
    return () => clearInterval(interval);
  }, [isRecording]);
  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") return;
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      setIsRecording(true);
    } catch (e) {
      console.log(e);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);
    if (uri) {
      setMessages((prev) => [...prev, { id: String(Date.now()), audio: uri, mine: true, time: getTime() }]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  // ─── Play audio ──────────────────────────────────────────────────────────
  const playAudio = async (uri: string) => {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: false,
      playThroughEarpieceAndroid: false,
    });
    const { sound } = await Audio.Sound.createAsync({ uri }, { volume: 1.0 });
    await sound.playAsync();
  };

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="white" />


        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.avatar}>
            <TouchableOpacity onPress={() => router.push("/UserProfile" as any)}>
              <Image style={{ width: 38, height: 38 }} source={require('../../assets/images/avatar.png')} />
            </TouchableOpacity>
          </View>
          <Text style={styles.headerName}>Username</Text>

          {/* 3 dots + dropdown */}
          <View style={styles.menuWrapper}>
            <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)} style={styles.menuTrigger}>
              <Ionicons name="ellipsis-vertical" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
            {menuVisible && (
              <View style={styles.menu}>
                {["View Profile", "Block", "Report"].map((option, index) => (
                  <TouchableOpacity
                    key={option}
                    style={[styles.menuItem, index < 2 && styles.menuItemBorder]}
                    onPress={() => {
                      setMenuVisible(false)
                      if (option === "View Profile") router.push("/UserProfile" as any);
                      if (option === "Report") router.push("/ReportProfile" as any);
                    }}
                  >
                    
                    <Text style={[styles.menuText, option === "Report" && { color: COLORS.emergencyRed }]} >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* ── Messages + Input ── */}
        <KeyboardAvoidingView
          style={{ flex: 1 , backgroundColor:'#E8EBE1' }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? -3 : 0}
        >
          {/* Messages list */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            renderItem={({ item }) => (
              <View style={[styles.messageRow, item.mine && styles.messageRowMine]}>

                {/* Other user avatar */}
                {!item.mine && (
                  <Image style={styles.avatarSmall} source={require('../../assets/images/avatar.png')} />
                )}

                {/* Bubble */}
                <View style={{ alignItems: item.mine ? "flex-end" : "flex-start" ,flexShrink: 1 }}>
                  {item.image ? (
                    // Image bubble
                    <Image source={{ uri: item.image }} style={styles.imageBubble} />
                  ) : item.audio ? (
                    // Audio bubble
                    <TouchableOpacity
                      style={[styles.bubble, item.mine ? styles.bubbleMine : styles.bubbleOther, styles.audioBubble]}
                      onPress={() => playAudio(item.audio!)}
                    >
                      <Ionicons name="play-circle" size={24} color={item.mine ? COLORS.white : COLORS.primary} />
                      <Text style={[styles.bubbleText, item.mine && styles.bubbleTextMine]}>Voice message</Text>
                    </TouchableOpacity>
                  ) : (
                    // Text bubble
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

          {/* ── Input bar ── */}
          <View style={[styles.inputRow, isRecording && styles.inputRowRecording]}>
            {isRecording ? (
              <View style={styles.recordingIndicator}>
                <View style={[styles.recordingDot, { opacity: dotVisible ? 1 : 0 }]} />
                <Text style={styles.recordingText}>Recording...</Text>
              </View>
            ) : (
              <TextInput
                style={styles.input}
                placeholder="Type a message..."
                placeholderTextColor={COLORS.textMuted}
                value={message}
                onChangeText={setMessage}
                multiline
                onSubmitEditing={sendMessage}
              />
            )}
          <View style={styles.inputActions}>
              {message.trim().length === 0 && (
                <>
                  <TouchableOpacity style={styles.inputIcon} onPress={pickImage}>
                    <Ionicons name="image-outline" size={22} color={COLORS.textMuted} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.inputIcon, isRecording && styles.recordingBtn]}
                    onPressIn={startRecording}
                    onPressOut={stopRecording}
                  >
                    <Ionicons name="mic-outline" size={22} color={isRecording ? COLORS.emergencyRed : COLORS.textMuted} />
                  </TouchableOpacity>
                </>
              )}
              <TouchableOpacity
                style={[styles.sendBtn, message.trim().length > 0 && styles.sendBtnActive]}
                onPress={sendMessage}
              >
                <Ionicons name="send" size={18} color={message.trim().length > 0 ? COLORS.white : COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

        </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "white" },
  green: { backgroundColor: 'rgba(232, 235, 225, 1)', flex: 1, marginHorizontal: 20, marginTop: 5, borderRadius: 20, overflow: "hidden" },

  header: { flexDirection: "row", alignItems: "center", backgroundColor: '#D1D8C4', paddingVertical: SPACING.md, elevation: 2, gap: SPACING.sm },
  backBtn: { marginLeft: 5, marginRight: SPACING.xs },
  avatar: { width: 38, height: 38, borderRadius: BORDER_RADIUS.full, backgroundColor: "#e8c8c8", alignItems: "center", justifyContent: "center" },
  headerName: { flex: 1, fontSize: 15, fontWeight: "700", color: COLORS.textPrimary },

  menuWrapper: { position: "relative" },
  menuTrigger: { padding: SPACING.xs, marginRight: SPACING.sm },
  menu: { position: "absolute", right: 0, top: 30, backgroundColor: COLORS.white, borderRadius: 10, borderWidth: 1, borderColor: '#588157', elevation: 8, zIndex: 999, minWidth: 130, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 8, marginHorizontal: 10 },
  menuItem: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#588157' },
  menuText: { fontSize: 14, color: COLORS.textPrimary, textAlign: "center" },

  messagesList: { padding: SPACING.lg, gap: SPACING.md },
  messageRow: { flexDirection: "row", alignItems: "flex-end", gap: SPACING.sm },
  messageRowMine: { justifyContent: "flex-end" },
  avatarSmall: { width: 28, height: 28, borderRadius: BORDER_RADIUS.full },

  bubble: { maxWidth: "100%", borderRadius: BORDER_RADIUS.lg, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, },
  bubbleOther: { backgroundColor: COLORS.white, borderBottomLeftRadius: 4 },
  bubbleMine: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4,alignSelf: "flex-end" },
  bubbleText: { fontSize: 14, color: COLORS.textPrimary, lineHeight: 20 ,flexWrap: 'wrap'},
  bubbleTextMine: { color: COLORS.white },
  timeText: { fontSize: 10, color: COLORS.textMuted, marginTop: 4, marginHorizontal: SPACING.xs },

  imageBubble: { width: 200, height: 150, borderRadius: BORDER_RADIUS.md, marginBottom: 2 },
  audioBubble: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },

  inputRow: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.white, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: SPACING.sm, borderWidth: 1 , borderColor: 'transparent', },
  input: { flex: 1, backgroundColor: COLORS.cardBg, borderRadius: BORDER_RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, fontSize: 14, color: COLORS.textPrimary, maxHeight: 100 },
  inputActions: { flexDirection: "row", alignItems: "center", gap: 4 },
  inputIcon: { padding: SPACING.xs },
  recordingBtn: { backgroundColor: "rgba(217, 79, 79, 0.1)", borderRadius: BORDER_RADIUS.full, padding: 4 },
  sendBtn: { width: 36, height: 36, borderRadius: BORDER_RADIUS.full, backgroundColor: COLORS.cardBg, alignItems: "center", justifyContent: "center" },
  sendBtnActive: { backgroundColor: COLORS.primary },

  inputRowRecording: { backgroundColor: "rgba(217, 79, 79, 0.06)", borderColor: COLORS.emergencyRed },
  recordingIndicator: { flex: 1, flexDirection: "row", alignItems: "center", gap: SPACING.sm, paddingHorizontal: SPACING.sm },
  recordingDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.emergencyRed },
  recordingText: { fontSize: 14, color: COLORS.emergencyRed, fontWeight: "600" },
});
