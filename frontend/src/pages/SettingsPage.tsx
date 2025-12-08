import {
  Box,
  Paper,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  Button,
  Alert,
  TextField,
} from '@mui/material';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { useAuthStore } from '../store/authStore';

/**
 * Settings Page
 *
 * User settings and preferences (placeholder UI)
 *
 * Features to implement in the future:
 * - Profile management (name, email, phone)
 * - Password change
 * - Notification preferences
 * - Theme customization (dark mode)
 * - Language selection
 */
export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <Layout>
      <Box>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your account settings and preferences
          </Typography>
        </Box>

        {/* Info Alert */}
        <Alert severity="info" sx={{ mb: 3 }}>
          Settings features are coming soon! This page will allow you to update your profile, change
          password, and customize your preferences.
        </Alert>

        {/* Profile Section */}
        <Paper sx={{ mb: 3, p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={600}>
              Profile Information
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Full Name"
              value={user?.name || ''}
              disabled
              fullWidth
              helperText="Profile editing coming soon"
            />
            <TextField
              label="Username"
              value={user?.username || ''}
              disabled
              fullWidth
            />
            <TextField
              label="Role"
              value={user?.role === 'ADMIN' ? 'Administrator' : 'Sales Representative'}
              disabled
              fullWidth
            />
            <Button variant="outlined" disabled>
              Update Profile
            </Button>
          </Box>
        </Paper>

        {/* Security Section */}
        <Paper sx={{ mb: 3, p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LockIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={600}>
              Security
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Current Password"
              type="password"
              disabled
              fullWidth
            />
            <TextField
              label="New Password"
              type="password"
              disabled
              fullWidth
            />
            <TextField
              label="Confirm New Password"
              type="password"
              disabled
              fullWidth
              helperText="Password change functionality coming soon"
            />
            <Button variant="outlined" disabled>
              Change Password
            </Button>
          </Box>
        </Paper>

        {/* Preferences Section */}
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PaletteIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={600}>
              Preferences
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />

          <List>
            <ListItem>
              <ListItemIcon>
                <NotificationsIcon />
              </ListItemIcon>
              <ListItemText
                primary="Email Notifications"
                secondary="Receive email updates about your retailers"
              />
              <Switch disabled />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemIcon>
                <PaletteIcon />
              </ListItemIcon>
              <ListItemText
                primary="Dark Mode"
                secondary="Use dark theme (coming soon)"
              />
              <Switch disabled />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemIcon>
                <LanguageIcon />
              </ListItemIcon>
              <ListItemText
                primary="Language"
                secondary="English (more languages coming soon)"
              />
            </ListItem>
          </List>
        </Paper>
      </Box>
    </Layout>
  );
}
