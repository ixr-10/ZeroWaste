import React, { useState, useRef } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
  TextInput, KeyboardAvoidingView, Platform, Image, Alert, ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SPACING, BORDER_RADIUS } from "../../constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../constants/axios";

type Message = {
  id: string;
  text?: string;
  mine: boolean;
};

export default function VerificationChat() {
  const router = useRouter();
  const { otherUserId, otherUsername } = useLocalSearchParams<{
    otherUserId: string;
    otherUsername: string;
    conversationId: string;
  }>();

  const flatListRef = useRef<FlatList>(null);
  const [message, setMessage] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verificationDone, setVerificationDone] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", text: "", mine: false },
    { id: "2", text: "", mine: true },
    { id: "3", text: "", mine: false },
    { id: "4", text: "", mine: true },
    { id: "5", text: "", mine: true },
    { id: "6", text: "", mine: false },
  ]);

  const handleValidate = async () => {
    if (verifyLoading || !otherUserId) return;
    setVerifyLoading(true);
    try {
      const res = await api.post(`users/verify/${otherUserId}/`);
      await AsyncStorage.setItem(`verified_user_${otherUserId}`, "true");
      setVerificationDone(true);
      Alert.alert("✅ Success", res.data.message || "User verified successfully!", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (err: any) {
      Alert.alert("❌ Failed", err.response?.data?.error || "Verification failed.");
    } finally {
      setVerifyLoading(false);
    }
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      text: message.trim(),
      mine: true,
    };
    setMessages([...messages, newMessage]);
    setMessage("");
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <Image
          style={styles.avatar}
          source={require('../../assets/images/avatar.png')}
        />

        <Text style={styles.headerName}>{otherUsername || "Username"}</Text>

        <TouchableOpacity style={styles.menuBtn}>
          <Ionicons name="ellipsis-vertical" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        {/* VERIFICATION BANNER */}
        {!verificationDone ? (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>
              New member — ready to verify their account?
            </Text>
            <View style={styles.bannerButtons}>
              <TouchableOpacity
                style={styles.validateBtn}
                onPress={handleValidate}
                disabled={verifyLoading}
              >
                {verifyLoading
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.validateBtnText}>Validate</Text>
                }
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rejectBtn}
                onPress={() => router.back()}
              >
                <Text style={styles.rejectBtnText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={[styles.banner, styles.bannerSuccess]}>
            <Ionicons name="checkmark-circle" size={18} color="#4A6741" />
            <Text style={[styles.bannerText, { marginLeft: 8 }]}>
              ✅ {otherUsername} has been verified!
            </Text>
          </View>
        )}

        {/* MESSAGES */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          renderItem={({ item }) => (
            <View style={[styles.messageRow, item.mine ? styles.messageRowMine : styles.messageRowOther]}>
              {!item.mine && (
                <Image
                  style={styles.avatarSmall}
                  source={require('../../assets/images/avatar.png')}
                />
              )}
              <View style={[
                styles.bubble,
                item.mine ? styles.bubbleMine : styles.bubbleOther,
                !item.text ? styles.emptyBubble : null
              ]}>
                {item.text ? (
                  <Text style={[styles.bubbleText, item.mine && styles.bubbleTextMine]}>
                    {item.text}
                  </Text>
                ) : null}
              </View>
            </View>
          )}
        />

        {/* INPUT */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
        >
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TouchableOpacity style={styles.inputIcon}>
                <Ionicons name="image-outline" size={24} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.inputIcon}>
                <Ionicons name="mic-outline" size={24} color={COLORS.primary} />
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                value={message}
                onChangeText={setMessage}
                placeholder="Type a message..."
                placeholderTextColor={COLORS.textMuted}
              />

              <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
                <Ionicons name="send-outline" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: '#DDE3D4',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  backBtn: {
    padding: SPACING.xs,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: '#E95D62',
  },
  headerName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  menuBtn: {
    padding: SPACING.xs,
  },
  container: {
    flex: 1,
  },
  banner: {
    backgroundColor: COLORS.white,
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#D5DED0',
  },
  bannerSuccess: {
    borderColor: '#4A6741',
    backgroundColor: '#F0F5EE',
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: "500",
  },
  bannerButtons: {
    flexDirection: "row",
    gap: SPACING.xs,
  },
  validateBtn: {
    backgroundColor: '#4A6741',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
  },
  validateBtnText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: "600",
  },
  rejectBtn: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  rejectBtnText: {
    fontSize: 12,
    color: '#c0392b',
    fontWeight: "600",
  },
  messagesList: {
    padding: SPACING.md,
    gap: SPACING.lg,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: '85%',
  },
  messageRowOther: {
    alignSelf: "flex-start",
    gap: SPACING.sm,
  },
  messageRowMine: {
    alignSelf: "flex-end",
  },
  avatarSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E95D62',
  },
  bubble: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 18,
    minWidth: 80,
  },
  bubbleOther: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 4,
  },
  bubbleMine: {
    backgroundColor: '#588157',
    borderTopRightRadius: 4,
  },
  emptyBubble: {
    height: 44,
    width: 160,
  },
  bubbleText: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  bubbleTextMine: {
    color: COLORS.white,
  },
  inputContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.cardBg,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: '#588157',
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: SPACING.sm,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  inputIcon: {
    padding: SPACING.xs,
  },
  sendBtn: {
    padding: SPACING.xs,
    transform: [{ rotate: '-15deg' }],
  }
});