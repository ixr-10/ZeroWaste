import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      const accessToken = await AsyncStorage.getItem('access_token');

      setTimeout(() => {
        if (!hasSeenOnboarding) {
          router.replace('/(Screens)/OnboardingScreen');
        } else if (!accessToken) {
          router.replace('/auth/login');
        } else {
          router.replace('/(tabs)/HomeScreen');
        }
      }, 500);
    };
    init();
  }, [router]);

  return (
    <View style={{ flex: 1, backgroundColor: '#588157', justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator color="#fff" size="large" />
    </View>
  );
}