import React from 'react';
import { 
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps
} from 'react-native';
import { SuperFlex, Box } from 'react-native-superflex';
import { useTheme } from '../../context/ThemeContext';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  title: string;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const Button = ({
  variant = 'primary',
  size = 'medium',
  title,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  containerStyle,
  textStyle,
  fullWidth = false,
  ...props
}: ButtonProps) => {
  const { theme } = useTheme();
  
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.buttonPrimary,
          borderWidth: 0,
        };
      case 'secondary':
        return {
          backgroundColor: theme.buttonSecondary,
          borderWidth: 0,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.buttonPrimary,
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        };
      default:
        return {};
    }
  };
  
  const getTextColor = (): string => {
    switch (variant) {
      case 'primary':
      case 'secondary':
        return theme.buttonText;
      case 'outline':
        return theme.buttonPrimary;
      case 'text':
        return theme.buttonPrimary;
      default:
        return theme.text;
    }
  };
  
  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'small':
        return {
          container: {
            paddingVertical: 8,
            paddingHorizontal: 16,
          },
          text: {
            fontSize: 14,
          },
        };
      case 'medium':
        return {
          container: {
            paddingVertical: 12,
            paddingHorizontal: 24,
          },
          text: {
            fontSize: 16,
          },
        };
      case 'large':
        return {
          container: {
            paddingVertical: 16,
            paddingHorizontal: 32,
          },
          text: {
            fontSize: 18,
          },
        };
      default:
        return {
          container: {},
          text: {},
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const isDisabled = disabled || loading;
  
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={isDisabled}
      style={[
        styles.button,
        getVariantStyles(),
        sizeStyles.container,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        containerStyle,
      ]}
      {...props}
    >
      <SuperFlex 
        row 
        alignItems="center" 
        justifyContent="center" 
        gap={8}
      >
        {leftIcon && !loading && leftIcon}
        
        {loading ? (
          <ActivityIndicator
            size="small"
            color={getTextColor()}
          />
        ) : (
          <Text
            style={[
              styles.text,
              { color: getTextColor() },
              sizeStyles.text,
              isDisabled && styles.disabledText,
              textStyle,
            ]}
          >
            {title}
          </Text>
        )}
        
        {rightIcon && !loading && rightIcon}
      </SuperFlex>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
  disabledText: {
    opacity: 0.8,
  },
});

export default Button;
