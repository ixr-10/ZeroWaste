import { Button } from '@react-navigation/elements';
import { StyleSheet, View } from 'react-native';
import AppText from '../../../../components/AppText';

export function Home() {
  return (
    <View style={styles.container}>
      <AppText weight="bold">Home Screen</AppText>
      <AppText>Open up 'src/App.tsx' to start working on your app!</AppText>
      <Button screen="Profile" params={{ user: 'jane' }}>
        Go to Profile
      </Button>
      <Button screen="Settings">Go to Settings</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
});
