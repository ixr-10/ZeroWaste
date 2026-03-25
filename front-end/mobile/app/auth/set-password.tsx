import React, { useState } from 'react';
import { StyleSheet, View, Image, SafeAreaView, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Header from '../../components/Header';
import InputField from '../../components/InputField';
import AppText from '../../components/AppText';

// 1. Define the shape of your form data
interface PasswordFormData {
  username: string;
  code: string;
  password:  string;
  confirmPassword:  string;
}

export default function SetPasswordScreen() {
  const router = useRouter();
  
  // 2. Initialize state with the interface
  const [formData, setFormData] = useState<PasswordFormData>({
    username: '',
    code: '',
    password: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState<boolean>(false);
  const [showPwd, setShowPwd] = useState<boolean>(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState<boolean>(false);

  // 3. Typed change handler
  const handleInputChange = (name: keyof PasswordFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFinish = async () => {
    const { username, code, password, confirmPassword } = formData;

    // Basic validation
    if (!username || !code || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }

    try {
      setLoading(true);
      
      // Simulate API call
      console.log("Sending to backend:", formData);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setLoading(false);
      router.push('/auth/ProfileSetupScreen');
    } catch {
      setLoading(false);
      Alert.alert("Error", "Failed to update password. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header showBack />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image 
            source={require('../../assets/images/setpassword.png')} 
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        <AppText weight="bold" style={styles.title}>SET PASSWORD</AppText>

        <View style={styles.form}>
          <InputField 
            label="Username" 
            value={formData.username}
            onChangeText={(text: string) => handleInputChange('username', text)}
          />
          <InputField 
            label="Code" 
            value={formData.code}
            keyboardType="number-pad"
            onChangeText={(text: string) => handleInputChange('code', text)}
          />
          
          <InputField 
            label="Password" 
            secureTextEntry={!showPwd} 
            showToggle 
            isPasswordVisible={showPwd}
            onToggle={() => setShowPwd(!showPwd)}
            value={formData.password}
            onChangeText={(text: string) => handleInputChange('password', text)}
          />
          
          <InputField 
            label="Confirm Password" 
            secureTextEntry={!showConfirmPwd} 
            showToggle 
            isPasswordVisible={showConfirmPwd}
            onToggle={() => setShowConfirmPwd(!showConfirmPwd)}
            value={formData.confirmPassword}
            onChangeText={(text: string) => handleInputChange('confirmPassword', text)}
          />
          
          <TouchableOpacity 
            style={[styles.finishButton, loading && { opacity: 0.7 }]} 
            onPress={handleFinish}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <AppText weight="bold" style={styles.finishButtonText}>Finish</AppText>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ... styles remain the same as your original code

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingHorizontal: 25, paddingBottom: 40, alignItems: 'center' },
  imageContainer: { height: 260, width: '100%', marginTop: 10 },
  illustration: { width: '100%', height: '100%' },
  title: {
    fontSize: 26,
    letterSpacing: 2,
    marginVertical: 25,
    color: '#000',
    textAlign: 'center'
  },
  form: { width: '100%' },
  finishButton: {
    backgroundColor: '#588157', 
    height: 52,
    width: '40%',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20,
  },
  finishButtonText: { color: '#FFF', fontSize: 17 },
});
