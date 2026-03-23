import { Button } from '@react-navigation/elements';
import { StyleSheet, View } from 'react-native';
import AppText from '../../../../components/AppText';

export function NotFound() {
  return (
    <View style={styles.container}>
      <AppText weight="bold">404</AppText>
      <Button screen="HomeTabs">Go to Home</Button>
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
