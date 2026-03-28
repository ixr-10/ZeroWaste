import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Image, StyleSheet, View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');

      setTimeout(() => {
        if (!hasSeenOnboarding) {
          // First ever launch → Onboarding
          router.replace('/(Screens)/OnboardingScreen');
        } else if (!isLoggedIn) {
          // Seen onboarding but not logged in → Login
          router.replace('/auth/login');
        } else {
          // Fully authenticated → Main app (Home tab)
          router.replace('/(tabs)/slides');
        }
      }, 500);
    };
    init();
  }, [router]);

  return (
    <View style={styles.container}>
      <View style={styles.imgandlogo}>
        <Image source={require('../assets/images/logo.png')} style={styles.logo} />
        <View>
          <Text style={styles.text}>ZER0</Text>
          <Text style={styles.text}>WASTE</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#588157' },
  logo: { width: 98.56, height: 81, resizeMode: 'contain' },
  imgandlogo: { flexDirection: 'row' },
  text: { fontWeight: '700', fontSize: 32, color: 'white', letterSpacing: 2 },
});