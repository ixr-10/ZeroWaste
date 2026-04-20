import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ReservationAcceptedModal from '../components/ReservationAcceptedModal';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      {/*
        ReservationAcceptedModal sits here at the root so it can appear
        on top of ANY screen (tabs, slides, etc.) right after login.
        It is self-contained: it checks AsyncStorage for a token,
        fetches accepted reservations, and only shows if there's a new one.
      */}
      <ReservationAcceptedModal />

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(Screens)/OnboardingScreen" />
        <Stack.Screen name="(Screens)/MapScreen" />
        <Stack.Screen name="(Screens)/SettingsScreen" />
        <Stack.Screen name="(Screens)/PersonalInfoScreen" />
        <Stack.Screen name="(Screens)/ChangeEmailScreen" />
        <Stack.Screen name="(Screens)/ChangePasswordScreen" />
        <Stack.Screen name="(Screens)/DeactivateAccountScreen" />
        <Stack.Screen name="(Screens)/DeleteAccountScreen" />
        <Stack.Screen name="(Screens)/ReservationScreen" />
        <Stack.Screen name="(Screens)/ChatConversation" />
        <Stack.Screen name="(Screens)/UserProfile" />
        <Stack.Screen name="(Screens)/ReportProfile" />
        <Stack.Screen name="(Screens)/ReportPost" />
      </Stack>
    </SafeAreaProvider>
  );
}