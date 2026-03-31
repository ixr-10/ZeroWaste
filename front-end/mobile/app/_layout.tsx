import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
  <Stack.Screen name="index" />        {/* ← FIRST = initial route */}
  <Stack.Screen name="Picture" />
  <Stack.Screen name="auth" />
  <Stack.Screen name="(tabs)" />
  <Stack.Screen name="(Screens)/HomeScreen" />
  <Stack.Screen name="(Screens)/OnboardingScreen" />
  <Stack.Screen name="(Screens)/ChatList" />
  <Stack.Screen name="(Screens)/notifications" />
  <Stack.Screen name="(Screens)/ProfileScreen" />
  <Stack.Screen name="(Screens)/MapScreen" />
  <Stack.Screen name="(Screens)/SettingsScreen" />
  <Stack.Screen name="(Screens)/PersonalInfoScreen" />
  <Stack.Screen name="(Screens)/ChangeEmailScreen" />
  <Stack.Screen name="(Screens)/ChangePasswordScreen" />
  <Stack.Screen name="(Screens)/DeactivateAccountScreen" />
  <Stack.Screen name="(Screens)/DeleteAccountScreen" />
  <Stack.Screen name="(Screens)/ReservationScreen" />
</Stack>
    </SafeAreaProvider>
  );
}
