import React, { useState, useRef } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
  TextInput, KeyboardAvoidingView, Platform, Image
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SPACING, BORDER_RADIUS } from "../../constants/theme";

type Message = {
  id: string;
  text?: string;
  mine: boolean;
};

export default function VerificationChat() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", text: "", mine: false }, // Placeholder for empty bubbles in UI mock
    { id: "2", text: "", mine: true },
    { id: "3", text: "", mine: false },
    { id: "4", text: "", mine: true },
    { id: "5", text: "", mine: true },
    { id: "6", text: "", mine: false },
  ]);

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

        <Text style={styles.headerName}>Username</Text>

        <TouchableOpacity style={styles.menuBtn}>
          <Ionicons name="ellipsis-vertical" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        {/* VERIFICATION BANNER */}
        <View style={styles.banner}>
          <Text style={styles.bannerText}>New member — ready to verify their account?</Text>
          <View style={styles.bannerButtons}>
            <TouchableOpacity style={styles.bannerBtn}>
              <Text style={styles.bannerBtnText}>Validate</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bannerBtn}>
              <Text style={styles.bannerBtnText}>Reject</Text>
            </TouchableOpacity>
          </View>
        </View>

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
                placeholder=""
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
    backgroundColor: COLORS.cardBg, // Using the light green card bg for the whole screen
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: '#DDE3D4', // Closer to the light green in image
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
  bannerBtn: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  bannerBtnText: {
    fontSize: 12,
    color: COLORS.textPrimary,
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
    borderRadius: 18, // Uniform rounding for all corners
    minWidth: 80,
  },
  bubbleOther: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 4, // Subtle characteristic
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
