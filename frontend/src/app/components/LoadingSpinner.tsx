// src/components/LoadingSpinner.tsx
import { Box, CircularProgress } from '@mui/material';

export default function LoadingSpinner() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: '#f8f9fa',
      }}
    >
      <CircularProgress sx={{ color: '#db1b88' }} />
    </Box>
  );
}