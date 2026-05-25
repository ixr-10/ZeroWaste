import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import 'react-native-reanimated';

const COLORS = {
  primary: '#4A6741',
  primaryLight: '#A4B18A80',
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
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePress = (index: number, screen: string) => {
    setActiveIndex(index);
    router.push(screen as never);
  };

  return (
    <View style={styles.container}>
      {TAB_ITEMS.slice(0, 2).map((tab, i) => (
        <TouchableOpacity
          key={tab.screen}
          style={styles.tabItem}
          onPress={() => handlePress(i, tab.screen)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={(i === activeIndex ? tab.icon : `${tab.icon}-outline`) as any}
            size={22}
            color={i === activeIndex ? COLORS.primary : COLORS.textSecondary}
          />
          <Text style={[styles.tabLabel, i === activeIndex && styles.tabLabelActive]}>
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
          <Ionicons name="add" size={32} color={COLORS.black} />
        </View>
      </TouchableOpacity>

      {TAB_ITEMS.slice(3).map((tab, i) => {
        const index = i + 3;
        return (
          <TouchableOpacity
            key={tab.screen}
            style={styles.tabItem}
            onPress={() => handlePress(index, tab.screen)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={(index === activeIndex ? tab.icon : `${tab.icon}-outline`) as any}
              size={22}
              color={index === activeIndex ? COLORS.primary : COLORS.textSecondary}
            />
            <Text style={[styles.tabLabel, index === activeIndex && styles.tabLabelActive]}>
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
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    paddingTop: 8,
    paddingHorizontal: 4,
    alignItems: 'flex-end',
    borderTopWidth: 0,
    borderRadius: 25,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
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
    marginTop: -26,
  },
  addCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 4,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
});
