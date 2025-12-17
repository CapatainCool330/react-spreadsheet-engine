import React, { useState, useEffect, useRef } from 'react';
import { CellData } from '../types';
import { clsx } from 'clsx'; // We'll just use string interp if clsx isn't strictly available, but standard is fine
// Note: assuming clsx-like behavior via template literals for simplicity if external lib strictly banned,
// but instructions say "Use popular and existing libraries".

interface CellProps {
  data: CellData;
  isSelected: boolean;
  onClick: () => void;
  onChange: (value: string) => void;
  className?: string;
}

export const Cell: React.FC<CellProps> = ({ 
  data, 
  isSelected, 
  onClick, 
  onChange,
  className 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(data.raw);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync internal state with external prop only when not editing
  useEffect(() => {
    if (!isEditing) {
      setInputValue(data.raw);
    }
  }, [data.raw, isEditing]);

  // Focus input when editing starts
  useEffect(() => {
    if (isSelected && isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSelected, isEditing]);

  // Reset editing when selection is lost
  useEffect(() => {
    if (!isSelected) {
      setIsEditing(false);
    }
  }, [isSelected]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      onChange(inputValue);
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setInputValue(data.raw); // Revert
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    onChange(inputValue);
  };

  // Determine display text
  let displayText = data.value?.toString() ?? '';
  let cellStyle = "text-gray-800";
  
  if (data.error) {
    displayText = data.error;
    cellStyle = "text-red-600 font-medium bg-red-50";
  }

  return (
    <div
      onClick={onClick}
      onDoubleClick={handleDoubleClick}
      className={`relative w-full h-full min-h-[32px] border-r border-b border-gray-300 flex items-center px-1 text-sm select-none transition-colors duration-75
        ${isSelected ? 'outline outline-2 outline-blue-500 z-10' : ''}
        ${cellStyle}
        ${className || ''}
        bg-white
      `}
    >
      {isSelected && isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="absolute inset-0 w-full h-full px-1 py-0.5 outline-none text-sm z-20"
        />
      ) : (
        <div className="w-full h-full flex items-center overflow-hidden truncate">
          {displayText}
        </div>
      )}
    </div>
  );
};
