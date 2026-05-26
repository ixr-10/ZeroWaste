import { Ionicons } from '@expo/vector-icons';
import { Tabs, usePathname, useRouter } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import 'react-native-reanimated';

const COLORS = {
  primary: '#4A6741',
  primaryLight: '#D7E1CF',
  white: '#FFFFFF',
  textSecondary: '#6B6B6B',
  black: '#1A1A1A',
};

const TAB_ITEMS = [
  { screen: '/(tabs)/HomeScreen', icon: 'home', label: 'Home' },
  { screen: '/(tabs)/ChatList', icon: 'chatbubble', label: 'Chat' },
  { screen: '/(tabs)/Picture', icon: 'add', label: '' },
  { screen: '/(tabs)/Notifications', icon: 'notifications', label: 'Notification' },
  { screen: '/(tabs)/ProfileScreen', icon: 'person', label: 'Profile' },
];

export const unstable_settings = {
  anchor: '(tabs)',
};

function CustomTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const handlePress = (screen: string) => {
    router.push(screen as never);
  };

  const isActive = (screen: string) => pathname.includes(screen.split('/').pop() || '');

  return (
    <View
      style={[
        styles.container,
        {
          bottom: Math.max(insets.bottom, 0),
          paddingBottom: 18,
        },
      ]}
    >
      {TAB_ITEMS.slice(0, 2).map((tab) => (
        <TouchableOpacity
          key={tab.screen}
          style={styles.tabItem}
          onPress={() => handlePress(tab.screen)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={(isActive(tab.screen) ? tab.icon : `${tab.icon}-outline`) as any}
            size={25}
            color={isActive(tab.screen) ? COLORS.primary : COLORS.textSecondary}
          />
          <Text
            style={[styles.tabLabel, isActive(tab.screen) && styles.tabLabelActive]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={styles.addWrapper}
        onPress={() => router.push('/(tabs)/Picture' as never)}
        activeOpacity={0.85}
      >
        <View style={styles.addCircle}>
          <Ionicons name="add" size={37} color={COLORS.black} />
        </View>
      </TouchableOpacity>

      {TAB_ITEMS.slice(3).map((tab) => {
        return (
          <TouchableOpacity
            key={tab.screen}
            style={styles.tabItem}
            onPress={() => handlePress(tab.screen)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={(isActive(tab.screen) ? tab.icon : `${tab.icon}-outline`) as any}
              size={25}
              color={isActive(tab.screen) ? COLORS.primary : COLORS.textSecondary}
            />
            <Text
              style={[styles.tabLabel, isActive(tab.screen) && styles.tabLabelActive]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={() => <CustomTabBar />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="HomeScreen" />
      <Tabs.Screen name="ChatList" />
      <Tabs.Screen name="Picture" />
      <Tabs.Screen name="Notifications" />
      <Tabs.Screen name="Notificationss" />
      <Tabs.Screen name="ProfileScreen" />
      <Tabs.Screen name="slides" />
      <Tabs.Screen name="Profile" />
      <Tabs.Screen name="Quantity" />
      <Tabs.Screen name="Localization" />
      <Tabs.Screen name="Details" />
      <Tabs.Screen name="index" />
      <Tabs.Screen name="chat" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.primaryLight,
    paddingTop: 14,
    paddingHorizontal: 10,
    alignItems: 'flex-end',
    borderTopWidth: 0,
    borderTopLeftRadius: 31,
    borderTopRightRadius: 31,
    borderBottomLeftRadius: 31,
    borderBottomRightRadius: 31,
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 100,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    gap: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  addWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -42,
  },
  addCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 6,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 9,
  },
});
