import { Tabs, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: '#4A6741',
  primaryLight: '#A4B18A80',
  white: '#FFFFFF',
  textSecondary: '#6B6B6B',
  black: '#1A1A1A',
};

type TabItem = {
  routeName: string;
  screen: string;       // actual file in (Screens)/
  iconBase: string;
  label: string;
};

const TAB_ITEMS: TabItem[] = [
  { routeName: 'home',         screen: '/(Screens)/HomeScreen',         iconBase: 'home',          label: 'Home'         },
  { routeName: 'chat',         screen: '/(Screens)/ChatScreen',         iconBase: 'chatbubble',    label: 'Chat'         },
  { routeName: 'notification', screen: '/(Screens)/NotificationScreen', iconBase: 'notifications', label: 'Notification' },
  { routeName: 'profile',      screen: '/(Screens)/ProfileScreen',      iconBase: 'person',        label: 'Profile'      },
];

function CustomTabBar({ state, navigation }: any) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);

  // Build the visual slots: 2 tabs | + button | 2 tabs
  const leftTabs  = TAB_ITEMS.slice(0, 2);
  const rightTabs = TAB_ITEMS.slice(2, 4);

  const handleTab = (screen: string, index: number) => {
    setActiveIndex(index);
    router.push(screen as any);
  };

  const renderTab = (tab: TabItem, visualIndex: number) => {
    const isFocused = activeIndex === visualIndex;
    return (
      <TouchableOpacity
        key={tab.routeName}
        style={styles.tabItem}
        onPress={() => handleTab(tab.screen, visualIndex)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={(isFocused ? tab.iconBase : `${tab.iconBase}-outline`) as any}
          size={22}
          color={isFocused ? COLORS.primary : COLORS.textSecondary}
        />
        <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
          {tab.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Left: Home + Chat */}
      {leftTabs.map((tab, i) => renderTab(tab, i))}

      {/* Centre + button */}
      <TouchableOpacity
        style={styles.addWrapper}
        onPress={() => router.push('/(Screens)/AddListingModal')}
        activeOpacity={0.85}
      >
        <View style={styles.addCircle}>
          <Ionicons name="add" size={30} color={COLORS.black} />
        </View>
      </TouchableOpacity>

      {/* Right: Notification + Profile */}
      {rightTabs.map((tab, i) => renderTab(tab, i + 2))}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {/* These are placeholder screens so Expo Router is happy.
          Navigation actually pushes to (Screens)/ routes. */}
      <Tabs.Screen name="slides"        options={{ title: 'Home' }}         />
      <Tabs.Screen name="Notifications" options={{ title: 'Notification' }} />
      <Tabs.Screen name="Profile"       options={{ title: 'Profile' }}      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.primaryLight,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 8,
    paddingHorizontal: 4,
    alignItems: 'flex-end',
    borderTopWidth: 0,
    borderRadius: 25,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
    gap: 3,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  tabLabelActive: {
    color: COLORS.primary,
  },
  addWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
  },
  addCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 3,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 5,
  },
});