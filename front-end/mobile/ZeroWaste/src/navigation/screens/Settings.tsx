import { StyleSheet, View } from 'react-native';
import AppText from '../../../../components/AppText';

export function Settings() {
  return (
    <View style={styles.container}>
      <AppText weight="bold">Settings Screen</AppText>
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
  row: {
    flexDirection: 'row',
    gap: 10,
  },
});
