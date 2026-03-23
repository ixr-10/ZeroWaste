import { StaticScreenProps } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';
import AppText from '../../../../components/AppText';

type Props = StaticScreenProps<{
  user: string;
}>;

export function Profile({ route }: Props) {
  return (
    <View style={styles.container}>
      <AppText weight="bold">{route.params.user}'s Profile</AppText>
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
