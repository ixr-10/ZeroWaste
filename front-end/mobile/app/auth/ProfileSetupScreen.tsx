import React, { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router'; // ✅ add useLocalSearchParams
import { 
  View, StyleSheet,
  ActivityIndicator, TouchableOpacity 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AvatarPicker from '../../components/AvatarPicker';
import AppText from '../../components/AppText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../constants/config';

const ProfileSetupScreen = () => {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>(); // ✅ get email from params
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDone = async () => {
    setLoading(true);
    try {
      // ✅ Upload avatar if selected
      if (selectedImage) {
        const token = await AsyncStorage.getItem('access');
        const formData = new FormData();
        const filename = selectedImage.split('/').pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        formData.append('avatar', { uri: selectedImage, name: filename, type } as any);

        await fetch(`${BASE_URL}users/profile/`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        });
      }
    } catch (e) {
      // silently fail — don't block the flow
    } finally {
      setLoading(false);
      // ✅ Pass email to confirmation screen
      router.push({
        pathname: '/auth/confirmationEmail' as any,
        params: { email },
      });
    }
  };

  const handleSkip = () => {
    // ✅ Pass email even when skipping
    router.push({
      pathname: '/auth/confirmationEmail' as any,
      params: { email },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header Logo */}
        <View style={styles.header}>
          <MaterialCommunityIcons name="cached" size={32} color="black" />
          <AppText weight="bold" style={styles.logoLetter}>w</AppText>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <AvatarPicker onImagePicked={(uri) => setSelectedImage(uri)} />
          
          <TouchableOpacity 
            style={styles.doneButton} 
            onPress={handleDone}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <AppText weight="bold" style={styles.doneText}>Done</AppText>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.divider} />
          <AppText style={styles.footerText}>
            Or you can{' '}
            <AppText weight="bold" style={styles.linkText} onPress={handleSkip}>
              Skip
            </AppText>{' '}
            for now
          </AppText>
        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, paddingHorizontal: 25 },
  header: {
    alignItems: 'flex-end',
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  logoLetter: { position: 'absolute', right: 11, top: 4, fontSize: 14 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  doneButton: {
    backgroundColor: '#588157',
    paddingVertical: 12,
    paddingHorizontal: 35,
    borderRadius: 25,
    marginTop: 60,
  },
  doneText: { color: 'white', fontSize: 16 },
  footer: { paddingBottom: 50, alignItems: 'center' },
  divider: { width: '60%', height: 1, backgroundColor: '#000', marginBottom: 15 },
  footerText: { fontSize: 16, color: '#000' },
  linkText: { color: '#588157', textDecorationLine: 'underline' },
});

export default ProfileSetupScreen;