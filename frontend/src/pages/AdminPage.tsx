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
  IconButton,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout';
import ReferenceDataDialog from '../components/ReferenceDataDialog';
import {
  useRegions,
  useCreateRegion,
  useUpdateRegion,
  useDeleteRegion,
  useAreas,
  useCreateArea,
  useUpdateArea,
  useDeleteArea,
  useTerritories,
  useCreateTerritory,
  useUpdateTerritory,
  useDeleteTerritory,
  useDistributors,
  useCreateDistributor,
  useUpdateDistributor,
  useDeleteDistributor,
} from '../hooks/useAdmin';
import type { Region, Area, Territory, Distributor } from '../types';

/**
 * Admin Page
 *
 * Consolidated admin page with tabs for managing all reference data:
 * - Regions
 * - Areas
 * - Territories
 * - Distributors
 */

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function AdminPage() {
  const [currentTab, setCurrentTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Region | Area | Territory | Distributor | null>(null);

  // Regions hooks
  const { data: regions, isLoading: regionsLoading, error: regionsError } = useRegions();
  const { mutate: createRegion, isPending: isCreatingRegion, error: createRegionError, isSuccess: createRegionSuccess } = useCreateRegion();
  const { mutate: updateRegion, isPending: isUpdatingRegion, error: updateRegionError, isSuccess: updateRegionSuccess } = useUpdateRegion();
  const { mutate: deleteRegion, isPending: isDeletingRegion } = useDeleteRegion();

  // Areas hooks
  const { data: areas, isLoading: areasLoading, error: areasError } = useAreas();
  const { mutate: createArea, isPending: isCreatingArea, error: createAreaError, isSuccess: createAreaSuccess } = useCreateArea();
  const { mutate: updateArea, isPending: isUpdatingArea, error: updateAreaError, isSuccess: updateAreaSuccess } = useUpdateArea();
  const { mutate: deleteArea, isPending: isDeletingArea } = useDeleteArea();

  // Territories hooks
  const { data: territories, isLoading: territoriesLoading, error: territoriesError } = useTerritories();
  const { mutate: createTerritory, isPending: isCreatingTerritory, error: createTerritoryError, isSuccess: createTerritorySuccess } = useCreateTerritory();
  const { mutate: updateTerritory, isPending: isUpdatingTerritory, error: updateTerritoryError, isSuccess: updateTerritorySuccess } = useUpdateTerritory();
  const { mutate: deleteTerritory, isPending: isDeletingTerritory } = useDeleteTerritory();

  // Distributors hooks
  const { data: distributors, isLoading: distributorsLoading, error: distributorsError } = useDistributors();
  const { mutate: createDistributor, isPending: isCreatingDistributor, error: createDistributorError, isSuccess: createDistributorSuccess } = useCreateDistributor();
  const { mutate: updateDistributor, isPending: isUpdatingDistributor, error: updateDistributorError, isSuccess: updateDistributorSuccess } = useUpdateDistributor();
  const { mutate: deleteDistributor, isPending: isDeletingDistributor } = useDeleteDistributor();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleOpenDialog = (item?: Region | Area | Territory | Distributor) => {
    setSelectedItem(item || null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedItem(null);
  };

  const handleOpenDeleteDialog = (item: Region | Area | Territory | Distributor) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedItem(null);
  };

  const handleSubmit = (data: Record<string, string | number>) => {
    if (currentTab === 0) {
      // Regions
      if (selectedItem) {
        updateRegion({ id: selectedItem.id, data: { name: data.name as string } });
      } else {
        createRegion({ name: data.name as string });
      }
    } else if (currentTab === 1) {
      // Areas
      if (selectedItem) {
        updateArea({ id: selectedItem.id, data: { name: data.name as string, regionId: data.regionId as number } });
      } else {
        createArea({ name: data.name as string, regionId: data.regionId as number });
      }
    } else if (currentTab === 2) {
      // Territories
      if (selectedItem) {
        updateTerritory({ id: selectedItem.id, data: { name: data.name as string, areaId: data.areaId as number } });
      } else {
        createTerritory({ name: data.name as string, areaId: data.areaId as number });
      }
    } else if (currentTab === 3) {
      // Distributors
      if (selectedItem) {
        updateDistributor({ id: selectedItem.id, data: { name: data.name as string } });
      } else {
        createDistributor({ name: data.name as string });
      }
    }
  };

  const handleDelete = () => {
    if (!selectedItem) return;

    if (currentTab === 0) {
      deleteRegion(selectedItem.id);
    } else if (currentTab === 1) {
      deleteArea(selectedItem.id);
    } else if (currentTab === 2) {
      deleteTerritory(selectedItem.id);
    } else if (currentTab === 3) {
      deleteDistributor(selectedItem.id);
    }
    handleCloseDeleteDialog();
  };

  // Get dialog config based on current tab
  const getDialogConfig = () => {
    const regionOptions = regions?.map((r) => ({ value: r.id, label: r.name })) || [];
    const areaOptions = areas?.map((a) => ({ value: a.id, label: `${a.name} (${a.region?.name || ''})` })) || [];

    switch (currentTab) {
      case 0: // Regions
        return {
          title: selectedItem ? 'Edit Region' : 'Create Region',
          fields: [{ name: 'name', label: 'Region Name', type: 'text' as const, required: true }],
          isPending: isCreatingRegion || isUpdatingRegion,
          error: createRegionError || updateRegionError,
          isSuccess: createRegionSuccess || updateRegionSuccess,
        };
      case 1: // Areas
        return {
          title: selectedItem ? 'Edit Area' : 'Create Area',
          fields: [
            { name: 'name', label: 'Area Name', type: 'text' as const, required: true },
            { name: 'regionId', label: 'Region', type: 'select' as const, options: regionOptions, required: true },
          ],
          isPending: isCreatingArea || isUpdatingArea,
          error: createAreaError || updateAreaError,
          isSuccess: createAreaSuccess || updateAreaSuccess,
        };
      case 2: // Territories
        return {
          title: selectedItem ? 'Edit Territory' : 'Create Territory',
          fields: [
            { name: 'name', label: 'Territory Name', type: 'text' as const, required: true },
            { name: 'areaId', label: 'Area', type: 'select' as const, options: areaOptions, required: true },
          ],
          isPending: isCreatingTerritory || isUpdatingTerritory,
          error: createTerritoryError || updateTerritoryError,
          isSuccess: createTerritorySuccess || updateTerritorySuccess,
        };
      case 3: // Distributors
        return {
          title: selectedItem ? 'Edit Distributor' : 'Create Distributor',
          fields: [{ name: 'name', label: 'Distributor Name', type: 'text' as const, required: true }],
          isPending: isCreatingDistributor || isUpdatingDistributor,
          error: createDistributorError || updateDistributorError,
          isSuccess: createDistributorSuccess || updateDistributorSuccess,
        };
      default:
        return {
          title: '',
          fields: [],
          isPending: false,
          error: null,
          isSuccess: false,
        };
    }
  };

  const dialogConfig = getDialogConfig();
  const isDeleting = isDeletingRegion || isDeletingArea || isDeletingTerritory || isDeletingDistributor;

  return (
    <Layout>
      <Box>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight={600} gutterBottom>
              Reference Data
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage regions, areas, territories, and distributors
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            disabled={
              (currentTab === 1 && (!regions || regions.length === 0)) ||
              (currentTab === 2 && (!areas || areas.length === 0))
            }
          >
            Add{' '}
            {currentTab === 0 ? 'Region' : currentTab === 1 ? 'Area' : currentTab === 2 ? 'Territory' : 'Distributor'}
          </Button>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={currentTab} onChange={handleTabChange}>
            <Tab label="Regions" />
            <Tab label="Areas" />
            <Tab label="Territories" />
            <Tab label="Distributors" />
          </Tabs>
        </Box>

        {/* Regions Tab */}
        <TabPanel value={currentTab} index={0}>
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {regionsLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : regionsError ? (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Alert severity="error">Failed to load regions.</Alert>
                      </TableCell>
                    </TableRow>
                  ) : !regions || regions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                        <Typography color="text.secondary">No regions found.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    regions.map((region) => (
                      <TableRow key={region.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {region.id}
                          </Typography>
                        </TableCell>
                        <TableCell>{region.name}</TableCell>
                        <TableCell>
                          {region.createdAt ? new Date(region.createdAt).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" color="primary" onClick={() => handleOpenDialog(region)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleOpenDeleteDialog(region)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </TabPanel>

        {/* Areas Tab */}
        <TabPanel value={currentTab} index={1}>
          {!regionsLoading && regions && regions.length === 0 && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              Please create at least one region before adding areas.
            </Alert>
          )}
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Region</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {areasLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : areasError ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Alert severity="error">Failed to load areas.</Alert>
                      </TableCell>
                    </TableRow>
                  ) : !areas || areas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                        <Typography color="text.secondary">No areas found.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    areas.map((area) => (
                      <TableRow key={area.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {area.id}
                          </Typography>
                        </TableCell>
                        <TableCell>{area.name}</TableCell>
                        <TableCell>{area.region?.name || '-'}</TableCell>
                        <TableCell>
                          {area.createdAt ? new Date(area.createdAt).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" color="primary" onClick={() => handleOpenDialog(area)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleOpenDeleteDialog(area)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </TabPanel>

        {/* Territories Tab */}
        <TabPanel value={currentTab} index={2}>
          {!areasLoading && areas && areas.length === 0 && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              Please create at least one area before adding territories.
            </Alert>
          )}
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Area</TableCell>
                    <TableCell>Region</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {territoriesLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : territoriesError ? (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <Alert severity="error">Failed to load territories.</Alert>
                      </TableCell>
                    </TableRow>
                  ) : !territories || territories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                        <Typography color="text.secondary">No territories found.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    territories.map((territory) => (
                      <TableRow key={territory.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {territory.id}
                          </Typography>
                        </TableCell>
                        <TableCell>{territory.name}</TableCell>
                        <TableCell>{territory.area?.name || '-'}</TableCell>
                        <TableCell>{territory.area?.region?.name || '-'}</TableCell>
                        <TableCell>
                          {territory.createdAt ? new Date(territory.createdAt).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" color="primary" onClick={() => handleOpenDialog(territory)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleOpenDeleteDialog(territory)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </TabPanel>

        {/* Distributors Tab */}
        <TabPanel value={currentTab} index={3}>
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {distributorsLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : distributorsError ? (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Alert severity="error">Failed to load distributors.</Alert>
                      </TableCell>
                    </TableRow>
                  ) : !distributors || distributors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                        <Typography color="text.secondary">No distributors found.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    distributors.map((distributor) => (
                      <TableRow key={distributor.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {distributor.id}
                          </Typography>
                        </TableCell>
                        <TableCell>{distributor.name}</TableCell>
                        <TableCell>
                          {distributor.createdAt ? new Date(distributor.createdAt).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" color="primary" onClick={() => handleOpenDialog(distributor)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleOpenDeleteDialog(distributor)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </TabPanel>

        {/* Create/Edit Dialog */}
        <ReferenceDataDialog
          open={dialogOpen}
          title={dialogConfig.title}
          fields={dialogConfig.fields}
          initialData={selectedItem as Record<string, unknown> | null}
          onClose={handleCloseDialog}
          onSubmit={handleSubmit}
          isPending={dialogConfig.isPending}
          error={dialogConfig.error}
          isSuccess={dialogConfig.isSuccess}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={isDeleting ? undefined : handleCloseDeleteDialog}>
          <DialogTitle>
            Delete {currentTab === 0 ? 'Region' : currentTab === 1 ? 'Area' : currentTab === 2 ? 'Territory' : 'Distributor'}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete "{selectedItem?.name}"? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              color="error"
              variant="contained"
              disabled={isDeleting}
              startIcon={isDeleting ? <CircularProgress size={16} /> : null}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}
