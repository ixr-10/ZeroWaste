import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

interface AvatarPickerProps {
  onImagePicked: (uri: string) => void;
}

const AvatarPicker = ({ onImagePicked }: AvatarPickerProps) => {
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const selectedUri = result.assets[0].uri;
      setImage(selectedUri);
      onImagePicked(selectedUri);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.circle}>
        {image ? (
          <Image source={{ uri: image }} style={styles.avatarImage} />
        ) : (
          /* Using 'account-outline' but with a very large size to look thick */
          <MaterialCommunityIcons name="account-outline" size={200} color="#1A1A1A" />
        )}
        
        {/* Plus Button: Positioned to overlap the bottom right edge */}
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={pickImage}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
  },
  circle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#D1DBD0', 
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative', // Necessary for absolute positioning of the plus button
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 140,
  },
  addButton: {
    position: 'absolute',
    bottom: 35, // Adjusts the "inset" look
    right: 25,  // Adjusts the "inset" look
    backgroundColor: '#588157',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#D1DBD0', // Blends with the circle background
  },
});

export default AvatarPicker;