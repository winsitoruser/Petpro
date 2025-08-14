import React, { createContext, useState, useContext, ReactNode } from 'react';
import { useColorScheme } from 'react-native';

// Define theme colors based on UI guidelines
export const lightTheme = {
  primary: '#0078D4',
  secondary: '#50C878',
  background: '#FFFFFF',
  card: '#F5F5F5',
  text: '#333333',
  border: '#E1E1E1',
  notification: '#FF3B30',
  success: '#4CD964',
  warning: '#FFCC00',
  error: '#FF3B30',
  inactive: '#999999',
  backgroundSecondary: '#F8F8F8',
  textSecondary: '#666666',
  buttonPrimary: '#0078D4',
  buttonSecondary: '#50C878',
  buttonText: '#FFFFFF',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

export const darkTheme = {
  primary: '#0078D4',
  secondary: '#50C878',
  background: '#121212',
  card: '#1E1E1E',
  text: '#FFFFFF',
  border: '#2C2C2C',
  notification: '#FF453A',
  success: '#32D74B',
  warning: '#FFD60A',
  error: '#FF453A',
  inactive: '#777777',
  backgroundSecondary: '#2C2C2C',
  textSecondary: '#AAAAAA',
  buttonPrimary: '#0078D4',
  buttonSecondary: '#50C878',
  buttonText: '#FFFFFF',
  shadow: 'rgba(0, 0, 0, 0.3)',
};

type ThemeType = typeof lightTheme;
type ThemeContextType = {
  theme: ThemeType;
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

type ThemeProviderProps = {
  children: ReactNode;
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const colorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(colorScheme === 'dark');
  const theme = isDark ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
