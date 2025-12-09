import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  CheckCircle as SuccessIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { useRetailers } from '../hooks/useRetailers';
import { useBulkAssignment, useSalesReps } from '../hooks/useAdmin';
import type { Retailer } from '../types';

/**
 * Bulk Assignment Page
 *
 * Allows admins to assign multiple retailers to a sales rep in one operation
 *
 * Features:
 * - View all retailers with pagination
 * - Select multiple retailers via checkboxes
 * - Enter sales rep ID for assignment
 * - Bulk assign operation with success/error reporting
 * - Selection management (select all, clear selection)
 */
export default function BulkAssignmentPage() {
  const [selectedRetailers, setSelectedRetailers] = useState<number[]>([]);
  const [salesRepId, setSalesRepId] = useState<number | ''>('');
  const [page] = useState(1);

  const { data, isLoading, error: fetchError } = useRetailers({ page, limit: 100 });
  const { data: salesReps, isLoading: loadingSRs } = useSalesReps();
  const { mutate: bulkAssign, isPending, isSuccess, error: assignError, reset } = useBulkAssignment();

  const retailers = data?.data || [];
  const allRetailerIds = retailers.map((r) => r.id);

  const handleSelectAll = () => {
    if (selectedRetailers.length === allRetailerIds.length) {
      setSelectedRetailers([]);
    } else {
      setSelectedRetailers(allRetailerIds);
    }
  };

  const handleToggleRetailer = (retailerId: number) => {
    setSelectedRetailers((prev) =>
      prev.includes(retailerId)
        ? prev.filter((id) => id !== retailerId)
        : [...prev, retailerId]
    );
  };

  const handleAssign = () => {
    if (!salesRepId) {
      alert('Please select a Sales Rep');
      return;
    }

    if (selectedRetailers.length === 0) {
      alert('Please select at least one retailer');
      return;
    }

    // Create assignments array
    const assignments = selectedRetailers.map((retailerId) => ({
      salesRepId: salesRepId as number,
      retailerId,
    }));

    bulkAssign(
      { assignments },
      {
        onSuccess: () => {
          // Clear selection after successful assignment
          setSelectedRetailers([]);
          setSalesRepId('');
        },
      }
    );
  };

  const handleReset = () => {
    setSelectedRetailers([]);
    setSalesRepId('');
    reset();
  };

  return (
    <Layout>
      <Box>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Bulk Retailer Assignment
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Assign multiple retailers to a sales representative in one operation.
          </Typography>
        </Box>

        {/* Instructions Card */}
        <Card sx={{ mb: 3, bgcolor: 'info.lighter' }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <InfoIcon color="info" />
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  How to Use Bulk Assignment
                </Typography>
                <Typography variant="body2" color="text.secondary" component="div">
                  <ol style={{ margin: 0, paddingLeft: 20 }}>
                    <li>Select retailers from the table below using checkboxes</li>
                    <li>Choose a Sales Rep from the dropdown</li>
                    <li>Click "Assign Selected Retailers" to create the assignments</li>
                    <li>The system will skip any duplicate assignments automatically</li>
                  </ol>
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Assignment Controls */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 250 }} disabled={isPending || isSuccess || loadingSRs}>
              <InputLabel>Select Sales Rep</InputLabel>
              <Select
                value={salesRepId}
                label="Select Sales Rep"
                onChange={(e) => setSalesRepId(e.target.value as number)}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {salesReps?.map((sr) => (
                  <MenuItem key={sr.id} value={sr.id}>
                    {sr.name} ({sr.username})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Chip
              label={`${selectedRetailers.length} retailer(s) selected`}
              color={selectedRetailers.length > 0 ? 'primary' : 'default'}
            />

            <Box sx={{ flex: 1 }} />

            {isSuccess && (
              <Button variant="outlined" onClick={handleReset} size="small">
                Reset
              </Button>
            )}

            <Button
              variant="contained"
              onClick={handleAssign}
              disabled={isPending || isSuccess || selectedRetailers.length === 0 || !salesRepId}
              startIcon={isPending ? <CircularProgress size={20} /> : <AssignmentIcon />}
            >
              {isPending ? 'Assigning...' : 'Assign Selected Retailers'}
            </Button>
          </Box>
        </Paper>

        {/* Success Alert */}
        {isSuccess && (
          <Alert severity="success" sx={{ mb: 3 }} icon={<SuccessIcon />}>
            <Typography variant="subtitle1" fontWeight={600}>
              Assignment Completed Successfully
            </Typography>
            <Typography variant="body2">
              Successfully assigned {selectedRetailers.length} retailers to{' '}
              {salesReps?.find((sr) => sr.id === salesRepId)?.name || `Sales Rep #${salesRepId}`}
            </Typography>
          </Alert>
        )}

        {/* Error Alert */}
        {assignError && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => reset()}>
            {assignError instanceof Error ? assignError.message : 'Failed to assign retailers. Please try again.'}
          </Alert>
        )}

        {/* Retailers Table */}
        <Paper sx={{ p: 3 }}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Select Retailers</Typography>
            <Button
              size="small"
              onClick={handleSelectAll}
              disabled={isPending || isSuccess}
            >
              {selectedRetailers.length === allRetailerIds.length ? 'Deselect All' : 'Select All'}
            </Button>
          </Box>

          {/* Loading State */}
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Error State */}
          {fetchError && (
            <Alert severity="error">
              Failed to load retailers. Please refresh the page.
            </Alert>
          )}

          {/* Table */}
          {!isLoading && !fetchError && retailers.length > 0 && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedRetailers.length === allRetailerIds.length && allRetailerIds.length > 0}
                        indeterminate={selectedRetailers.length > 0 && selectedRetailers.length < allRetailerIds.length}
                        onChange={handleSelectAll}
                        disabled={isPending || isSuccess}
                      />
                    </TableCell>
                    <TableCell>UID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Region</TableCell>
                    <TableCell>Territory</TableCell>
                    <TableCell>Points</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {retailers.map((retailer: Retailer) => {
                    const isSelected = selectedRetailers.includes(retailer.id);
                    return (
                      <TableRow
                        key={retailer.id}
                        hover
                        onClick={() => !isPending && !isSuccess && handleToggleRetailer(retailer.id)}
                        sx={{ cursor: isPending || isSuccess ? 'default' : 'pointer' }}
                        selected={isSelected}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isSelected}
                            disabled={isPending || isSuccess}
                          />
                        </TableCell>
                        <TableCell>{retailer.uid}</TableCell>
                        <TableCell>{retailer.name}</TableCell>
                        <TableCell>{retailer.phone}</TableCell>
                        <TableCell>{retailer.region?.name || '-'}</TableCell>
                        <TableCell>{retailer.territory?.name || '-'}</TableCell>
                        <TableCell>{retailer.points}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Empty State */}
          {!isLoading && !fetchError && retailers.length === 0 && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No retailers found. Please add retailers first.
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Layout>
  );
}
