import React from "react";

const TrashIcon = ({ className = "w-5 h-5" }) => (
  <div className={`${className} flex items-center justify-center`}>
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="pixelated">
      <rect x="5" y="6" width="10" height="10" fill="currentColor" />
      <rect x="8" y="4" width="4" height="2" fill="currentColor" />
      <rect x="7" y="8" width="1" height="6" fill="white" />
      <rect x="10" y="8" width="1" height="6" fill="white" />
      <rect x="12" y="8" width="1" height="6" fill="white" />
    </svg>
  </div>
);

export default TrashIcon;
