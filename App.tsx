import React, { useState, useEffect, useCallback } from 'react';
import { Grid } from './components/Grid';
import { Toolbar } from './components/Toolbar';
import { ALL_CELL_IDS } from './constants';
import { GridState, CellId } from './types';
import { recalculateGrid } from './utils/spreadsheetEngine';

// Initial empty state
const INITIAL_STATE: GridState = ALL_CELL_IDS.reduce((acc, id) => {
  acc[id] = { id, raw: '', value: null, error: null };
  return acc;
}, {} as GridState);

// Helper: Preset Scenario for Demo
const DEMO_STATE: GridState = { ...INITIAL_STATE };
DEMO_STATE['A1'] = { id: 'A1', raw: '10', value: 10, error: null };
DEMO_STATE['B1'] = { id: 'B1', raw: '20', value: 20, error: null };
DEMO_STATE['C1'] = { id: 'C1', raw: '=A1+B1', value: 30, error: null }; // 30
DEMO_STATE['A2'] = { id: 'A2', raw: '=C1*2', value: 60, error: null };   // 60

// Apply initial calc for demo
const INITIAL_CALCULATED = recalculateGrid(DEMO_STATE);

export default function App() {
  const [gridData, setGridData] = useState<GridState>(INITIAL_CALCULATED);
  const [selectedCell, setSelectedCell] = useState<CellId | null>('A1');
  
  // We maintain a separate state for the toolbar input to allow typing without
  // triggering full grid recalcs on every keystroke, only on commit.
  const [toolbarValue, setToolbarValue] = useState<string>('');

  useEffect(() => {
    if (selectedCell) {
      setToolbarValue(gridData[selectedCell].raw);
    } else {
      setToolbarValue('');
    }
  }, [selectedCell, gridData]);

  const handleCellChange = useCallback((id: CellId, newValue: string) => {
    setGridData(prev => {
      // 1. Optimistic update of raw value
      const updatedRaw = {
        ...prev,
        [id]: { ...prev[id], raw: newValue }
      };
      
      // 2. Full recalculation (Topological sort + Evaluation)
      // This ensures cycles are caught and dependencies update immediately.
      return recalculateGrid(updatedRaw);
    });
  }, []);

  const handleToolbarCommit = () => {
    if (selectedCell) {
      handleCellChange(selectedCell, toolbarValue);
    }
  };

  const handleReset = () => {
      setGridData(recalculateGrid(INITIAL_STATE));
      setSelectedCell('A1');
  };

  const handleDemo = () => {
      setGridData(recalculateGrid(DEMO_STATE));
      setSelectedCell('A1');
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Spreadsheet Engine</h1>
                <p className="text-gray-500 mt-1">Supports formulas (+ - * /), parentheses, and circular reference detection.</p>
            </div>
            <div className="flex gap-2">
                 <button onClick={handleReset} className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 font-medium text-gray-700 transition-colors">
                    Clear
                 </button>
                 <button onClick={handleDemo} className="px-3 py-1.5 text-sm bg-blue-600 border border-transparent rounded hover:bg-blue-700 font-medium text-white transition-colors">
                    Load Demo
                 </button>
            </div>
        </div>

        {/* Main Application Area */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200 flex flex-col">
          <Toolbar 
            selectedCell={selectedCell}
            rawValue={toolbarValue}
            onRawValueChange={setToolbarValue}
            onEnter={handleToolbarCommit}
          />
          
          <div className="overflow-auto p-1 bg-gray-50 flex justify-center">
             <div className="pb-4 pr-4"> {/* Padding for scroll space */}
                <Grid 
                    data={gridData}
                    selectedCell={selectedCell}
                    onSelectCell={setSelectedCell}
                    onCellChange={handleCellChange}
                />
             </div>
          </div>
          
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex justify-between">
            <span>Ready</span>
            <span>React 18 • TypeScript • Tailwind</span>
          </div>
        </div>
        
        {/* Instructions / Legend */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div>
                <h3 className="font-semibold text-gray-900 mb-2">Usage Guide</h3>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Click a cell to select it.</li>
                    <li>Double-click or start typing to edit.</li>
                    <li>Press <strong>Enter</strong> or click away to save.</li>
                    <li>Start with <strong>=</strong> for formulas (e.g., <code>=A1+B2</code>).</li>
                </ul>
            </div>
            <div>
                <h3 className="font-semibold text-gray-900 mb-2">Features & Errors</h3>
                <ul className="list-disc pl-5 space-y-1">
                    <li><span className="text-red-600 font-medium">#CIRCULAR</span>: Circular dependency detected.</li>
                    <li><span className="text-red-600 font-medium">#DIV/0!</span>: Division by zero.</li>
                    <li><span className="text-red-600 font-medium">#ERROR</span>: Malformed formula.</li>
                    <li>Dependencies update automatically.</li>
                </ul>
            </div>
        </div>

      </div>
    </div>
  );
}
