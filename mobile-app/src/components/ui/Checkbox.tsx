import React from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  StyleProp, 
  ViewStyle 
} from 'react-native';
import { View } from 'react-native-superflex';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface CheckboxProps {
  checked: boolean;
  onToggle: (checked: boolean) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  size?: 'small' | 'medium' | 'large';
  borderRadius?: number;
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onToggle,
  disabled = false,
  style,
  size = 'medium',
  borderRadius,
}) => {
  const { theme } = useTheme();
  
  // Determine size based on prop
  const getSize = () => {
    switch(size) {
      case 'small':
        return { box: 18, icon: 12 };
      case 'large':
        return { box: 28, icon: 20 };
      case 'medium':
      default:
        return { box: 22, icon: 16 };
    }
  };
  
  const dimensions = getSize();
  const calculatedBorderRadius = borderRadius ?? dimensions.box / 4;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onToggle(!checked)}
      disabled={disabled}
      style={style}
    >
      <View
        style={[
          styles.checkbox,
          {
            width: dimensions.box,
            height: dimensions.box,
            borderRadius: calculatedBorderRadius,
            borderColor: checked ? theme.colors.primary : theme.colors.border,
            backgroundColor: checked ? theme.colors.primary : 'transparent',
            opacity: disabled ? 0.5 : 1,
          },
        ]}
        alignItems="center"
        justifyContent="center"
      >
        {checked && (
          <Ionicons
            name="checkmark"
            size={dimensions.icon}
            color={theme.colors.white}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  checkbox: {
    borderWidth: 2,
  },
});

export default Checkbox;
