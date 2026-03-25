import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { 
  View, StyleSheet, SafeAreaView, StatusBar, 
  Platform, ActivityIndicator, TouchableOpacity 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AvatarPicker from '../../components/AvatarPicker';
import AppText from '../../components/AppText';

const ProfileSetupScreen = () => {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDone = async () => {
    setLoading(true);
    // Logic for upload would go here
    setTimeout(() => {
      setLoading(false);
      router.push('./finish-confirm');
    }, 1500);
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
            <AppText weight="bold" style={styles.linkText} onPress={() => router.push('./finish-confirm')}>
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
    borderRadius: 25, // Pill shape
    marginTop: 60,
  },
  doneText: { color: 'white', fontSize: 16 },
  footer: { paddingBottom: 50, alignItems: 'center' },
  divider: { width: '60%', height: 1, backgroundColor: '#000', marginBottom: 15 },
  footerText: { fontSize: 16, color: '#000' },
  linkText: { color: '#588157', textDecorationLine: 'underline' },
});

export default ProfileSetupScreen;