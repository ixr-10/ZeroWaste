import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import 'react-native-reanimated';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#A4B18A80' },
        tabBarActiveTintColor: 'black',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: () => <Ionicons name="home-outline" color="black" size={20} />,
        }}
      />
      <Tabs.Screen
        name="Notifications"
        options={{
          tabBarIcon: () => <Ionicons name="notifications-outline" color="black" size={20} />,
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          tabBarIcon: () => <Ionicons name="person-outline" color="black" size={20} />,
        }}
      />
      <Tabs.Screen
        name="slides"
        options={{
          tabBarIcon: () => <Ionicons name="camera-outline" color="black" size={20} />,
        }}
      />
    </Tabs>
  );
}
