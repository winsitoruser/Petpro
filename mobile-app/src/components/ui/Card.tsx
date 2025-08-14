import React, { ReactNode } from 'react';
import { StyleSheet, ViewStyle, View } from 'react-native';
import { SuperFlex } from 'react-native-superflex';
import { useTheme } from '../../context/ThemeContext';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  padded?: boolean;
  elevation?: number;
  borderRadius?: number;
  backgroundColor?: string;
}

const Card = ({
  children,
  style,
  padded = true,
  elevation = 2,
  borderRadius = 8,
  backgroundColor,
}: CardProps) => {
  const { theme } = useTheme();
  
  return (
    <SuperFlex
      style={[
        styles.card,
        {
          padding: padded ? 16 : 0,
          backgroundColor: backgroundColor || theme.card,
          borderRadius,
          shadowOpacity: elevation / 10,
          elevation,
        },
        style,
      ]}
    >
      {children}
    </SuperFlex>
  );
};

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
});

export default Card;
