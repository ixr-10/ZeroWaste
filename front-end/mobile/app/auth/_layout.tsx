import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="confirmation" />
      <Stack.Screen name="final-confirmation" />
      <Stack.Screen name="set-password" />
      <Stack.Screen name="ProfileSetupScreen" />
      <Stack.Screen name="finish-confirm" />
    </Stack>
  );
}
