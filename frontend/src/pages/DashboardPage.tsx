import { Box, Typography, Card, CardContent, Button } from '@mui/material';
import {
  Store as StoreIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Layout from '../components/Layout';

/**
 * Dashboard Page
 *
 * Landing page after login - shows quick stats and actions based on user role
 * - Admin: Overview stats + quick access to all features
 * - SR: Personal stats + quick access to retailers
 */
export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <Layout>
      <Box>
        {/* Welcome Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Welcome back, {user?.name}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's what's happening with your business today.
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: isAdmin ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)',
            },
            gap: 3,
            mb: 4,
          }}
        >
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <StoreIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h4" fontWeight={600}>
                    --
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Retailers
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main' }} />
                <Box>
                  <Typography variant="h4" fontWeight={600}>
                    --
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active This Week
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {isAdmin && (
            <>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PeopleIcon sx={{ fontSize: 40, color: 'info.main' }} />
                    <Box>
                      <Typography variant="h4" fontWeight={600}>
                        --
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Sales Reps
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AssessmentIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                    <Box>
                      <Typography variant="h4" fontWeight={600}>
                        --
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Points
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </>
          )}
        </Box>

        {/* Quick Actions */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: isAdmin ? '1fr 1fr' : '1fr' },
            gap: 3,
          }}
        >
          <Card>
            <CardContent sx={{ p: 3 }}>
              <StoreIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" fontWeight={600} gutterBottom>
                Retailers
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {isAdmin
                  ? 'View all retailers, search, filter, and manage assignments'
                  : 'View and manage your assigned retailers'}
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/retailers')}
              >
                View Retailers
              </Button>
            </CardContent>
          </Card>

          {isAdmin && (
            <Card>
              <CardContent sx={{ p: 3 }}>
                <AssessmentIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  Reference Data
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Manage regions, areas, territories, and distributors
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/admin')}
                >
                  Manage Data
                </Button>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
    </Layout>
  );
}
