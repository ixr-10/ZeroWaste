import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
//import { FONTS } from "../../front-end/constants/fonts";
import Header from '../../components/Header';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [adresse, setAdresse] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  return (
     <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' ,marginTop:0,}}>
      <Header showBack={true} />
    <ScrollView contentContainerStyle={styles.container}>
    
      <Image source={require('../../assets/images/registerpage.png')} style={styles.image}/>
      <Text style={styles.title}>REGISTER</Text>


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


      <Text style={styles.label}>Username</Text>
      <View style={styles.inputRow}>
      
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={username}
          onChangeText={setUsername}
          //keyboardType="username"
          autoCapitalize="none"
        />
        <Ionicons margin={10}  left= {2} top={5} position={'absolute'} name="person-outline" size={20} color="black" />
      </View>

      <Text style={styles.label}>Phone Number</Text>
      <View style={styles.inputRow}>
      
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={phone}
          onChangeText={setPhone}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Ionicons margin={10}  left= {2} top={5} position={'absolute'} name="call-outline" size={20} color="black" />
      </View>


      <Text style={styles.label}>Adresse</Text>
      <View style={styles.inputRow}>
      
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={adresse}
          onChangeText={setAdresse}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Ionicons margin={10}  left= {2} top={5} position={'absolute'} name="location-outline" size={20} color="black" />
      </View>

      


      <Text style={styles.label}>Password</Text>
      <View style={styles.inputRow}>
        <Ionicons margin={10}  left= {2} top={5} position={'absolute'} name="lock-closed-outline" size={20} color="black" />
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
          <Text style={styles.eyeText}>{showPassword ? <Ionicons name="eye" size={24} color="black" /> : <Ionicons name="eye-off-outline" size={24} color="black" />}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Confirm Password</Text>
      <View style={styles.inputRow}>
        <Ionicons margin={10}  left= {2} top={5} position={'absolute'} name="lock-closed-outline" size={20} color="black" />
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={confirmPass}
          onChangeText={setConfirmPass}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
          <Text style={styles.eyeText}>{showPassword ? <Ionicons name="eye" size={24} color="black" /> : <Ionicons name="eye-off-outline" size={24} color="black" />}</Text>
        </TouchableOpacity>
      </View>



      <TouchableOpacity style={styles.button} onPress={() => router.replace('/(tabs)')} >
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <View
        style={{
          height: 1,           // thickness of the line
          backgroundColor: 'black', // color of the line
          marginVertical: 10, 
          marginHorizontal: 65, // spacing above & below
        }}
      />

      <Text style={styles.bottomText}>
        Already have an account?{' '}
        <Text style={styles.link} onPress={() => router.push('./login')}>Login</Text>
      </Text>
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
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 32, color: '#1a1a1a' },
  label: { fontSize: 16, color: 'black', marginBottom: 6 },
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
  button: { backgroundColor: '#588157',  paddingHorizontal: 20, width: 96,   paddingVertical: 10, borderRadius: 25, alignItems: 'center', marginBottom: 24 , alignSelf: 'center', },
  buttonText: { color: 'black', fontWeight: '700', fontSize: 16 },
  bottomText: { textAlign: 'center', color: 'black', fontSize: 13 },
  link: { color: '#588157', fontWeight: '600' ,textDecorationLine: 'underline',  },
  image:{width:285, height:285},
});