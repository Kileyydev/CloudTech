// src/app/layout.tsx (full updated code)
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayoutWrapper from './components/ClientLayoutWrapper';
import { CartProvider } from './components/cartContext';
import ClientRoot from './clientRoot';
import OfficeHoursWidget from '@/app/components/OfficeHoursWidget';
import Header from './components/Header'; // Your header with PNG
import 'leaflet/dist/leaflet.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CloudTech",
  description: "Premium Electronics | Trade-in | Nationwide Delivery",
  // Favicon setup: Removes globe, adds your logo for tabs & SE results
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' }, // Fallback
    ],
    apple: '/apple-touch-icon.png', // For mobile SE results
  },
  // SEO Bonus: Makes logo show in social shares (Twitter, FB) & some SE previews
  openGraph: {
    title: 'CloudTech',
    description: 'Premium Electronics | Trade-in | Nationwide Delivery',
    images: '/logo.png', // Your PNG as preview image
    url: 'https://www.cloudtechstore.net', // Your site URL
  },
  twitter: {
    card: 'summary_large_image',
    images: '/logo.png', // Twitter-specific
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* Header with your PNG logo */}
        <Header />
        
        {/* Floating Office Hours Widget */}
        <OfficeHoursWidget heroSectionId="hero" />
        
        {/* App Providers & Layout */}
        <CartProvider>
          <ClientLayoutWrapper>
            <ClientRoot>{children}</ClientRoot>
          </ClientLayoutWrapper>
        </CartProvider>
      </body>
    </html>
  );
}