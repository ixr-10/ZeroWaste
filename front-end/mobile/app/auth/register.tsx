import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header2 from '../../components/Header2';
import api from '../../constants/axios';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [phone, setPhone] = useState('');
  const [adresse, setAdresse] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const handleRegister = async () => {
    if (!email || !username || !phone || !adresse || !password || !confirmPass) {
      alert('Please fill in all fields.');
      return;
    }
    if (password !== confirmPass) {
      alert('Passwords do not match.');
      return;
    }

    try {
      const { data } = await api.post('/users/register/', {
        username,
        email,
        phone,
        address: adresse,
        password,
        password2: confirmPass,
        role: 'user',
      });

      router.push({
        pathname: '/auth/confirmationEmail' as any,
        params: { email: data.user?.email || email },
      });

    } catch (err: any) {
      const errors = err.response?.data;
      if (errors?.email) {
        alert('This email is already registered. Try logging in.');
      } else if (errors?.username) {
        alert('This username is already taken. Choose another one.');
      } else if (errors?.password) {
        alert('Password error: ' + (errors.password[0] || 'Invalid password'));
      } else if (!err.response) {
        alert('Network error. Check your connection and try again.');
      } else {
        alert('Registration failed: ' + JSON.stringify(errors));
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', marginTop: 0 }}>
      <Header2 showBack={true} />
      <ScrollView contentContainerStyle={styles.container}>

        <Image source={require('../../assets/images/register.png')} style={styles.image} />
        <Text style={styles.title}>REGISTER</Text>

        <Text style={styles.label}>Email</Text>
        <View style={styles.inputRow}>
          <Ionicons margin={10} left={2} top={5} position={'absolute'} name="mail-outline" size={20} color="black" />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <Text style={styles.label}>Username</Text>
        <View style={styles.inputRow}>
          <Ionicons margin={10} left={2} top={5} position={'absolute'} name="person-outline" size={20} color="black" />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        <Text style={styles.label}>Phone Number</Text>
        <View style={styles.inputRow}>
          <Ionicons margin={10} left={2} top={5} position={'absolute'} name="call-outline" size={20} color="black" />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoCapitalize="none"
          />
        </View>

        <Text style={styles.label}>Adresse</Text>
        <View style={styles.inputRow}>
          <Ionicons margin={10} left={2} top={5} position={'absolute'} name="location-outline" size={20} color="black" />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={adresse}
            onChangeText={setAdresse}
            keyboardType="default"
            autoCapitalize="none"
          />
        </View>

        <Text style={styles.label}>Password</Text>
        <View style={styles.inputRow}>
          <Ionicons margin={10} left={2} top={5} position={'absolute'} name="lock-closed-outline" size={20} color="black" />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
            {showPassword
              ? <Ionicons name="eye" size={24} color="black" />
              : <Ionicons name="eye-off-outline" size={24} color="black" />}
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Confirm Password</Text>
        <View style={styles.inputRow}>
          <Ionicons margin={10} left={2} top={5} position={'absolute'} name="lock-closed-outline" size={20} color="black" />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={confirmPass}
            onChangeText={setConfirmPass}
            secureTextEntry={!showConfirmPass}
          />
          <TouchableOpacity onPress={() => setShowConfirmPass(!showConfirmPass)} style={styles.eyeBtn}>
            {showConfirmPass
              ? <Ionicons name="eye" size={24} color="black" />
              : <Ionicons name="eye-off-outline" size={24} color="black" />}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <View style={{ height: 1, backgroundColor: 'black', marginVertical: 10, marginHorizontal: 65 }} />

        <Text style={styles.bottomText}>
          Already have an account?{' '}
          <Text style={styles.link} onPress={() => router.push('/auth/login')}>Login</Text>
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 32, color: '#1a1a1a' },
  label: { fontSize: 16, color: 'black', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#588157', opacity: 0.5, borderRadius: 20, padding: 12, marginBottom: 16, fontSize: 14 },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  eyeBtn: { position: 'absolute', right: 12, top: 12 },
  eyeText: { fontSize: 18 },
  button: { backgroundColor: '#588157', paddingHorizontal: 20, width: 96, paddingVertical: 10, borderRadius: 25, alignItems: 'center', marginBottom: 24, alignSelf: 'center' },
  buttonText: { color: 'black', fontWeight: '700', fontSize: 16 },
  bottomText: { textAlign: 'center', color: 'black', fontSize: 13 },
  link: { color: '#588157', fontWeight: '600', textDecorationLine: 'underline' },
  image: { width: 285, height: 285, alignSelf: 'center' },
});