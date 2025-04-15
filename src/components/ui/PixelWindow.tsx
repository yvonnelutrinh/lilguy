import React, { ReactNode, forwardRef } from 'react';

export interface PixelWindowProps {
  title?: string; 
  headerColor?: string;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
  showControls?: boolean;
  onClose?: () => void;
}

const PixelWindow = forwardRef<HTMLDivElement, PixelWindowProps>(({
  title,
  headerColor = 'bg-pixel-teal',
  className = '',
  contentClassName = 'p-4',
  children,
  showControls = true,
  onClose
}, ref) => {
  return (
    <div ref={ref} className={`pixel-window ${className}`}>
      <div className={`pixel-window-header ${headerColor}`}>
        {title && <div className="text-pixel-sm">{title}</div>}
        {showControls && (
          <div className="pixel-window-controls">
            <div 
              className="pixel-window-button"
              onClick={onClose}
              style={onClose ? { cursor: 'pointer' } : {}}
            ></div>
            <div className="pixel-window-button"></div>
            <div className="pixel-window-button"></div>
          </div>
        )}
      </div>
      <div className={`pixel-window-content ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
});

PixelWindow.displayName = "PixelWindow";

export default PixelWindow;
