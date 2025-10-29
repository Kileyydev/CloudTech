// src/app/order-confirmation/page.tsx
import { Suspense } from 'react';
import OrderConfirmationClient from './OrderConfirmationClient';
import LoadingSpinner from '@/app/components/LoadingSpinner'; // Optional

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <OrderConfirmationClient />
    </Suspense>
  );
}