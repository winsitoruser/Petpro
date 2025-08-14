import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { SuperFlex } from 'react-native-superflex';
import { useTheme } from '../../context/ThemeContext';

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputContainerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  helperTextStyle?: TextStyle;
  errorTextStyle?: TextStyle;
  onRightIconPress?: () => void;
}

const TextField = forwardRef<TextInput, TextFieldProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      containerStyle,
      inputContainerStyle,
      inputStyle,
      labelStyle,
      helperTextStyle,
      errorTextStyle,
      onRightIconPress,
      secureTextEntry,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const [isSecure, setIsSecure] = useState(secureTextEntry);

    const handleFocus = (e: any) => {
      setIsFocused(true);
      onFocus && onFocus(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      onBlur && onBlur(e);
    };

    const toggleSecureEntry = () => {
      setIsSecure(!isSecure);
    };

    const getBorderColor = () => {
      if (error) return theme.error;
      if (isFocused) return theme.primary;
      return theme.border;
    };

    return (
      <SuperFlex style={[styles.container, containerStyle]}>
        {label && (
          <Text
            style={[
              styles.label,
              { color: error ? theme.error : theme.textSecondary },
              labelStyle,
            ]}
          >
            {label}
          </Text>
        )}
        
        <View
          style={[
            styles.inputContainer,
            {
              borderColor: getBorderColor(),
              backgroundColor: theme.backgroundSecondary,
            },
            inputContainerStyle,
          ]}
        >
          {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
          
          <TextInput
            ref={ref}
            style={[
              styles.input,
              {
                color: theme.text,
                flex: 1,
              },
              inputStyle,
            ]}
            placeholderTextColor={theme.inactive}
            onFocus={handleFocus}
            onBlur={handleBlur}
            secureTextEntry={isSecure}
            {...props}
          />
          
          {secureTextEntry ? (
            <TouchableOpacity 
              onPress={toggleSecureEntry}
              style={styles.iconContainer}
            >
              <Text style={{ color: theme.primary }}>
                {isSecure ? 'Show' : 'Hide'}
              </Text>
            </TouchableOpacity>
          ) : rightIcon ? (
            <TouchableOpacity
              onPress={onRightIconPress}
              style={styles.iconContainer}
              disabled={!onRightIconPress}
            >
              {rightIcon}
            </TouchableOpacity>
          ) : null}
        </View>
        
        {(error || helperText) && (
          <Text
            style={[
              styles.helperText,
              {
                color: error ? theme.error : theme.textSecondary,
              },
              error ? errorTextStyle : helperTextStyle,
            ]}
          >
            {error || helperText}
          </Text>
        )}
      </SuperFlex>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 48,
  },
  input: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  iconContainer: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default TextField;
