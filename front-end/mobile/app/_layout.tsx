import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(Screens)/HomeScreen" />
        <Stack.Screen name="(Screens)/OnboardingScreen" />
        <Stack.Screen name="(Screens)/ChatScreen" />
        <Stack.Screen name="(Screens)/NotificationScreen" />
        <Stack.Screen name="(Screens)/ProfileScreen" />
        <Stack.Screen name="(Screens)/MapScreen" />
        <Stack.Screen name="(Screens)/SettingsScreen" />
        <Stack.Screen name="(Screens)/PersonalInfoScreen" />
        <Stack.Screen name="(Screens)/ChangeEmailScreen" />
        <Stack.Screen name="(Screens)/ChangePasswordScreen" />
        <Stack.Screen name="(Screens)/DeactivateAccountScreen" />
        <Stack.Screen name="(Screens)/DeleteAccountScreen" />
        <Stack.Screen name="(Screens)/ReservationScreen" />
        <Stack.Screen
          name="(Screens)/AddListingModal"
          options={{ presentation: 'modal' }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
