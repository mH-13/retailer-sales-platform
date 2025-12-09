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
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { useImportRetailers } from '../hooks/useAdmin';

/**
 * CSV Import Page
 *
 * Allows admins to bulk import retailers from a CSV file
 *
 * Features:
 * - File upload with drag-and-drop
 * - CSV format validation
 * - Upload progress tracking
 * - Detailed results showing success/failure counts
 * - Error reporting with row numbers
 * - CSV template download
 */
export default function ImportCSVPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const { mutate: importCSV, isPending, data: result, error, reset } = useImportRetailers();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.csv')) {
      setSelectedFile(file);
      reset(); // Clear previous results
    } else {
      alert('Please select a valid CSV file');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.csv')) {
      setSelectedFile(file);
      reset();
    } else {
      alert('Please drop a valid CSV file');
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      importCSV(selectedFile);
    }
  };

  const handleDownloadTemplate = () => {
    // Create a sample CSV template
    const template = `uid,name,phone,regionId,areaId,distributorId,territoryId,points,routes,notes
RET-001,Sample Retailer,+1234567890,1,1,1,1,0,Route A,Sample notes
RET-002,Another Retailer,+0987654321,1,2,1,2,100,Route B,More notes`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'retailers_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setSelectedFile(null);
    reset();
  };

  return (
    <Layout>
      <Box>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Import Retailers from CSV
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Bulk upload retailers using a CSV file. Download the template to see the required format.
          </Typography>
        </Box>

        {/* Instructions Card */}
        <Card sx={{ mb: 3, bgcolor: 'info.lighter' }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <InfoIcon color="info" />
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  CSV Format Requirements
                </Typography>
                <Typography variant="body2" color="text.secondary" component="div">
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    <li>Required columns: uid, name, phone, regionId, areaId, distributorId, territoryId</li>
                    <li>Optional columns: points, routes, notes</li>
                    <li>Maximum file size: 10 MB</li>
                    <li>UIDs must be unique across the system</li>
                    <li>Region, Area, Territory, and Distributor IDs must exist in the system</li>
                  </ul>
                </Typography>
                <Button
                  size="small"
                  onClick={handleDownloadTemplate}
                  sx={{ mt: 1 }}
                >
                  Download CSV Template
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Upload Area */}
        <Paper sx={{ p: 4 }}>
          {/* File Drop Zone */}
          {!result && (
            <Box
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              sx={{
                border: 2,
                borderStyle: 'dashed',
                borderColor: dragActive ? 'primary.main' : 'divider',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                bgcolor: dragActive ? 'action.hover' : 'background.default',
                cursor: 'pointer',
                transition: 'all 0.2s',
                mb: 3,
              }}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              <UploadIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {selectedFile ? selectedFile.name : 'Drop your CSV file here or click to browse'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedFile
                  ? `File size: ${(selectedFile.size / 1024).toFixed(2)} KB`
                  : 'Accepts .csv files up to 10 MB'}
              </Typography>
            </Box>
          )}

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => reset()}>
              {error instanceof Error ? error.message : 'Failed to upload CSV file. Please try again.'}
            </Alert>
          )}

          {/* Upload Button */}
          {selectedFile && !result && (
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                onClick={handleReset}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={isPending}
                startIcon={isPending ? <CircularProgress size={20} /> : <UploadIcon />}
              >
                {isPending ? 'Uploading...' : 'Upload and Import'}
              </Button>
            </Box>
          )}

          {/* Results */}
          {result && (
            <Box>
              {/* Success Summary */}
              <Alert
                severity={result.failed === 0 ? 'success' : 'warning'}
                sx={{ mb: 3 }}
                icon={result.failed === 0 ? <SuccessIcon /> : <ErrorIcon />}
              >
                <Typography variant="subtitle1" fontWeight={600}>
                  Import {result.failed === 0 ? 'Completed Successfully' : 'Completed with Errors'}
                </Typography>
                <Typography variant="body2">
                  Successfully imported: <strong>{result.created}</strong> retailers
                  {result.failed > 0 && (
                    <>
                      {' | '}
                      Failed: <strong>{result.failed}</strong> rows
                    </>
                  )}
                </Typography>
              </Alert>

              {/* Error Details Table */}
              {result.errors && result.errors.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Import Errors
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Row</TableCell>
                          <TableCell>UID</TableCell>
                          <TableCell>Error</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {result.errors.map((err: { row: number; uid: string; error: string }, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{err.row}</TableCell>
                            <TableCell>{err.uid}</TableCell>
                            <TableCell>{err.error}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {/* Import Another File */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button variant="contained" onClick={handleReset}>
                  Import Another File
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Layout>
  );
}
