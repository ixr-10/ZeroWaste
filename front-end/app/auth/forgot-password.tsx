import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,Alert } from 'react-native';
import { FONTS } from "../../constants/fonts";
import Header from '../../components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../constants/axios';


export default function LoginScreen() {

  
  const [email, setEmail] = useState('');
 

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' ,marginTop:0,}}>
      <Header showBack={true} />
    <ScrollView contentContainerStyle={styles.container}>
      

      <Image source={require('../../assets/images/reset pass.png')} style={styles.image}/>
      <Text style={styles.title}>RESET PASSWORD</Text>


      <Text style={styles.label}>Email</Text>
      <View style={styles.inputRow}>
      
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Ionicons margin={10}  left= {2} top={5} position={'absolute'} name="mail-outline" size={20} color="black" />
      </View>
      
      <TouchableOpacity style={styles.button}  onPress={async () => {
  if (!email) {
    Alert.alert('Error', 'Please enter your email.');
    return;
  }
  try {
    await api.post('/api/users/forgot-password/', { email });
    Alert.alert('Success', 'Reset code sent to your email.');
    router.push({ pathname: '/(tabs)', params: { email } });
  } catch (err: any) {
    Alert.alert('Error', err.response?.data?.error || 'Something went wrong.');
  }
}}  >
        <Text style={styles.buttonText}>Reset</Text>
      </TouchableOpacity>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  logo : {width:36,height:29.03,resizeMode: 'contain',
    position: 'absolute',  // ⬅️ key
    top: 20,               // distance from top
    right: 20,},
  container: { flexGrow: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 32, color: '#1a1a1a' ,fontFamily:FONTS.bold},
  label: { fontSize: 16, color: 'black', marginBottom: 6 ,fontFamily:FONTS.regular},
  input: { borderWidth: 1, borderColor: '#588157',opacity:0.5, borderRadius: 20, padding: 12, marginBottom: 16, fontSize: 14 ,
  },
  inputRow: { flexDirection: 'row',
     alignItems: 'center', 
     marginBottom: 8 ,
     },
  eyeBtn: { position: 'absolute', 
    right: 12,
     top: 12 },
  eyeText: { fontSize: 18 },
  forgot: { color: 'black', marginBottom: 24, fontSize: 13, textAlign: 'center',textDecorationLine: 'underline', fontWeight:400,},
  button: { backgroundColor: '#588157',  paddingHorizontal: 20, width: 81,   paddingVertical: 10, borderRadius: 25, alignItems: 'center', marginBottom: 24 , alignSelf: 'center', },
  buttonText: { color: 'black', fontWeight: '700', fontSize: 16, fontFamily:FONTS.bold, },
  bottomText: { textAlign: 'center', color: 'black', fontSize: 13 },
  link: { color: '#588157', fontWeight: '600' ,textDecorationLine: 'underline',  },
  image:{width:285, height:285},
});