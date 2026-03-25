import { Stack } from 'expo-router';

export default function TabsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="confirmation" />
      <Stack.Screen name="final-confirmation" />
      <Stack.Screen name="set-password" />
      <Stack.Screen name="ProfileSetupScreen" />
      <Stack.Screen name="finish-confirm" />
    </Stack>
  );
}
