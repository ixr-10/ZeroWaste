import { router } from 'expo-router';
import { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function SplashScreen() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace('/auth/login');
    }, 4000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.brandRow}>
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
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#588157',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  logo: {
    width: 98.56,
    height: 81,
    resizeMode: 'contain',
  },
  text: {
    fontWeight: '700',
    fontSize: 32,
    color: '#FFFFFF',
    letterSpacing: 2,
  },
});
