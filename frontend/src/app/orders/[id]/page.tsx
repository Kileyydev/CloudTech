// src/app/orders/[id]/page.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container, Typography, Box, Paper, Stack, Button, Divider,
  Stepper, Step, StepLabel, StepIconProps
} from '@mui/material';
import { Check, Download } from '@mui/icons-material';
import TopNavBar from '../../components/TopNavBar';
import MainNavBar from '../../components/MainNavBar';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const statusFlow = [
  { key: 'received', label: 'Order Received' },
  { key: 'processing', label: 'Processing' },
  { key: 'packing', label: 'Packing' },
  { key: 'dispatched', label: 'Dispatched' },
  { key: 'delivered', label: 'Delivered' },
];

const CustomStepIcon = (props: StepIconProps & { completed?: boolean; active?: boolean }) => {
  const { active, completed } = props;

  return (
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: completed ? '#db1b88' : active ? '#db1b88' : '#e0e0e0',
        color: completed || active ? 'white' : '#999',
        border: completed || active ? 'none' : '2px solid #e0e0e0',
        transition: 'all 0.3s ease',
        zIndex: 1,
      }}
    >
      {completed ? <Check sx={{ fontSize: 20 }} /> : null}
    </Box>
  );
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const found = orders.find((o: any) => o.id === id);

    if (found && found.items && Array.isArray(found.items) && found.items.length > 0) {
      setOrder(found);
    } else {
      router.push('/orders');
    }
  }, [id, router]);

  const generatePDF = async () => {
    if (!pdfRef.current || !order) return;
    const canvas = await html2canvas(pdfRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    pdf.save(`CloudTech_${order.id}.pdf`);
  };

  if (!order) return null;

  const activeStep = statusFlow.findIndex(s => s.key === order.status);
  const paymentLabel = order.payment === 'cod' ? 'Cash on Delivery' : 
                      order.payment === 'paybill' ? 'M-Pesa Paybill' : 'Withdraw Option';

  return (
    <Box sx={{ bgcolor: 'white', minHeight: '100vh' }}>
      <TopNavBar />
      <MainNavBar />
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: '#db1b88' }}>
          Order #{order.id}
        </Typography>
        <Typography color="text.secondary" gutterBottom>
          Placed on {new Date(order.date).toLocaleString()}
        </Typography>

        <Stack spacing={4} mt={4}>
          {/* STATUS TIMELINE */}
          <Paper sx={{ p: 4, borderRadius: 3, bgcolor: 'white' }}>
            <Typography fontWeight={600} mb={3} textAlign="center" color="#333">
              Order Status
            </Typography>
            <Stepper activeStep={activeStep} alternativeLabel connector={<Box sx={{ flex: 1, height: 2, bgcolor: '#e0e0e0', mx: -1 }} />}>
              {statusFlow.map((status, index) => (
                <Step key={status.key} completed={index < activeStep} active={index === activeStep}>
                  <StepLabel
                    StepIconComponent={(props) => <CustomStepIcon {...props} completed={index < activeStep} active={index === activeStep} />}
                    sx={{
                      '& .MuiStepLabel-label': {
                        mt: 2,
                        fontSize: '0.85rem',
                        color: index <= activeStep ? '#db1b88' : '#999',
                        fontWeight: index === activeStep ? 600 : 400,
                      },
                    }}
                  >
                    {status.label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>

          {/* CUSTOMER INFO */}
          <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'white' }}>
            <Typography fontWeight={600} mb={2} color="#333">Customer Details</Typography>
            <Stack spacing={1}>
              <Typography><strong>Name:</strong> {order.name}</Typography>
              <Typography><strong>Phone:</strong> {order.phone}</Typography>
              <Typography><strong>Delivery Address:</strong> {order.address}, {order.city}</Typography>
              {order.postalCode && <Typography><strong>Postal:</strong> {order.postalCode}</Typography>}
            </Stack>
          </Paper>

          {/* PAYMENT INFO */}
          <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'white' }}>
            <Typography fontWeight={600} mb={2} color="#333">Payment Details</Typography>
            <Stack spacing={1}>
              <Typography><strong>Method:</strong> {paymentLabel}</Typography>
              {order.payment === 'cod' && order.cashAmount > 0 && (
                <>
                  <Typography><strong>Cash Paid:</strong> KES {order.cashAmount.toLocaleString()}</Typography>
                  {order.change > 0 && <Typography><strong>Change Due:</strong> KES {order.change.toLocaleString()}</Typography>}
                </>
              )}
              {order.mpesaCode && <Typography><strong>M-Pesa Code:</strong> {order.mpesaCode}</Typography>}
            </Stack>
          </Paper>

          {/* ITEMS & TOTALS */}
          <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'white' }}>
            <Typography fontWeight={600} mb={2} color="#333">
              Order Items ({order.items.length} item{order.items.length !== 1 ? 's' : ''})
            </Typography>
            
            {/* ITEMS LIST */}
            <Stack spacing={1} sx={{ mb: 3 }}>
              {order.items.map((item: any) => (
                <Box key={item.id} display="flex" justifyContent="space-between" py={1} sx={{ borderBottom: '1px solid #eee' }}>
                  <Typography sx={{ fontSize: '0.95rem', fontWeight: 500 }}>
                    {item.title} × {item.quantity}
                  </Typography>
                  <Typography fontWeight={600} sx={{ fontSize: '0.95rem' }}>
                    KES {(item.price * item.quantity).toLocaleString()}
                  </Typography>
                </Box>
              ))}
            </Stack>

            {/* TOTALS - 100% FROM localStorage */}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ pt: 2 }}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography>Subtotal:</Typography>
                <Typography>KES {order.subtotal.toLocaleString()}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography>Shipping:</Typography>
                <Typography>KES {order.shipping.toLocaleString()}</Typography>
              </Box>
              <Divider />
              <Box display="flex" justifyContent="space-between" mt={2} sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#db1b88' }}>
                <Typography>Total:</Typography>
                <Typography>KES {order.total.toLocaleString()}</Typography>
              </Box>
            </Box>
          </Paper>

          {/* DOWNLOAD BUTTON */}
          <Button
            variant="contained"
            fullWidth
            startIcon={<Download />}
            onClick={generatePDF}
            sx={{
              background: '#db1b88',
              '&:hover': { background: '#b1166f' },
              borderRadius: 3,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            Download Receipt
          </Button>
        </Stack>
      </Container>

      {/* HIDDEN PDF */}
      <Box sx={{ position: 'absolute', left: '-9999px' }} ref={pdfRef}>
        <Box sx={{ p: 8, bgcolor: '#fff', width: 600, fontFamily: 'Arial, sans-serif', color: '#000' }}>
          <Box textAlign="center" mb={3}>
            <img src="/cloudtech-logo.png" alt="CloudTech" style={{ height: 70 }} />
          </Box>
          <Typography variant="h4" align="center" gutterBottom sx={{ color: '#000', fontWeight: 700 }}>
            Official Receipt
          </Typography>
          <Typography align="center" sx={{ color: '#000' }}>
            Order ID: {order.id}
          </Typography>
          <Typography align="center" sx={{ color: '#000', fontSize: 12 }}>
            {new Date(order.date).toLocaleString()}
          </Typography>

          <Divider sx={{ my: 3, borderColor: '#000' }} />

          <Typography sx={{ color: '#000' }}><strong>Customer:</strong> {order.name}</Typography>
          <Typography sx={{ color: '#000' }}><strong>Phone:</strong> {order.phone}</Typography>
          <Typography sx={{ color: '#000' }}><strong>Delivery:</strong> {order.address}, {order.city}</Typography>
          <Typography sx={{ color: '#000' }}><strong>Payment:</strong> {paymentLabel}</Typography>
          {order.change > 0 && <Typography sx={{ color: '#000' }}><strong>Change Due:</strong> KES {order.change.toLocaleString()}</Typography>}

          <Divider sx={{ my: 3, borderColor: '#000' }} />

          {order.items.map((item: any) => (
            <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <span style={{ fontSize: '12px' }}>{item.title} × {item.quantity}</span>
              <span style={{ fontSize: '12px' }}>KES {(item.price * item.quantity).toLocaleString()}</span>
            </Box>
          ))}

          <Divider sx={{ my: 2, borderColor: '#000' }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, mb: 1 }}>
            <span>Subtotal:</span>
            <span>KES {order.subtotal.toLocaleString()}</span>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, mb: 1 }}>
            <span>Shipping:</span>
            <span>KES {order.shipping.toLocaleString()}</span>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, mt: 1, fontSize: '14px' }}>
            <span>Total:</span>
            <span>KES {order.total.toLocaleString()}</span>
          </Box>

          <Box textAlign="center" mt={5} sx={{ fontSize: 12, color: '#000' }}>
            <Typography>Thank you for shopping with</Typography>
            <Typography fontWeight={700}>CloudTech</Typography>
            <Typography>Kenya Cinema Building, Moi Avenue, Nairobi</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}