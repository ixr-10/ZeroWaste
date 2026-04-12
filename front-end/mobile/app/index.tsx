import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      const accessToken = await AsyncStorage.getItem('access'); // ✅ matches what login.tsx saves

      setTimeout(() => {
        if (!hasSeenOnboarding) {
          // First ever launch → Onboarding
          router.replace('/(Screens)/OnboardingScreen');
        } else if (!accessToken) {
          // Seen onboarding but not logged in → Login
          router.replace('/auth/login');
        } else {
          // Fully authenticated → Main app (Home tab)
          router.replace('/(tabs)/HomeScreen');
        }
      }, 500);
    };
    init();
  }, [router]);

  // Green splash background while checking
  return (
    <View style={{ flex: 1, backgroundColor: '#588157', justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator color="#fff" size="large" />
    </View>
  );
}