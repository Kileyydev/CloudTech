// src/app/trade-in/page.tsx
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Stack,
  Paper,
  useTheme,
  useMediaQuery,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Phone,
  CheckCircle,
  Error,
  Upload,
  CameraAlt,
  Info,
  CurrencyExchange,
} from '@mui/icons-material';
import TopNavBar from '@/app/components/TopNavBar';
import MainNavBar from '@/app/components/MainNavBar';
import FooterSection from '@/app/components/FooterSection';
import TickerBar from '../components/TickerBar';

// Deduction rules (KSH) – based on average market
const DEDUCTIONS = {
  screen: { cracked: 30000, scratched: 10000, perfect: 0 },
  battery: { 'Below 80%': 15000, '80-90%': 5000, 'Above 90%': 0 },
  body: { dented: 20000, scratched: 8000, perfect: 0 },
  camera: { blurry: 25000, scratched: 10000, perfect: 0 },
  functionality: { 'Some issues': 30000, 'Minor lag': 10000, perfect: 0 },
};

// Estimate base value based on model keywords (client-side logic)
const estimateBaseValue = (model: string): number => {
  const lower = model.toLowerCase();
  if (lower.includes('iphone 15 pro max')) return 140000;
  if (lower.includes('iphone 15 pro')) return 130000;
  if (lower.includes('iphone 15')) return 110000;
  if (lower.includes('iphone 14 pro max')) return 120000;
  if (lower.includes('iphone 14 pro')) return 110000;
  if (lower.includes('iphone 14')) return 90000;
  if (lower.includes('s23 ultra')) return 130000;
  if (lower.includes('s23')) return 95000;
  if (lower.includes('pixel 8 pro')) return 100000;
  if (lower.includes('pixel 8')) return 80000;
  if (lower.includes('oneplus')) return 70000;
  if (lower.includes('xiaomi')) return 65000;
  return 50000; // fallback
};

export default function TradeInPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [activeStep, setActiveStep] = useState(0);
  const [phoneModel, setPhoneModel] = useState('');
  const [condition, setCondition] = useState({
    screen: 'perfect',
    battery: 'Above 90%',
    body: 'perfect',
    camera: 'perfect',
    functionality: 'perfect',
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [estimatedValue, setEstimatedValue] = useState(0);

  const baseValue = phoneModel ? estimateBaseValue(phoneModel) : 0;

  // Calculate final value
  const calculateValue = useCallback(() => {
    if (!phoneModel) return 0;
    let totalDeduction = 0;
    totalDeduction += DEDUCTIONS.screen[condition.screen as keyof typeof DEDUCTIONS.screen];
    totalDeduction += DEDUCTIONS.battery[condition.battery as keyof typeof DEDUCTIONS.battery];
    totalDeduction += DEDUCTIONS.body[condition.body as keyof typeof DEDUCTIONS.body];
    totalDeduction += DEDUCTIONS.camera[condition.camera as keyof typeof DEDUCTIONS.camera];
    totalDeduction += DEDUCTIONS.functionality[condition.functionality as keyof typeof DEDUCTIONS.functionality];
    return Math.max(0, Math.floor(baseValue - totalDeduction));
  }, [phoneModel, condition, baseValue]);

  useEffect(() => {
    setEstimatedValue(calculateValue());
  }, [calculateValue]);

  const handleNext = () => {
    if (activeStep === 0 && !phoneModel.trim()) return;
    if (activeStep === 1 && estimatedValue === 0) return;
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).slice(0, 4 - photos.length);
      setPhotos((prev) => [...prev, ...newFiles]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const steps = ['Phone Model', 'Condition', 'Estimated Value', 'Upload & Visit'];

  return (
    <>
    <TickerBar/>
      <TopNavBar />
      <MainNavBar />

      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: { xs: 4, md: 8 } }}>
        <Container maxWidth="md">
          <Typography
            variant="h3"
            align="center"
            sx={{ mb: 4, fontWeight: 700, color: 'primary.main' }}
          >
            Trade-In Calculator
          </Typography>

          <Alert severity="info" sx={{ mb: 4 }}>
            <strong>Estimate Only:</strong> Final value confirmed in-store after inspection.
          </Alert>

          <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 5 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {/* STEP 1: Phone Model */}
              {activeStep === 0 && (
                <Stack spacing={3}>
                  <Typography variant="h6" color="text.primary">
                    What phone do you want to trade in?
                  </Typography>
                  <TextField
                    fullWidth
                    label="Phone Model"
                    placeholder="e.g. iPhone 14 Pro Max, Samsung S23 Ultra"
                    value={phoneModel}
                    onChange={(e) => setPhoneModel(e.target.value)}
                    required
                    autoFocus
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  {phoneModel && baseValue > 0 && (
                    <Alert severity="success" icon={<CurrencyExchange />}>
                      Estimated base value: <strong>KSh {baseValue.toLocaleString()}</strong>
                    </Alert>
                  )}
                </Stack>
              )}

              {/* STEP 2: Condition */}
              {activeStep === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom color="text.primary">
                    Rate Your Phone's Condition
                  </Typography>
                  <Stack spacing={3}>
                    {[
                      { label: 'Screen', key: 'screen', options: ['perfect', 'scratched', 'cracked'] },
                      { label: 'Battery Health', key: 'battery', options: ['Above 90%', '80-90%', 'Below 80%'] },
                      { label: 'Body', key: 'body', options: ['perfect', 'scratched', 'dented'] },
                      { label: 'Camera', key: 'camera', options: ['perfect', 'scratched', 'blurry'] },
                      { label: 'Functionality', key: 'functionality', options: ['perfect', 'Minor lag', 'Some issues'] },
                    ].map((item) => (
                      <FormControl key={item.key}>
                        <FormLabel>{item.label}</FormLabel>
                        <RadioGroup
                          row={!isMobile}
                          value={condition[item.key as keyof typeof condition]}
                          onChange={(e) =>
                            setCondition((prev) => ({ ...prev, [item.key]: e.target.value }))
                          }
                        >
                          {item.options.map((opt) => (
                            <FormControlLabel
                              key={opt}
                              value={opt}
                              control={<Radio color="primary" />}
                              label={opt}
                            />
                          ))}
                        </RadioGroup>
                      </FormControl>
                    ))}
                  </Stack>
                </Box>
              )}

              {/* STEP 3: Estimated Value */}
              {activeStep === 2 && (
                <Box textAlign="center">
                  <CurrencyExchange sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h5" gutterBottom>
                    Your Estimated Trade-In Value
                  </Typography>

                  <Paper
                    elevation={3}
                    sx={{
                      p: 4,
                      bgcolor: estimatedValue > 0 ? 'success.light' : 'grey.100',
                      border: '2px solid',
                      borderColor: estimatedValue > 0 ? 'success.main' : 'grey.300',
                      borderRadius: 3,
                    }}
                  >
                    <Typography
                      variant="h3"
                      fontWeight={700}
                      color={estimatedValue > 0 ? 'success.contrastText' : 'text.secondary'}
                    >
                      KSh {estimatedValue.toLocaleString()}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {phoneModel}
                    </Typography>
                  </Paper>

                  <Alert severity="warning" sx={{ mt: 3, textAlign: 'left' }}>
                    This is an <strong>estimate</strong>. Final value may vary after in-store inspection.
                  </Alert>
                </Box>
              )}

              {/* STEP 4: Upload & Visit */}
              {activeStep === 3 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Upload Photos (Optional)
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Clear photos help us verify condition faster.
                  </Typography>

                  <Box
                    sx={{
                      border: '2px dashed',
                      borderColor: 'primary.main',
                      borderRadius: 2,
                      p: 3,
                      textAlign: 'center',
                      bgcolor: 'background.paper',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                    component="label"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      onChange={handlePhotoUpload}
                    />
                    <Upload sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                    <Typography>Click to upload (max 4 photos)</Typography>
                  </Box>

                  <Stack direction="row" flexWrap="wrap" gap={2} mt={2}>
                    {photos.map((photo, i) => (
                      <Box key={i} position="relative">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Upload ${i + 1}`}
                          style={{
                            width: 100,
                            height: 100,
                            objectFit: 'cover',
                            borderRadius: 8,
                            border: `2px solid ${theme.palette.primary.main}`,
                          }}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            bgcolor: 'error.main',
                            color: 'white',
                            '&:hover': { bgcolor: 'error.dark' },
                          }}
                          onClick={() => removePhoto(i)}
                        >
                          <Error fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Stack>

                  <Box mt={4} p={3} bgcolor="info.light" borderRadius={2}>
                    <Typography variant="h6" gutterBottom>
                      Bring Your Phone to:
                    </Typography>
                    <Typography fontWeight={600}>CloudTech – Nairobi CBD</Typography>
                    <Typography>Kenya Cinema Building, Moi Avenue</Typography>
                    <Typography>Open: Mon–Sat, 9AM–6PM</Typography>
                    <Typography mt={1} color="text.secondary">
                      <Info sx={{ verticalAlign: 'middle', fontSize: 16, mr: 0.5 }} />
                      Bring ID. Final value confirmed in-store.
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Navigation */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 5 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  variant="outlined"
                  color="inherit"
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={
                    (activeStep === 0 && !phoneModel.trim()) ||
                    (activeStep === 1 && estimatedValue === 0)
                  }
                  sx={{
                    bgcolor: 'primary.main',
                    '&:hover': { bgcolor: 'primary.dark' },
                  }}
                >
                  {activeStep === steps.length - 1 ? 'Done' : 'Next'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>


    </>
  );
}