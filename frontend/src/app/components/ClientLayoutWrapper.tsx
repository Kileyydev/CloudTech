'use client';

import { useRef } from 'react';
import Footer from './FooterSection';
import SideMessagePanel from './SideMessagePanel';

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const footerRef = useRef(null);

  return (
    <>
      {children}
      <div ref={footerRef}>
        <Footer />
      </div>
      <SideMessagePanel footerRef={footerRef} />
    </>
  );
}
