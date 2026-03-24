import { Image, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type HeaderProps = {
  showBack?: boolean;
  onBack?: () => void;
};

export default function Header({ showBack = false, onBack }: HeaderProps) {
  const router = useRouter();

  const handleBackPress = () => {
    if (onBack) {
      onBack();
      return;
    }

    router.back();
  };

  return (
    <View style={styles.container}>
      {showBack ? (
        <TouchableOpacity onPress={handleBackPress}>
          <Ionicons name="arrow-back-circle-outline" size={32} color="black" style={styles.backIcon} />
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}
      <Image source={require('../assets/images/logo.png')} style={styles.logo} />
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 36,
    height: 29.03,
    resizeMode: 'contain',
    top: 20,
    right: 20,
  },
  backIcon: {
    top: 20,
  },
  spacer: {
    width: 32,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 25,
    paddingTop: 0,
    marginTop: 0,
  },
});
