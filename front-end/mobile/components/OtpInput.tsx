import React, { useRef } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  NativeSyntheticEvent, 
  TextInputKeyPressEventData 
} from 'react-native';

interface OtpInputProps {
  code: string[];
  setCode: (code: string[]) => void;
}

export default function OtpInput({ code, setCode }: OtpInputProps) {
  const inputs = useRef<Array<TextInput | null>>([]);

  const handleChange = (text: string, index: number) => {
    // 1. Handle Pasting (Detecting multiple characters)
    if (text.length > 1) {
      const pastedCode = text.trim().split('').slice(0, 6);
      const newCode = [...code];
      pastedCode.forEach((char, i) => {
        if (i < 6) newCode[i] = char;
      });
      setCode(newCode);
      
      // Focus the appropriate input after pasting
      const nextFocus = Math.min(pastedCode.length, 5);
      inputs.current[nextFocus]?.focus();
      return;
    }

    // 2. Standard single character input
    // Ensure we only take the last character typed (prevents 2 digits in one box)
    const lastChar = text.length > 0 ? text.charAt(text.length - 1) : '';
    const newCode = [...code];
    newCode[index] = lastChar;
    setCode(newCode);

    // Auto-focus next field if a character was entered
    if (lastChar && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    { nativeEvent: { key } }: NativeSyntheticEvent<TextInputKeyPressEventData>, 
    index: number
  ) => {
    // 3. Backspace Logic
    if (key === 'Backspace') {
      if (!code[index] && index > 0) {
        // If current is empty, go back and clear previous
        const newCode = [...code];
        newCode[index - 1] = '';
        setCode(newCode);
        inputs.current[index - 1]?.focus();
      } else {
        // Just clear current
        const newCode = [...code];
        newCode[index] = '';
        setCode(newCode);
      }
    }
  };

  return (
    <View style={styles.container}>
      {code.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
                 inputs.current[index] = ref;
                     }}
          style={[
            styles.input, 
            digit ? styles.inputActive : styles.inputInactive
          ]}
          // We set maxLength to 2 for the first box to allow pasting, 
          // but we handle the logic in handleChange to strip extra chars.
          maxLength={index === 0 ? 6 : 1} 
          keyboardType="number-pad"
          textContentType="oneTimeCode" // iOS Auto-fill support
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          value={digit}
          selectTextOnFocus
          autoFocus={index === 0}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 25,
  },
  input: {
    width: 45, // Adjusted slightly to fit screens better
    height: 55,
    borderWidth: 1.5,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    backgroundColor: '#FFFFFF',
    color: '#1A1A1A',
    // Shadow for elevation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  inputActive: {
    borderColor: '#588157', 
    borderWidth: 2,
  },
  inputInactive: {
    borderColor: '#E0E0E0',
  },
});