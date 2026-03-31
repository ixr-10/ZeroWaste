import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, StatusBar ,Image} from "react-native";
import { useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { SearchBar } from "../../components/SearchBar";
import { COLORS, SPACING, BORDER_RADIUS } from "../../constants/theme";

const CHATS = [
  { id: "1", name: "ibtihal", lastMessage: "Sure, see you then!", time: "10:30", unread: 2 },
  { id: "2", name: "ibti", lastMessage: "Is it still available?", time: "09:15", unread: 0 },
  { id: "3", name: "Username", lastMessage: "Thank you!", time: "Yesterday", unread: 0 },
  { id: "4", name: "Username", lastMessage: "On my way now", time: "Yesterday", unread: 1 },
];

export default function ChatList() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = CHATS.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor='white' />
    
      {/* Search */}
      <View style={styles.searchWrapper}>
        {/* <Ionicons name="search-outline" size={18} color={'black'}></Ionicons> */}
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search conversations..."
        />
      </View>

      <View style={styles.green}>
        {/* Chat List */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.chatCard}
              onPress={() => router.push("/ChatConversation" as any)}
              activeOpacity={0.7}
            >
              {/* Avatar */}
              <View style={styles.avatar}>
                <Image style={{width:46,height:46}} source={require('../../assets/images/avatar.png')}/>
                <View style={styles.onlineDot} />
              </View>

              {/* Content */}
              <View style={styles.chatContent}>
                <View style={styles.chatTop}>
                  <Text style={styles.chatName}>{item.name}</Text>
                  <Text style={styles.chatTime}>{item.time}</Text>
                </View>
                <View style={styles.chatBottom}>
                  <Text style={styles.chatLastMessage} numberOfLines={1}>{item.lastMessage}</Text>
                  {item.unread > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{item.unread}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

    
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor:'white' },

  green:{backgroundColor:'rgba(232, 235, 225, 1)',flexGrow:1, borderRadius:20,
    padding:10,
    marginHorizontal:20,
    marginTop:5,
  },

  searchWrapper: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md , flexDirection: 'row',
    alignItems: 'center',
    // paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    // paddingBottom: SPACING.sm,
    zIndex: 100,},

  list: {  paddingBottom: SPACING.xl },
  separator: { height: SPACING.sm },

  chatCard: { flexDirection: "row", alignItems: "center", backgroundColor: 'rgba(245, 245, 245, 1)', borderRadius: 16, padding: SPACING.md, gap: SPACING.md ,borderWidth:1, borderColor:'rgba(88, 129, 87, 1)'},

  avatar: { width: 46, height: 46, borderRadius: BORDER_RADIUS.full, backgroundColor: "#e8c8c8", alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 22 },
  onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary, position: "absolute", bottom: 1, right: 1, borderWidth: 1.5, borderColor: COLORS.white },

  chatContent: { flex: 1 },
  chatTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  chatName: { fontSize: 14, fontWeight: "700", color: COLORS.textPrimary },
  chatTime: { fontSize: 11, color: COLORS.textMuted },
  chatBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  chatLastMessage: { flex: 1, fontSize: 12, color: COLORS.textSecondary, marginRight: SPACING.sm },

  unreadBadge: { width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center" },
  unreadText: { fontSize: 10, color: COLORS.white, fontWeight: "700" },

  tabBar: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.white, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg, borderTopWidth: 1, borderTopColor: COLORS.border, elevation: 8 },
  tabItem: { flex: 1, alignItems: "center", gap: 3 },
  tabLabel: { fontSize: 10, color: COLORS.textMuted },
  fabBtn: { width: 52, height: 52, borderRadius: BORDER_RADIUS.full, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center", marginHorizontal: SPACING.sm, elevation: 4, bottom: 10 },
});
