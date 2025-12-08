import { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Store as StoreIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useLogout } from '../hooks/useAuth';

/**
 * Layout Component
 *
 * Main application layout with:
 * - AppBar at the top with user info and logout
 * - Drawer navigation on the left (collapsible)
 * - Content area for page content
 */

interface LayoutProps {
  children: React.ReactNode;
}

const drawerWidth = 240;

export default function Layout({ children }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const { mutate: logout } = useLogout();

  const isAdmin = user?.role === 'ADMIN';

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navigationItems = [
    { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { label: 'Retailers', icon: <StoreIcon />, path: '/retailers' },
    ...(isAdmin
      ? [
          { label: 'Reference Data', icon: <AdminIcon />, path: '/admin' },
          { label: 'Settings', icon: <SettingsIcon />, path: '/settings' },
        ]
      : []),
  ];

  const drawer = (
    <Box>
      {/* Logo/Brand */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <StoreIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h6" fontWeight={600}>
          Retailer Sales
        </Typography>
      </Box>

      <Divider />

      {/* Navigation Items */}
      <List>
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                selected={isActive}
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                sx={{
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? 'white' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          {/* Mobile menu button */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Page title - could be dynamic based on route */}
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {location.pathname === '/dashboard' && 'Dashboard'}
            {location.pathname === '/retailers' && 'Retailers'}
            {location.pathname === '/admin' && 'Reference Data'}
            {location.pathname === '/settings' && 'Settings'}
          </Typography>

          {/* User info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Typography variant="body2">{user?.name}</Typography>
              <Typography variant="caption" color="inherit" sx={{ opacity: 0.8 }}>
                {user?.role === 'ADMIN' ? 'Administrator' : 'Sales Representative'}
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: 'secondary.main' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Button
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={() => logout()}
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            >
              Logout
            </Button>
            <IconButton
              color="inherit"
              onClick={() => logout()}
              sx={{ display: { xs: 'flex', sm: 'none' } }}
            >
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar /> {/* Spacer for fixed AppBar */}
        {children}
      </Box>
    </Box>
  );
}
