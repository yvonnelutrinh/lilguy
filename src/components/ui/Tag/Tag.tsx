import React from 'react';
import EditIcon from './EditIcon';
import { cn } from '../../../lib/utils';

interface TagProps {
  label: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
  asButton?: boolean;
  children?: React.ReactNode;
  editMode?: boolean; 
  onEditClick?: () => void;
  contrast?: boolean; 
}

const Tag: React.FC<TagProps> = ({ 
  label, 
  onClick, 
  icon, 
  className = '', 
  asButton = false, 
  children, 
  editMode = false, 
  onEditClick, 
  contrast = false 
}) => {
  const TagEl = asButton || onClick ? 'button' : 'span';
  
  return (
    <TagEl
      type={TagEl === 'button' ? 'button' : undefined}
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 border-pixel border-black font-pixel text-pixel-sm transition-all duration-100 select-none",
        contrast ? 'bg-black text-white' : 'bg-pixel-blue text-black hover:bg-pixel-blue-light',
        onClick ? 'cursor-pointer' : '',
        className
      )}
      onClick={onClick}
    >
      {icon}
      {label}
      {children}
      {editMode && (
        <span
          className="ml-1 inline-flex items-center cursor-pointer"
          onClick={e => {
            e.stopPropagation();
            if (onEditClick) onEditClick();
          }}
        >
          <EditIcon className="w-3 h-3" />
        </span>
      )}
    </TagEl>
  );
};

export default Tag;
