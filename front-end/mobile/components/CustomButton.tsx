import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import AppText from './AppText';

interface Props {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
}

const CustomButton = ({ title, onPress, style }: Props) => {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress} activeOpacity={0.8}>
      <AppText weight="bold" style={styles.text}>
        {title}
      </AppText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#588157',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  text: {
    color: 'white',
    fontSize: 18,
  },
});

export default CustomButton;
