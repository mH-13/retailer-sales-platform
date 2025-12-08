import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  TextField,
  Stack,
} from '@mui/material';
import {
  Store as StoreIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';

/**
 * Demo App - Material-UI Component Showcase
 *
 * Demonstrates the professional, aesthetic design we'll use:
 * - Clean layout with proper spacing
 * - Professional color scheme (blue primary)
 * - Component variety (buttons, cards, inputs, chips)
 * - Sample retailer card preview
 */
function App() {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" component="h1" gutterBottom color="primary">
            Retailer Sales Platform
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Material-UI Components Demo ✨
          </Typography>
        </Box>

        {/* Component Showcase Grid */}
        <Grid container spacing={3}>

          {/* Buttons Card */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Buttons
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Different button variants for actions
                </Typography>
                <Stack spacing={2}>
                  <Button variant="contained" color="primary" fullWidth>
                    Primary Button
                  </Button>
                  <Button variant="outlined" color="primary" fullWidth>
                    Outlined Button
                  </Button>
                  <Button variant="text" color="primary" fullWidth>
                    Text Button
                  </Button>
                  <Button variant="contained" color="error" fullWidth>
                    Delete Action
                  </Button>
                  <Button variant="contained" color="success" fullWidth startIcon={<CheckIcon />}>
                    Success Action
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Form Inputs Card */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Form Inputs
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Text fields with labels and validation
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    label="Username"
                    variant="outlined"
                    fullWidth
                    placeholder="Enter username"
                  />
                  <TextField
                    label="Password"
                    variant="outlined"
                    type="password"
                    fullWidth
                    placeholder="Enter password"
                  />
                  <TextField
                    label="Search Retailers"
                    variant="outlined"
                    fullWidth
                    placeholder="Search by name, phone, or UID"
                  />
                  <TextField
                    label="Notes"
                    variant="outlined"
                    multiline
                    rows={3}
                    fullWidth
                    placeholder="Add retailer notes..."
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Chips/Badges Card */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Chips & Badges
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Status indicators and tags
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip label="150 points" color="primary" />
                  <Chip label="Active" color="success" />
                  <Chip label="Pending" color="warning" />
                  <Chip label="Inactive" color="error" />
                  <Chip label="Admin" color="secondary" />
                  <Chip label="Sales Rep" variant="outlined" />
                  <Chip label="React 18" size="small" />
                  <Chip label="TypeScript" size="small" />
                  <Chip label="Material-UI" size="small" />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Sample Retailer Card */}
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box>
                    <Typography variant="h5" component="div" gutterBottom>
                      <StoreIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                      Rahman Store
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      RET-DHA-001
                    </Typography>
                  </Box>
                  <Chip label="150 pts" color="success" />
                </Box>

                <Stack spacing={1} sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    <PhoneIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                    +880 1711-111111
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <LocationIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                    Dhaka › Gulshan
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <ShippingIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                    Routes: A, B
                  </Typography>
                </Stack>
              </CardContent>
              <CardActions sx={{ px: 2, pb: 2 }}>
                <Button size="small" variant="contained" fullWidth>
                  View Details
                </Button>
                <Button size="small" variant="outlined" fullWidth>
                  Edit
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* Tech Stack Info */}
          <Grid item xs={12}>
            <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom align="center">
                  Tech Stack
                </Typography>
                <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" useFlexGap>
                  <Chip label="React 18" sx={{ bgcolor: 'white', color: 'primary.main' }} />
                  <Chip label="TypeScript" sx={{ bgcolor: 'white', color: 'primary.main' }} />
                  <Chip label="Material-UI v6" sx={{ bgcolor: 'white', color: 'primary.main' }} />
                  <Chip label="Vite" sx={{ bgcolor: 'white', color: 'primary.main' }} />
                  <Chip label="React Router" sx={{ bgcolor: 'white', color: 'primary.main' }} />
                  <Chip label="TanStack Query" sx={{ bgcolor: 'white', color: 'primary.main' }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default App;
