import React from 'react';
import { cn } from '../../../lib/utils';

export interface PixelProgressProps {
  value: number; // 0-100
  className?: string;
  fillClassName?: string;
  variant?: 'default' | 'good' | 'medium' | 'bad';
  label?: string;
  showPercentage?: boolean;
  height?: string;
}

export const PixelProgress: React.FC<PixelProgressProps> = ({
  value,
  className = '',
  fillClassName = '',
  variant = 'default',
  label,
  showPercentage = false,
  height = 'h-5',
}) => {
  // Clamp value between 0-100
  const clampedValue = Math.max(0, Math.min(100, value));
  
  // Calculate variant color class
  const variantClasses = {
    default: 'bg-pixel-blue',
    good: 'bg-pixel-green',
    medium: 'bg-[#f5d76e]', // amber color from variables
    bad: 'bg-[#ff6b6b]', // red color from variables
  };
  
  return (
    <div className="w-full">
      {label && (
        <div className="mb-1 flex justify-between">
          <span className="text-pixel-sm font-pixel">{label}</span>
          {showPercentage && (
            <span className="text-pixel-sm font-pixel">{clampedValue}%</span>
          )}
        </div>
      )}
      <div 
        className={cn(
          "relative bg-[#ffeaea] border border-black overflow-hidden",
          height,
          className
        )}
      >
        <div 
          className={cn(
            "h-full absolute top-0 left-0 transition-all duration-500",
            variantClasses[variant],
            fillClassName
          )} 
          style={{ width: `${clampedValue}%` }}
        >
          {/* Pixel segments for the chunky progress look */}
          {Array.from({ length: 10 }).map((_, i) => (
            <div 
              key={i}
              className="absolute top-0 bottom-0 w-px bg-black opacity-20"
              style={{ 
                left: `${(i + 1) * 10}%`, 
                display: clampedValue > (i + 1) * 10 ? 'block' : 'none' 
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PixelProgress;
