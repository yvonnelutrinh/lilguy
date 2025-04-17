import React, { ReactNode, forwardRef } from 'react';
import { cn } from '../../../lib/utils';

export interface PixelWindowProps {
  title?: string; 
  headerColor?: string;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
  showControls?: boolean;
  onClose?: () => void;
}

const PixelWindow = forwardRef<HTMLDivElement, PixelWindowProps & { header?: boolean }>(({ 
  title,
  headerColor = 'bg-pixel-teal',
  className = '',
  contentClassName = 'p-4',
  children,
  showControls = true,
  onClose,
  header = true
}, ref) => {
  return (
    <div 
      ref={ref} 
      className={cn(
        "border-pixel border-black bg-white relative shadow-pixel overflow-hidden",
        className
      )}
    >
      {header !== false && (
        <div className={cn(
          "font-pixel px-2 py-1 font-bold flex items-center justify-between border-b-pixel border-black",
          headerColor
        )}>
          {title && <div className="text-pixel-sm">{title}</div>}
          {showControls && (
            <div className="flex gap-1">
              <div 
                className="w-4 h-4 border border-black bg-[#d9d9d9] hover:bg-white"
                onClick={onClose}
                style={onClose ? { cursor: 'pointer' } : {}}
              ></div>
              <div className="w-4 h-4 border border-black bg-[#d9d9d9] hover:bg-white"></div>
              <div className="w-4 h-4 border border-black bg-[#d9d9d9] hover:bg-white"></div>
            </div>
          )}
        </div>
      )}
      <div className={cn(
        "bg-white",
        contentClassName
      )}>
        {children}
      </div>
    </div>
  );
});

PixelWindow.displayName = "PixelWindow";

export default PixelWindow;
