import React from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  TextInputProps 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';

interface InputFieldProps extends TextInputProps {
  label: string;
  showToggle?: boolean;
  onToggle?: () => void;
  isPasswordVisible?: boolean;
  error?: string; // Prop to pass error messages from the screen
}

export default function InputField({ 
  label, 
  secureTextEntry, 
  showToggle, 
  onToggle, 
  isPasswordVisible,
  value,
  onChangeText,
  error,
  ...rest 
}: InputFieldProps) {
  return (
    <View style={styles.container}>
      <AppText weight="semibold" style={[styles.label, error ? { color: '#E63946' } : null]}>
        {label}
      </AppText>
      
      <View style={[
        styles.inputWrapper, 
        error ? { borderColor: '#E63946', borderWidth: 1.5 } : null 
      ]}>
        <TextInput 
          style={styles.input} 
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          autoCapitalize="none"
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor="#999"
          {...rest} 
        />
        
        {showToggle && (
          <TouchableOpacity onPress={onToggle} style={styles.icon} activeOpacity={0.7}>
            <Ionicons 
              name={isPasswordVisible ? "eye-outline" : "eye-off-outline"} 
              size={22} 
              color={error ? "#E63946" : "#666"} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Error Message Display */}
      {error ? (
        <AppText style={styles.errorText}>{error}</AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', marginBottom: 15 },
  label: { fontSize: 16, marginBottom: 8, marginLeft: 15, color: '#333' },
  inputWrapper: {
    height: 55,
    backgroundColor: '#FFF',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  input: { flex: 1, fontSize: 16, fontFamily: 'Outfit-Regular', color: '#000' },
  icon: { marginLeft: 10 },
  errorText: { color: '#E63946', fontSize: 12, marginTop: 5, marginLeft: 15 }
});