import React, { useState } from 'react';
import { StyleSheet, Image, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { View, Text } from 'react-native-superflex';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Yup from 'yup';
import { Formik } from 'formik';

import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import Button from '../../components/ui/Button';
import TextField from '../../components/ui/TextField';
import Card from '../../components/ui/Card';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().required('Password is required').min(8, 'Password must be at least 8 characters'),
});

const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { theme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      setIsSubmitting(true);
      await login(values.email, values.password);
      // If login is successful, the useAuth hook will navigate to the main app
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Please check your credentials and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View flex={1} paddingHorizontal={20} justifyContent="center">
          <View alignItems="center" marginBottom={30}>
            <Image 
              source={require('../../assets/images/logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text 
              fontSize={28} 
              fontWeight="700" 
              color={theme.colors.primary}
              marginTop={16}
            >
              PetPro Vendor
            </Text>
            <Text 
              fontSize={16} 
              color={theme.colors.text} 
              textAlign="center"
              marginTop={8}
            >
              Log in to manage your pet business
            </Text>
          </View>

          <Card>
            <Formik
              initialValues={{ email: '', password: '' }}
              validationSchema={LoginSchema}
              onSubmit={handleLogin}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <View gap={16}>
                  <TextField
                    label="Email"
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    error={touched.email && errors.email ? errors.email : undefined}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    leftIcon="mail"
                  />
                  
                  <TextField
                    label="Password"
                    value={values.password}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    error={touched.password && errors.password ? errors.password : undefined}
                    secureTextEntry
                    leftIcon="lock"
                  />
                  
                  <TouchableOpacity
                    onPress={() => navigation.navigate('ForgotPassword')}
                    style={styles.forgotPasswordContainer}
                  >
                    <Text color={theme.colors.primary} fontSize={14}>
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>
                  
                  <Button 
                    title="Log In" 
                    onPress={handleSubmit as any} 
                    variant="primary" 
                    size="large"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                  />
                </View>
              )}
            </Formik>
          </Card>

          <View marginTop={20} flexDirection="row" justifyContent="center">
            <Text color={theme.colors.text}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text color={theme.colors.primary} fontWeight="600">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 120,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginVertical: 8,
  },
});

export default LoginScreen;
