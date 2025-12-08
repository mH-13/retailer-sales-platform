import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Store as StoreIcon } from '@mui/icons-material';
import { useLogin } from '../hooks/useAuth';

/**
 * Login Page
 *
 * Simple, clean login form with Material-UI
 * Uses React Hook Form would be overkill for just 2 fields, so using controlled components
 *
 * Features:
 * - Username and password inputs
 * - Loading state during login
 * - Error message display
 * - Auto-redirect on success
 */
export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const { mutate: login, isPending, error } = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    login(
      { username, password },
      {
        onSuccess: () => {
          // Redirect to dashboard after successful login
          navigate('/dashboard');
        },
      }
    );
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <StoreIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
              Retailer Sales Platform
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to manage your retailers
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Invalid username or password. Please try again.
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isPending}
              autoFocus
              required
            />

            <TextField
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isPending}
              required
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={isPending}
              sx={{ mt: 3, mb: 2 }}
            >
              {isPending ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
          </form>

          {/* Demo Credentials */}
          <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              Demo Credentials:
            </Typography>
            <Typography variant="caption" display="block">
              <strong>Admin:</strong> admin / password123
            </Typography>
            <Typography variant="caption" display="block">
              <strong>Sales Rep:</strong> karim_sr / password123
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
