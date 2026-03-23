import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AppText from './AppText';

interface HeaderProps {
  onBack?: () => void;
}

export default function Header({ onBack }: HeaderProps) {
  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backBtn} 
        onPress={onBack}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back-outline" size={26} color="black" />
      </TouchableOpacity>
      
      {/* Logo */}
      <View style={styles.logoWrapper}>
        <MaterialCommunityIcons 
          name="cached" // This provides the circular arrows
          size={42} 
          color="black" 
          style={styles.arrowsIcon}
        />
        <AppText weight="bold" style={styles.logoLetter}>
          w
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
    backgroundColor: 'transparent',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrapper: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowsIcon: {
    position: 'absolute',
    // Slight rotation to match the slant in your PNG
    transform: [{ rotate: '15deg' }], 
  },
  logoLetter: {
    fontSize: 18,
    color: '#000',
    // Adjusting position to center perfectly inside the arrows
    marginTop: -2, 
  },
});
