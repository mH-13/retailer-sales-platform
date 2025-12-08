import { Container, Box, Typography, Paper, Button, Stack, Card, CardContent } from '@mui/material';
import { Store as StoreIcon, Assessment as AssessmentIcon, Logout as LogoutIcon } from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';
import { useLogout } from '../hooks/useAuth';

/**
 * Dashboard Page
 *
 * Landing page after login - shows different content based on user role
 * - Admin: Can manage retailers, reference data, CSV import
 * - SR: Can view/edit assigned retailers
 */
export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const { mutate: logout } = useLogout();

  const isAdmin = user?.role === 'ADMIN';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                Welcome, {user?.name}!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Role: {user?.role === 'ADMIN' ? 'Administrator' : 'Sales Representative'}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={() => logout()}
            >
              Logout
            </Button>
          </Box>
        </Paper>

        {/* Quick Stats / Actions */}
        {isAdmin ? (
          // Admin View
          <Stack spacing={3}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <Card>
                <CardContent>
                  <StoreIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Manage Retailers
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    View all retailers, bulk import from CSV, and assign to sales reps
                  </Typography>
                  <Button variant="contained" disabled>
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <AssessmentIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Reference Data
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Manage regions, areas, territories, and distributors
                  </Typography>
                  <Button variant="contained" disabled>
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            </Box>
          </Stack>
        ) : (
          // Sales Rep View
          <Card>
            <CardContent>
              <StoreIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                My Retailers
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                View and manage your assigned retailers (~70 retailers)
              </Typography>
              <Button variant="contained" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Info Box */}
        <Paper sx={{ p: 3, mt: 3, bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h6" gutterBottom>
            ✨ Frontend Implementation in Progress
          </Typography>
          <Typography variant="body2">
            The core infrastructure is complete! Next steps:
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>Retailers list page with search and filters</li>
            <li>Edit retailer dialog (points, routes, notes)</li>
            <li>Admin CRUD interfaces for reference data</li>
            <li>CSV import functionality</li>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
