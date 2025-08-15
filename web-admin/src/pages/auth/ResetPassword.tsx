import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { 
  Visibility as VisibilityIcon, 
  VisibilityOff as VisibilityOffIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';

interface FormData {
  password: string;
  confirmPassword: string;
}

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Extract token from URL query parameters
  const query = new URLSearchParams(location.search);
  const token = query.get('token');

  const { control, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      password: '',
      confirmPassword: '',
    }
  });
  
  const password = watch('password');

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, this would call your password reset API with the token
      console.log('Password reset with token:', token);
      console.log('New password:', data.password);
      
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Your password has been successfully reset.');
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError('Password reset failed. Please try again or request a new reset link.');
      console.error('Password reset error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Check if token exists
  if (!token) {
    return (
      <Alert severity="error">
        Invalid or missing reset token. Please request a new password reset link.
      </Alert>
    );
  }

  return (
    <>
      <Typography component="h1" variant="h5" align="center" sx={{ mb: 2 }}>
        Create new password
      </Typography>
      
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
        Your password must be at least 8 characters and include a mix of letters and numbers
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Controller
          name="password"
          control={control}
          rules={{ 
            required: 'Password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters'
            },
            pattern: {
              value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
              message: 'Password must contain at least one letter and one number'
            }
          }}
          render={({ field }) => (
            <TextField
              margin="normal"
              required
              fullWidth
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="new-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              error={!!errors.password}
              helperText={errors.password?.message}
              {...field}
            />
          )}
        />
        
        <Controller
          name="confirmPassword"
          control={control}
          rules={{ 
            required: 'Please confirm your password',
            validate: value => value === password || 'Passwords do not match'
          }}
          render={({ field }) => (
            <TextField
              margin="normal"
              required
              fullWidth
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              autoComplete="new-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowConfirmPassword}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              {...field}
            />
          )}
        />
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2, py: 1.5 }}
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Reset Password'}
        </Button>
      </Box>
    </>
  );
};

export default ResetPassword;
