'use client';

import React from 'react';

interface FooterWrapperProps {
  children: React.ReactNode;
}

const FooterWrapper: React.FC<FooterWrapperProps> = ({ children }) => {
  return (
    <>
      {children}
      {/* Footer removed to prevent duplicate/white background version */}
    </>
  );
};

export default FooterWrapper;
