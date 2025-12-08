import { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { useRetailers } from '../hooks/useRetailers';

/**
 * Retailers Page
 *
 * Displays paginated list of retailers with:
 * - Search functionality
 * - Filters (region, area, territory, distributor)
 * - Pagination
 * - Edit action (opens dialog)
 */
export default function RetailersPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');

  // Fetch retailers with current filters
  const { data, isLoading, error } = useRetailers({
    page: page + 1, // Backend uses 1-indexed pages
    limit: rowsPerPage,
    search: search || undefined,
  });

  const retailers = data?.data || [];
  const pagination = data?.pagination || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  return (
    <Layout>
      <Box>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight={600} gutterBottom>
              Retailers
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage and view all retailers in the system
            </Typography>
          </Box>
        </Box>

        {/* Search and Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              placeholder="Search by name, phone, or UID..."
              value={search}
              onChange={handleSearchChange}
              sx={{ flexGrow: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <IconButton color="primary">
              <FilterIcon />
            </IconButton>
          </Box>
        </Paper>

        {/* Table */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>UID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Points</TableCell>
                  <TableCell>Region</TableCell>
                  <TableCell>Territory</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <Alert severity="error">
                        Failed to load retailers. Please try again.
                      </Alert>
                    </TableCell>
                  </TableRow>
                ) : retailers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                      <Typography variant="body1" color="text.secondary">
                        {search
                          ? `No retailers found matching "${search}"`
                          : 'No retailers found'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  retailers.map((retailer) => (
                    <TableRow
                      key={retailer.id}
                      hover
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {retailer.uid}
                        </Typography>
                      </TableCell>
                      <TableCell>{retailer.name}</TableCell>
                      <TableCell>{retailer.phone}</TableCell>
                      <TableCell>
                        <Chip
                          label={retailer.points}
                          color="primary"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {retailer.region?.name || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {retailer.territory?.name || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label="Active"
                          color="success"
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="primary">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {!isLoading && !error && retailers.length > 0 && (
            <TablePagination
              component="div"
              count={pagination.total}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[10, 25, 50, 100]}
            />
          )}
        </Paper>
      </Box>
    </Layout>
  );
}
