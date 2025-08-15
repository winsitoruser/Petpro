import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, Paper, Typography } from '@mui/material';
import PetsIcon from '@mui/icons-material/Pets';

const AuthLayout: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              mb: 2,
            }}
          >
            <PetsIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography
              variant="h4"
              component="h1"
              sx={{ fontWeight: 700, color: 'primary.main' }}
            >
              PetPro
            </Typography>
          </Box>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 1 }}>
            Admin Portal
          </Typography>
          <Typography color="text.secondary" align="center">
            Manage your pet healthcare services
          </Typography>
        </Box>

        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
          }}
        >
          <Outlet />
        </Paper>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} PetPro. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default AuthLayout;
