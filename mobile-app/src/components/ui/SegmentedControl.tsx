import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Animated,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { View, Text } from 'react-native-superflex';
import { useTheme } from '../../context/ThemeContext';

interface SegmentedControlProps {
  values: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  marginBottom?: number;
  marginTop?: number;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({
  values,
  selectedIndex,
  onChange,
  marginBottom,
  marginTop,
  style,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const [segmentWidth, setSegmentWidth] = useState(0);
  const translateX = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: selectedIndex * segmentWidth,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [selectedIndex, segmentWidth, translateX]);

  const handleLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    const newSegmentWidth = width / values.length;
    setSegmentWidth(newSegmentWidth);
  };

  return (
    <View
      style={[
        styles.container,
        { 
          backgroundColor: theme.colors.backgroundLight,
          marginBottom: marginBottom,
          marginTop: marginTop,
        },
        style,
      ]}
      onLayout={handleLayout}
    >
      <Animated.View
        style={[
          styles.selectedSegment,
          {
            backgroundColor: theme.colors.card,
            width: segmentWidth,
            transform: [{ translateX }],
            shadowColor: theme.colors.shadow,
          },
        ]}
      />
      {values.map((value, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.segment,
            { width: `${100 / values.length}%` },
          ]}
          onPress={() => onChange(index)}
          disabled={disabled || selectedIndex === index}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.segmentText,
              {
                color: selectedIndex === index ? theme.colors.text : theme.colors.textSecondary,
                fontWeight: selectedIndex === index ? '600' : '400',
              },
            ]}
          >
            {value}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 8,
    height: 40,
    position: 'relative',
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  segmentText: {
    fontSize: 14,
  },
  selectedSegment: {
    position: 'absolute',
    top: 2,
    left: 2,
    bottom: 2,
    borderRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
    zIndex: 0,
  },
});

export default SegmentedControl;
