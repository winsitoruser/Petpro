import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  token: string | null;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    token: null,
  });

  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await SecureStore.getItemAsync('auth_token');
        const userJson = await SecureStore.getItemAsync('user_data');
        
        if (token && userJson) {
          const user = JSON.parse(userJson);
          setState({
            isAuthenticated: true,
            isLoading: false,
            user,
            token,
          });
        } else {
          setState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            token: null,
          });
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        setState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          token: null,
        });
      }
    };

    loadToken();
  }, []);

  const login = async (token: string, user: any) => {
    try {
      await SecureStore.setItemAsync('auth_token', token);
      await SecureStore.setItemAsync('user_data', JSON.stringify(user));
      
      setState({
        isAuthenticated: true,
        isLoading: false,
        user,
        token,
      });
      
      return true;
    } catch (error) {
      console.error('Error saving auth state:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('user_data');
      
      setState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        token: null,
      });
      
      return true;
    } catch (error) {
      console.error('Error clearing auth state:', error);
      return false;
    }
  };

  return {
    ...state,
    login,
    logout,
  };
};
