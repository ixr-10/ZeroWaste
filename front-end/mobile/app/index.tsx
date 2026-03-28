import { router } from 'expo-router';
import { useEffect } from 'react';
import { Image, StyleSheet, View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from "expo-router";

export default function SplashScreen() {
  // useEffect(() => {
  //   const init = async () => {
  //     await AsyncStorage.clear(); // ← REMOVE AFTER ONE RUN
  //     setTimeout(() => {
  //       router.replace('/auth/login');
  //     }, 500); // small delay to let layout mount
  //   };
  //   init();
  // }, []);

  return (
    <Redirect href="/Picture" />
    // <View style={styles.container}>
    //   <View style={styles.imgandlogo}>
    //     <Image source={require('../assets/images/logo.png')} style={styles.logo} />
    //     <View>
    //       <Text style={styles.text}>ZER0</Text>
    //       <Text style={styles.text}>WASTE</Text>
    //     </View>
    //   </View>
    // </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#588157' },
  logo: { width: 98.56, height: 81, resizeMode: 'contain' },
  imgandlogo: { flexDirection: 'row' },
  text: { fontWeight: '700', fontSize: 32, color: 'white', letterSpacing: 2 },
});