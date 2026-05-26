import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
  primary: '#4A6741',
  primaryLight: '#D7E1CF',
  white: '#FFFFFF',
  textSecondary: '#6B6B6B',
  black: '#1A1A1A',
};

const TABS = [
  { label: 'Home',         icon: 'home',          route: '/../(tabs)/HomeScreen' },
  { label: 'Chat',         icon: 'chatbubble',    route: '/../(tabs)/ChatList' },
  { label: '',             icon: '',              route: '__add__' },
  { label: 'Notification', icon: 'notifications', route: '/../(tabs)/Notifications' },
  { label: 'Profile',      icon: 'person',        route: '/../(tabs)/ProfileScreen' },
];

interface BottomNavBarProps {
  onAddPress?: () => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ onAddPress }) => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const isActive = (route: string) =>
    route !== '__add__' && pathname.includes(route.split('/').pop() || '');

  return (
    <View style={[
      styles.container,
      {
        bottom: Math.max(insets.bottom, 0),
        paddingBottom: 18,
      }
    ]}>
      {TABS.map((tab) => {
        if (tab.route === '__add__') {
          return (
            <TouchableOpacity
              key="add"
              style={styles.addWrapper}
              onPress={onAddPress ?? (() => router.push('/(tabs)/Picture' as any))}
              activeOpacity={0.85}
            >
              <View style={styles.addCircle}>
                <Ionicons name="add" size={37} color={COLORS.black} />
              </View>
            </TouchableOpacity>
          );
        }

        const active = isActive(tab.route);

        return (
          <TouchableOpacity
            key={tab.route}
            style={styles.tabItem}
            onPress={() => router.push(tab.route as any)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={(active ? tab.icon : `${tab.icon}-outline`) as any}
              size={25}
              color={active ? COLORS.primary : COLORS.textSecondary}
            />
            <Text
              style={[styles.tabLabel, active && styles.tabLabelActive]}
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
};

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
