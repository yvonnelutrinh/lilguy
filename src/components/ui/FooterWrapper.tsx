'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Footer from './Footer';

interface FooterWrapperProps {
  children: React.ReactNode;
}

const FooterWrapper: React.FC<FooterWrapperProps> = ({ children }) => {
  const pathname = usePathname();
  const isAuthPage = pathname?.includes('/sign-in') || pathname?.includes('/sign-up');
  
  return (
    <>
      {children}
      {!isAuthPage && <Footer />}
    </>
  );
};

export default FooterWrapper;
