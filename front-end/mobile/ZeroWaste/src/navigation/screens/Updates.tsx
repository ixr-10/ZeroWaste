import { StyleSheet, View } from 'react-native';
import AppText from '../../../../components/AppText';

export function Updates() {
  return (
    <View style={styles.container}>
      <AppText weight="bold">Updates Screen</AppText>
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
