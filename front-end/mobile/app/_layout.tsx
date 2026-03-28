import { Stack } from 'expo-router';
import 'react-native-reanimated';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="(Screens)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="(Screens)/AddListingModal"
        options={{ presentation: 'modal' }}
      />
    </Stack>
  );
}
