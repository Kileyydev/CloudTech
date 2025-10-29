'use client';

import { useRef } from 'react';
import Footer from './FooterSection';


export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  // Use a generic HTMLElement type instead of HTMLDivElement
  const footerRef = useRef<HTMLElement | null>(null);

  return (
    <>
      {children}
      {/* Footer wrapped in a <footer> tag for semantic correctness */}
      <footer ref={footerRef as React.RefObject<HTMLElement>}>
        <Footer />
      </footer>
    </>
  );
}
