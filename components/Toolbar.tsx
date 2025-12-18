import React from 'react';
import { CellId } from '../types';

interface ToolbarProps {
  selectedCell: CellId | null;
  rawValue: string;
  onRawValueChange: (val: string) => void;
  onEnter: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  selectedCell,
  rawValue,
  onRawValueChange,
  onEnter
}) => {
  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 border-b border-gray-200 sticky top-0 z-30">
      <div className="w-10 h-8 bg-white border border-gray-300 flex items-center justify-center text-sm font-semibold text-blue-600 rounded shadow-sm">
        {selectedCell || ''}
      </div>
      <div className="flex-1 h-8 relative">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 font-serif italic text-lg">fx</span>
        <input
          type="text"
          value={rawValue}
          onChange={(e) => onRawValueChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onEnter()}
          disabled={!selectedCell}
          placeholder={selectedCell ? "Enter value or formula..." : "Select a cell"}
          className="w-full h-full pl-8 pr-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
        />
      </div>
    </div>
  );
};
