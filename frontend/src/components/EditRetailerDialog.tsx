import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useUpdateRetailer } from '../hooks/useRetailers';
import type { Retailer } from '../types';

/**
 * Edit Retailer Dialog
 *
 * Modal dialog for editing retailer information:
 * - Points (number)
 * - Routes (text)
 * - Notes (text area)
 */

interface EditRetailerDialogProps {
  open: boolean;
  retailer: Retailer | null;
  onClose: () => void;
}

export default function EditRetailerDialog({
  open,
  retailer,
  onClose,
}: EditRetailerDialogProps) {
  const [points, setPoints] = useState('');
  const [routes, setRoutes] = useState('');
  const [notes, setNotes] = useState('');

  const { mutate: updateRetailer, isPending, error, isSuccess } = useUpdateRetailer();

  // Initialize form with retailer data when dialog opens
  useEffect(() => {
    if (retailer) {
      setPoints(retailer.points.toString());
      setRoutes(retailer.routes || '');
      setNotes(retailer.notes || '');
    }
  }, [retailer]);

  // Close dialog after successful update
  useEffect(() => {
    if (isSuccess) {
      handleClose();
    }
  }, [isSuccess]);

  const handleClose = () => {
    setPoints('');
    setRoutes('');
    setNotes('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!retailer) return;

    updateRetailer({
      uid: retailer.uid,
      data: {
        points: parseInt(points, 10),
        routes: routes.trim() || undefined,
        notes: notes.trim() || undefined,
      },
    });
  };

  if (!retailer) return null;

  return (
    <Dialog
      open={open}
      onClose={isPending ? undefined : handleClose}
      maxWidth="sm"
      fullWidth
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          <Typography variant="h6" fontWeight={600}>
            Edit Retailer
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {retailer.name} ({retailer.uid})
          </Typography>
        </DialogTitle>

        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Failed to update retailer. Please try again.
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {/* Retailer Info (Read-only) */}
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Phone
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {retailer.phone}
              </Typography>

              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Region
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {retailer.region?.name || '-'}
              </Typography>

              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Territory
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {retailer.territory?.name || '-'}
              </Typography>
            </Box>

            {/* Points Field */}
            <TextField
              label="Points"
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              required
              disabled={isPending}
              fullWidth
              helperText="Loyalty points for this retailer"
            />

            {/* Routes Field */}
            <TextField
              label="Routes"
              value={routes}
              onChange={(e) => setRoutes(e.target.value)}
              disabled={isPending}
              fullWidth
              multiline
              rows={2}
              helperText="Delivery routes or schedule information"
              placeholder="e.g., Mon-Wed-Fri, Route A"
            />

            {/* Notes Field */}
            <TextField
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isPending}
              fullWidth
              multiline
              rows={3}
              helperText="Internal notes about this retailer"
              placeholder="Add any important notes here..."
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isPending}
            startIcon={isPending ? <CircularProgress size={16} /> : null}
          >
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
