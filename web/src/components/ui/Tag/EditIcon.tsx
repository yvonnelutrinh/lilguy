import React from 'react';

const EditIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <div className={`${className} flex items-center justify-center`}>
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="pixelated">
      {/* Pen-like icon: diagonal, thick shaft, sharp black point, and a cap */}
      <rect x="7" y="19" width="12" height="4" rx="1" transform="rotate(-45 7 19)" fill="black" /> {/* Shaft */}
      <polygon points="20,8 24,12 14,22 10,18" fill="black" /> {/* Pointed pen tip */}
      <rect x="5" y="21" width="4" height="2" transform="rotate(-45 5 21)" fill="#222" /> {/* Pen cap */}
    </svg>
  </div>
);

export default EditIcon;
