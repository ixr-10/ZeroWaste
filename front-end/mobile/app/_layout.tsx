import { Stack } from 'expo-router';
import 'react-native-reanimated';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="(Screens)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(Screens)/AddListingModal" options={{ presentation: 'modal' }} />
      <Stack.Screen name="(Screens)/SettingsScreen" />
      <Stack.Screen name="(Screens)/PersonalInfoScreen" />
      <Stack.Screen name="(Screens)/ChangeEmailScreen" />
      <Stack.Screen name="(Screens)/ChangePasswordScreen" />
      <Stack.Screen name="(Screens)/DeactivateAccountScreen" />
      <Stack.Screen name="(Screens)/DeleteAccountScreen" />
    </Stack>
  );
}