import React from 'react';
import { COLS, ROWS } from '../constants';
import { CellId, GridState } from '../types';
import { Cell } from './Cell';

interface GridProps {
  data: GridState;
  selectedCell: CellId | null;
  onSelectCell: (id: CellId) => void;
  onCellChange: (id: CellId, value: string) => void;
}

export const Grid: React.FC<GridProps> = ({ 
  data, 
  selectedCell, 
  onSelectCell, 
  onCellChange 
}) => {
  return (
    <div className="inline-block border-l border-t border-gray-300 shadow-sm bg-white">
      {/* Header Row (A-J) */}
      <div className="flex">
        {/* Corner Cell (Empty) */}
        <div className="w-10 h-8 bg-gray-100 border-r border-b border-gray-300 flex-shrink-0"></div>
        
        {/* Column Headers */}
        {COLS.map((col) => (
          <div 
            key={col} 
            className="w-24 h-8 bg-gray-100 border-r border-b border-gray-300 flex items-center justify-center font-semibold text-gray-500 text-xs flex-shrink-0"
          >
            {col}
          </div>
        ))}
      </div>

      {/* Grid Rows */}
      {ROWS.map((row) => (
        <div key={row} className="flex h-8">
          {/* Row Header (1-10) */}
          <div className="w-10 h-8 bg-gray-100 border-r border-b border-gray-300 flex items-center justify-center font-semibold text-gray-500 text-xs flex-shrink-0">
            {row}
          </div>

          {/* Cells */}
          {COLS.map((col) => {
            const cellId = `${col}${row}` as CellId;
            return (
              <div key={cellId} className="w-24 h-8 flex-shrink-0">
                <Cell
                  data={data[cellId]}
                  isSelected={selectedCell === cellId}
                  onClick={() => onSelectCell(cellId)}
                  onChange={(val) => onCellChange(cellId, val)}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
