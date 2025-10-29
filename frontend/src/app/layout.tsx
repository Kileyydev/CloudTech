// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import ClientLayoutWrapper from './components/ClientLayoutWrapper';
import { CartProvider } from './components/cartContext';
import ClientRoot from './clientRoot';
import OfficeHoursWidget from '@/app/components/OfficeHoursWidget'; // Fixed path
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
};

// Single RootLayout — NO DUPLICATES
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
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