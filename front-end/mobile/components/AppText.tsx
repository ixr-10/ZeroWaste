import React from 'react';
import { Text, TextProps, StyleProp, TextStyle } from 'react-native';

type AppTextProps = TextProps & {
  weight?: 'regular' | 'semibold' | 'bold';
  style?: StyleProp<TextStyle>;
};

const AppText: React.FC<AppTextProps> = ({ weight = 'regular', style, children, ...props }) => {
  let fontFamily = 'Outfit-Regular';
  if (weight === 'semibold') fontFamily = 'Outfit-SemiBold';
  if (weight === 'bold') fontFamily = 'Outfit-Bold';

  return (
    <Text style={[{ fontFamily }, style]} {...props}>
      {children}
    </Text>
  );
};

export default AppText;