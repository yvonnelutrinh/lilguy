'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Footer from '../Footer';

interface FooterWrapperProps {
  children: React.ReactNode;
}

const FooterWrapper: React.FC<FooterWrapperProps> = ({ children }) => {
  const pathname = usePathname();
  const isAuthPage = pathname?.includes('/sign-in') || pathname?.includes('/sign-up');
  const [pageLoaded, setPageLoaded] = React.useState(false);

  React.useEffect(() => {
    setPageLoaded(true);
  }, []);

  return (
    <>
      {children}
      {/* Footer removed to prevent duplicate/white background version */}
    </>
  );
};

export default FooterWrapper;
