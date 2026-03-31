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
  primaryLight: '#A4B18A80',
  white: '#FFFFFF',
  textSecondary: '#6B6B6B',
  black: '#1A1A1A',
};

const TABS = [
  { label: 'Home',         icon: 'home',          route: '/(Screens)/HomeScreen'         },
  { label: 'Chat',         icon: 'chatbubble',    route: '/(Screens)/ChatList'         },
  { label: '',             icon: '',              route: '__add__'                       },
  { label: 'Notification', icon: 'notifications', route: '/(Screens)/notifications' },
  { label: 'Profile',      icon: 'person',        route: '/(Screens)/ProfileScreen'      },
];

interface BottomNavBarProps {
  onAddPress?: () => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ onAddPress }) => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const isActive = (route: string) => pathname.includes(route.replace('/(Screens)/', ''));

  return (
    <View style={[
      styles.container,
      { paddingBottom: Math.max(insets.bottom, 10) }
    ]}>
      {TABS.map((tab) => {
        if (tab.route === '__add__') {
          return (
            <TouchableOpacity
              key="add"
              style={styles.addWrapper}
              onPress={onAddPress ?? (() => router.push('/Picture' as any))}
              activeOpacity={0.85}
            >
              <View style={styles.addCircle}>
                <Ionicons name="add" size={30} color={COLORS.black} />
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
              size={22}
              color={active ? COLORS.primary : COLORS.textSecondary}
            />
            <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
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
    fontWeight: '700',
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
