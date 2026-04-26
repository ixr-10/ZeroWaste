import { Tabs } from 'expo-router';
import 'react-native-reanimated';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, 
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="login" />
      <Tabs.Screen name="Notifications" />
      <Tabs.Screen name="Profile" />
      <Tabs.Screen name="slides" />
    </Tabs>
  );
}