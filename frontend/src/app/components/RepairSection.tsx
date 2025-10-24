"use client";
import { Box, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';

const GadgetRepairSection = () => {
  const router = useRouter();

  const handleClick = (path: string) => {
    router.push(path);
  };

  return (
    <Box
      sx={{
        background: 'linear-gradient(180deg, #fff 40%, #9a979fff 100%)',
        color: '#000',
        padding: { xs: '24px 16px', md: '40px 24px' },
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      {/* Horizontal Black Line */}
      <Box sx={{ width: '100%', height: '2px', backgroundColor: '#000', mb: 4 }} />

      {/* Title Section */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography
          variant="h3"
          sx={{
            fontSize: { xs: '28px', md: '36px' },
            fontWeight: 700,
            lineHeight: 1.2,
            color: '#000',
            mb: 1,
          }}
        >
          Discover the expertise in our Repair Services
        </Typography>
      </Box>

      {/* Features List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Feature 1 */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 0',
            borderBottom: '1px solid #333',
            '&:last-child': {
              borderBottom: 'none',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Typography
              sx={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#000',
                mr: 3,
                minWidth: '24px',
              }}
            >
              1
            </Typography>
            <Typography
              sx={{
                fontSize: '16px',
                fontWeight: 500,
                color: '#000',
                flex: 1,
              }}
            >
              Smartphone screen repairs
            </Typography>
          </Box>
          <Typography
            onClick={() => handleClick('/repair')}
            sx={{
              fontSize: '24px',
              fontWeight: 300,
              color: '#000',
              cursor: 'pointer',
              '&:hover': {
                color: '#ccc',
              },
            }}
          >
            →
          </Typography>
        </Box>

        {/* Feature 2 */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 0',
            borderBottom: '1px solid #333',
            '&:last-child': {
              borderBottom: 'none',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Typography
              sx={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#000',
                mr: 3,
                minWidth: '24px',
              }}
            >
              2
            </Typography>
            <Typography
              sx={{
                fontSize: '16px',
                fontWeight: 500,
                color: '#000',
                flex: 1,
              }}
            >
              Laptop hardware fixes
            </Typography>
          </Box>
          <Typography
            onClick={() => handleClick('/repair')}
            sx={{
              fontSize: '24px',
              fontWeight: 300,
              color: '#000',
              cursor: 'pointer',
              '&:hover': {
                color: '#ccc',
              },
            }}
          >
            →
          </Typography>
        </Box>

        {/* Feature 3 */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 0',
            borderBottom: '1px solid #333',
            '&:last-child': {
              borderBottom: 'none',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Typography
              sx={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#000',
                mr: 3,
                minWidth: '24px',
              }}
            >
              3
            </Typography>
            <Typography
              sx={{
                fontSize: '16px',
                fontWeight: 500,
                color: '#000',
                flex: 1,
              }}
            >
              Headphone audio restoration
            </Typography>
          </Box>
          <Typography
            onClick={() => handleClick('/repair')}
            sx={{
              fontSize: '24px',
              fontWeight: 300,
              color: '#000',
              cursor: 'pointer',
              '&:hover': {
                color: '#ccc',
              },
            }}
          >
            →
          </Typography>
        </Box>

        {/* Feature 4 */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 0',
            borderBottom: '1px solid #333',
            '&:last-child': {
              borderBottom: 'none',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Typography
              sx={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#000',
                mr: 3,
                minWidth: '24px',
              }}
            >
              4
            </Typography>
            <Typography
              sx={{
                fontSize: '16px',
                fontWeight: 500,
                color: '#000',
                flex: 1,
              }}
            >
              Tv display repairs
            </Typography>
          </Box>
          <Typography
            onClick={() => handleClick('/repair')}
            sx={{
              fontSize: '24px',
              fontWeight: 300,
              color: '#000',
              cursor: 'pointer',
              '&:hover': {
                color: '#ccc',
              },
            }}
          >
            →
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default GadgetRepairSection;