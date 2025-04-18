import React from 'react';
import { Pencil } from "lucide-react";

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

const Tag: React.FC<TagProps> = ({ label, onClick, icon, className = '', asButton = false, children, editMode = false, onEditClick, contrast = false }) => {
  const base =
    `inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border-2 border-black pixel-button transition select-none ${contrast ? 'bg-black text-white' : 'bg-pixel-accent text-black hover:bg-pixel-blue-light cursor-pointer'}`;
  const TagEl = asButton || onClick ? 'button' : 'span';
  return (
    <TagEl
      type={TagEl === 'button' ? 'button' : undefined}
      className={`${base} ${className}`}
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
          <Pencil className="w-3 h-3" />
        </span>
      )}
    </TagEl>
  );
};

export default Tag;
