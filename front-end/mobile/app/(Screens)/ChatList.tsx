import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  StatusBar,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { SearchBar } from "../../components/SearchBar";
import { COLORS, SPACING, BORDER_RADIUS } from "../../constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchMyConversations } from "../../constants/axios";
import axios from "../../constants/axios";

export default function ChatList() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const userStr = await AsyncStorage.getItem("user");
        
        // ✅ Use a local variable, not state
        let userId: number | null = null;
        if (userStr) {
          const user = JSON.parse(userStr);
          userId = user.id;
          setCurrentUserId(userId);
        }

        const res = await fetchMyConversations();

        const uniqueConversations = Object.values(
  res.data.reduce((acc: Record<string, any>, conv: any) => {
    const otherUserId =
      conv.donor === userId ? conv.beneficiary : conv.donor;

    // ✅ Key by user only, not donation+user
    const key = `${otherUserId}`;

    const lastMsgTime = new Date(
      conv.last_message?.created_at || 0
    ).getTime();

    if (
      !acc[key] ||
      lastMsgTime >
        new Date(acc[key].last_message?.created_at || 0).getTime()
    ) {
      acc[key] = conv;
    }
    return acc;
  }, {})
);

        uniqueConversations.sort((a: any, b: any) => {
          const timeA = new Date(a.last_message?.created_at || 0).getTime();
          const timeB = new Date(b.last_message?.created_at || 0).getTime();
          return timeB - timeA;
        });

        setConversations(uniqueConversations);
      } catch (err: any) {
        console.log("Error loading conversations:", err);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, []); // ✅ Run only once on mount, no need for currentUserId dependency

  const getOtherUser = (conv: any) => {
    if (!currentUserId) return { id: "", username: "Unknown" };
    if (conv.donor === currentUserId) {
      return { id: conv.beneficiary, username: conv.beneficiary_username || "User" };
    }
    return { id: conv.donor, username: conv.donor_username || "User" };
  };

  const filteredConversations = conversations.filter((c) => {
    const other = getOtherUser(c);
    return other.username.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <View style={styles.searchWrapper}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search conversations..."
        />
      </View>

      <View style={styles.green}>
        {loading ? (
          <View style={{ alignItems: "center", paddingTop: 40 }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredConversations}
            keyExtractor={(item) => `conv-${item.id}`}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <View style={{ alignItems: "center", paddingTop: 40 }}>
                <Text style={{ color: COLORS.textMuted }}>
                  No conversations yet
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const otherUser = getOtherUser(item);
              const lastMsg = item.last_message;

              return (
                <TouchableOpacity
                  style={styles.chatCard}
                  onPress={async () => {
                    // Optimistically clear unread count
                    setConversations((prev) =>
                      prev.map((c) =>
                        c.id === item.id ? { ...c, unread_count: 0 } : c
                      )
                    );

                    // Notify backend that messages are read
                    try {
                      await markConversationAsRead(item.id);
                    } catch (err) {
                      console.log("Failed to mark as read:", err);
                    }

                    router.push({
                      pathname: "/ChatConversation" as any,
                      params: {
                        conversationId: item.id.toString(),
                        otherUsername: otherUser.username,
                      },
                    });
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.avatar}>
                    <Image
                      style={{ width: 46, height: 46 }}
                      source={require("../../assets/images/avatar.png")}
                    />
                    <View style={styles.onlineDot} />
                  </View>

                  <View style={styles.chatContent}>
                    <View style={styles.chatTop}>
                      <Text style={styles.chatName}>{otherUser.username}</Text>
                      <Text style={styles.chatTime}>
                        {lastMsg
                          ? new Date(lastMsg.created_at).toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" }
                            )
                          : ""}
                      </Text>
                    </View>
                    <View style={styles.chatBottom}>
                      <Text
                        style={styles.chatLastMessage}
                        numberOfLines={1}
                      >
                        {lastMsg
                          ? lastMsg.content
                          : item.donation_title || "New conversation"}
                      </Text>
                      {item.unread_count > 0 && (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadText}>
                            {item.unread_count}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

export const markConversationAsRead = (conversationId: string | number) => {
  return axios.post(`/chat/${conversationId}/read/`);
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "white" },
  green: {
    backgroundColor: "rgba(232, 235, 225, 1)",
    flexGrow: 1,
    borderRadius: 20,
    padding: 10,
    marginHorizontal: 20,
    marginTop: 5,
  },
  searchWrapper: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    paddingTop: SPACING.md,
    zIndex: 100,
  },
  list: { paddingBottom: SPACING.xl },
  separator: { height: SPACING.sm },
  chatCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 245, 245, 1)",
    borderRadius: 16,
    padding: SPACING.md,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: "rgba(88, 129, 87, 1)",
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: "#e8c8c8",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    position: "absolute",
    bottom: 1,
    right: 1,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  chatContent: { flex: 1 },
  chatTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  chatName: { fontSize: 14, fontWeight: "700", color: COLORS.textPrimary },
  chatTime: { fontSize: 11, color: COLORS.textMuted },
  chatBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chatLastMessage: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
  },
  unreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadText: { fontSize: 10, color: COLORS.white, fontWeight: "700" },
});
