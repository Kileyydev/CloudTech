'use client';

import { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, Button, Slide } from '@mui/material';
import { Send } from '@mui/icons-material';

import { RefObject } from 'react';

interface SideMessagePanelProps {
  footerRef: RefObject<HTMLElement>;
}

const SideMessagePanel = ({ footerRef }: SideMessagePanelProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 } // Trigger when 10% of footer is visible
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => {
      if (footerRef.current) {
        observer.unobserve(footerRef.current);
      }
    };
  }, [footerRef]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (panelRef.current) {
      const input = panelRef.current.querySelector('input');
      const message = input ? (input as HTMLInputElement).value : '';
      console.log('Message sent:', message);
      // Add your SendGrid API call here later
      if (input) {
        (input as HTMLInputElement).value = '';
      }
    }
  };

  return (
    <Slide direction="left" in={isVisible} mountOnEnter unmountOnExit>
      <Box
        ref={panelRef}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          width: { xs: 400, md: 400 },
          p: 3,
          backdropFilter: 'blur(12px)',
          background: 'rgba(255, 255, 255, 0.25)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          zIndex: 1000,
          transition: 'all 0.3s ease',
          color: '#fff',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: '#000',
            mb: 1,
            fontWeight: 600,
          }}
        >
          💬 How May We Help You?
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: 'rgba(0, 0, 0, 0.9)',
            mb: 2,
          }}
        >
          Send us a message!
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your message..."
            InputProps={{
              sx: {
                color: '#000',
                '&::placeholder': { color: 'rgba(255,255,255,0.7)' },
              },
            }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                background: 'rgba(255,255,255,0.15)',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                '&:hover fieldset': { borderColor: '#db1b88' },
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            endIcon={<Send />}
            sx={{
              background: 'linear-gradient(135deg, #db1b88, #b1166f)',
              color: '#fff',
              textTransform: 'none',
              fontWeight: '600',
              boxShadow: '0 0 10px rgba(219,27,136,0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #b1166f, #881055)',
                boxShadow: '0 0 15px rgba(219,27,136,0.6)',
              },
            }}
          >
            Send
          </Button>
        </form>
      </Box>
    </Slide>
  );
};

export default SideMessagePanel;
