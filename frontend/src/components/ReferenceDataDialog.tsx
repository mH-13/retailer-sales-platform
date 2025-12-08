import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  MenuItem,
} from '@mui/material';

/**
 * Reference Data Dialog
 *
 * Generic reusable dialog for creating/editing reference data entities
 * Used for: Regions, Areas, Territories, Distributors
 */

interface Field {
  name: string;
  label: string;
  type?: 'text' | 'select';
  options?: Array<{ value: number; label: string }>;
  required?: boolean;
}

interface ReferenceDataDialogProps<T> {
  open: boolean;
  title: string;
  fields: Field[];
  initialData?: T | null;
  onClose: () => void;
  onSubmit: (data: Record<string, string | number>) => void;
  isPending: boolean;
  error: unknown;
  isSuccess: boolean;
}

export default function ReferenceDataDialog<T extends Record<string, unknown>>({
  open,
  title,
  fields,
  initialData,
  onClose,
  onSubmit,
  isPending,
  error,
  isSuccess,
}: ReferenceDataDialogProps<T>) {
  const [formData, setFormData] = useState<Record<string, string>>({});

  // Initialize form with data when dialog opens
  useEffect(() => {
    if (initialData) {
      const data: Record<string, string> = {};
      fields.forEach((field) => {
        const value = initialData[field.name];
        data[field.name] = value ? String(value) : '';
      });
      setFormData(data);
    } else {
      // Reset form for create mode
      const data: Record<string, string> = {};
      fields.forEach((field) => {
        data[field.name] = '';
      });
      setFormData(data);
    }
  }, [initialData, fields, open]);

  // Close dialog after successful submission
  useEffect(() => {
    if (isSuccess) {
      handleClose();
    }
  }, [isSuccess]);

  const handleClose = () => {
    setFormData({});
    onClose();
  };

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert to appropriate types
    const data: Record<string, string | number> = {};
    fields.forEach((field) => {
      const value = formData[field.name];
      if (field.type === 'select') {
        data[field.name] = parseInt(value, 10);
      } else {
        data[field.name] = value;
      }
    });

    onSubmit(data);
  };

  return (
    <Dialog
      open={open}
      onClose={isPending ? undefined : handleClose}
      maxWidth="sm"
      fullWidth
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>{title}</DialogTitle>

        <DialogContent>
          {!!error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              An error occurred. Please try again.
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {fields.map((field) => (
              <TextField
                key={field.name}
                label={field.label}
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required !== false}
                disabled={isPending}
                fullWidth
                select={field.type === 'select'}
              >
                {field.type === 'select' ? (
                  field.options?.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))
                ) : undefined}
              </TextField>
            ))}
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
            {isPending ? 'Saving...' : initialData ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
