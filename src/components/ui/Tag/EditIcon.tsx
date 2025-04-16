import React from 'react';

const EditIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    className={className}
    width="14"
    height="14"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" y="15" width="16" height="2" rx="1" fill="#222"/>
    <path d="M14.7 4.29l1 1a1 1 0 010 1.42l-8.3 8.3H5v-2.4l8.3-8.3a1 1 0 011.4 0z" fill="#222"/>
    <path d="M13.3 3.29a2 2 0 012.8 2.83l-8.3 8.3A2 2 0 015 15v-2.4a2 2 0 01.58-1.42l8.3-8.3z" fill="#FFD600"/>
  </svg>
);

export default EditIcon;
