import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../../lib/utils';

export interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'green' | 'beige' | 'pink' | 'contrast';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  icon?: ReactNode;
}

export const PixelButton: React.FC<PixelButtonProps> = ({
  children,
  variant = 'primary',
  size = 'default',
  className = '',
  icon,
  ...props
}) => {
  const variantClasses = {
    primary: 'bg-pixel-blue',
    secondary: 'bg-pixel-beige',
    success: 'bg-pixel-green',
    danger: 'bg-button-danger-bg',
    green: 'bg-pixel-green',
    beige: 'bg-pixel-beige',
    pink: 'bg-pixel-pink',
    contrast: 'bg-button-contrast-bg text-white',
  };

  const sizeClasses = {
    default: 'px-3 py-2 text-pixel-base',
    sm: 'px-2 py-1 text-pixel-sm',
    lg: 'px-4 py-3',
    icon: 'p-1 aspect-square',
  };

  const baseClasses = 'border-pixel border-black font-pixel shadow-pixel-btn transition-all duration-100 hover:translate-y-[-1px] hover:translate-x-[-1px] hover:shadow-pixel-btn-hover active:translate-y-[1px] active:translate-x-[1px] active:shadow-pixel-btn-active inline-flex items-center justify-center';

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </button>
  );
};
