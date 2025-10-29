'use client';

import { Box, Fab, Tooltip, Zoom } from '@mui/material';
import {
  Phone,
  Message,
  Settings,
  SyncAlt,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

const FloatingActionBar = () => {
  const router = useRouter();

  const actions = [
    {
      icon: <Settings />,
      label: 'Repair Service',
      onClick: () => router.push('/repair'),
    },
    {
      icon: <Phone />,
      label: 'Contact Us',
      onClick: () => router.push('/contact'),
    },
    {
      icon: <Message />,
      label: 'Give Feedback',
      onClick: () => router.push('/testimonials'),
    },
    {
      icon: <SyncAlt />,
      label: 'Trade-In',
      onClick: () => router.push('/trade-in'),
    },
  ];

  return (
    <Box
      sx={{
        position: 'fixed',
        right: { xs: 12, sm: 16 },
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        zIndex: 1300,
        '& .MuiFab-root': {
          backgroundColor: '#db1b88',
          color: '#fff',
          width: 48,
          height: 48,
          boxShadow: 3,
          '&:hover': {
            backgroundColor: '#b1166f',
            transform: 'scale(1.1)',
          },
          transition: 'all 0.2s ease-in-out',
        },
      }}
    >
      {actions.map((action, index) => (
        <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
          <Tooltip title={action.label} placement="left" arrow>
            <Fab
              size="medium"
              aria-label={action.label}
              onClick={action.onClick}
              sx={{}}
            >
              {action.icon}
            </Fab>
          </Tooltip>
        </Zoom>
      ))}
    </Box>
  );
};

export default FloatingActionBar;