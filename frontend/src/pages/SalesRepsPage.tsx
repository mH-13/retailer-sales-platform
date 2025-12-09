import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { People as PeopleIcon } from '@mui/icons-material';
import Layout from '../components/Layout';
import { useSalesReps } from '../hooks/useAdmin';

/**
 * Sales Reps Management Page
 *
 * Displays list of all sales representatives with their details
 * Admin-only page for viewing SR information
 *
 * Features:
 * - Table view of all sales reps
 * - Shows username, name, phone, status, created date
 * - Active/inactive status indicators
 * - Loading and error states
 */
export default function SalesRepsPage() {
  const { data: salesReps, isLoading, error } = useSalesReps();

  return (
    <Layout>
      <Box>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" fontWeight={600} gutterBottom>
              Sales Representatives
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View all sales representatives and their account status.
            </Typography>
          </Box>
        </Box>

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Failed to load sales representatives. Please try again.
          </Alert>
        )}

        {/* Content */}
        <Paper sx={{ p: 3 }}>
          {/* Loading State */}
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Sales Reps Table */}
          {!isLoading && !error && salesReps && salesReps.length > 0 && (
            <>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  Total Sales Reps: {salesReps.length}
                </Typography>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Username</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Created</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {salesReps.map((sr) => (
                      <TableRow key={sr.id} hover>
                        <TableCell>{sr.id}</TableCell>
                        <TableCell>
                          <Typography fontWeight={500}>{sr.username}</Typography>
                        </TableCell>
                        <TableCell>{sr.name}</TableCell>
                        <TableCell>{sr.phone}</TableCell>
                        <TableCell>
                          <Chip
                            label={sr.role}
                            color={sr.role === 'ADMIN' ? 'secondary' : 'primary'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={sr.isActive ? 'Active' : 'Inactive'}
                            color={sr.isActive ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(sr.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {/* Empty State */}
          {!isLoading && !error && (!salesReps || salesReps.length === 0) && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No sales representatives found.
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Layout>
  );
}
