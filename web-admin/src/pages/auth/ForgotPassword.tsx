import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Link,
  Typography,
  Alert,
  InputAdornment,
  Paper,
} from '@mui/material';
import { 
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon 
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';

interface FormData {
  email: string;
}

const ForgotPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      email: '',
    }
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // In a real app, this would call your password reset API
      console.log('Password reset request for:', data.email);
      
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      setSuccess(`If an account exists for ${data.email}, we've sent a password reset link.`);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('Password reset error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Typography component="h1" variant="h5" align="center" sx={{ mb: 2 }}>
        Reset your password
      </Typography>
      
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
        Enter your email address and we'll send you a link to reset your password
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
          name="email"
          control={control}
          rules={{ 
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
          }}
          render={({ field }) => (
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              autoComplete="email"
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
              error={!!errors.email}
              helperText={errors.email?.message}
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
          {loading ? 'Sending...' : 'Send Reset Link'}
        </Button>
        
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Link component={RouterLink} to="/login" variant="body2" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowBackIcon fontSize="small" sx={{ mr: 0.5 }} />
            Back to sign in
          </Link>
        </Box>
      </Box>
    </>
  );
};

export default ForgotPassword;
