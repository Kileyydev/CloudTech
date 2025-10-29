// src/app/ClientRoot.tsx
'use client';

import { Box, Fab, Tooltip, Zoom } from '@mui/material';
import { Phone, Message, Settings, SyncAlt } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

interface ClientRootProps {
  children: ReactNode;
}

const FloatingActionBar = ({ children }: { children: ReactNode }) => {
  const router = useRouter();

  const actions = [
    {
      icon: <Settings />,
      label: 'Repair Service',
      path: '/repair',
    },
    {
      icon: <Phone />,
      label: 'Chat on WhatsApp', // Updated label
      href: 'https://wa.me/254722244482', // Your WhatsApp number
      isExternal: true,
    },
    {
      icon: <Message />,
      label: 'Give Feedback',
      path: '/testimonials',
    },
    {
      icon: <SyncAlt />,
      label: 'Trade-In',
      path: '/trade-in',
    },
  ];

  return (
    <>
      {children}

      <Box
        sx={{
          position: 'fixed',
          right: { xs: 12, sm: 16 },
          top: '50%',
          transform: 'translateY(-50%)',
          display: { xs: 'none', sm: 'flex' },
          flexDirection: 'column',
          gap: 1.5,
          zIndex: 1300,
          '& .MuiFab-root': {
            backgroundColor: '#db1b88',
            color: '#fff',
            width: 50,
            height: 50,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'all 0.25s ease',
            '&:hover': {
              backgroundColor: '#b1166f',
              transform: 'scale(1.12)',
              boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
            },
          },
        }}
      >
        {actions.map((action, i) => (
          <Zoom key={action.path || action.href} in={true} style={{ transitionDelay: `${i * 80}ms` }}>
            <Tooltip title={action.label} placement="left" arrow>
              <Fab
                size="medium"
                aria-label={action.label}
                onClick={() => {
                  if (action.isExternal && action.href) {
                    window.open(action.href, '_blank', 'noopener,noreferrer');
                  } else if (action.path) {
                    router.push(action.path);
                  }
                }}
                sx={{
                  backgroundColor: action.href ? '#25D366' : '#db1b88', // WhatsApp green
                  '&:hover': {
                    backgroundColor: action.href ? '#1DA851' : '#b1166f',
                  },
                }}
              >
                {action.icon}
              </Fab>
            </Tooltip>
          </Zoom>
        ))}
      </Box>
    </>
  );
};

export default function ClientRoot({ children }: ClientRootProps) {
  return <FloatingActionBar>{children}</FloatingActionBar>;
}