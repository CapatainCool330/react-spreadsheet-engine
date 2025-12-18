import { GridState, CellId, CellData } from '../types';
import { extractDependencies, evaluateFormula } from './formulaParser';
import { ALL_CELL_IDS } from '../constants';

export const recalculateGrid = (currentGrid: GridState): GridState => {
  const newGrid: GridState = { ...currentGrid };

  const dependents: Record<CellId, CellId[]> = {};
  const inDegree: Record<CellId, number> = {};

  ALL_CELL_IDS.forEach(id => {
    dependents[id] = [];
    inDegree[id] = 0;
    newGrid[id] = { ...newGrid[id], error: null };
  });

  ALL_CELL_IDS.forEach(cellId => {
    const cell = newGrid[cellId];
    if (cell.raw.startsWith('=')) {
      const deps = extractDependencies(cell.raw);
      deps.forEach(depId => {
        if (dependents[depId]) {
          dependents[depId].push(cellId);
          inDegree[cellId] = (inDegree[cellId] || 0) + 1;
        }
      });
    }
  });

  const queue: CellId[] = [];
  const calcOrder: CellId[] = [];

  ALL_CELL_IDS.forEach(id => {
    if (inDegree[id] === 0) {
      queue.push(id);
    }
  });

  while (queue.length > 0) {
    const current = queue.shift()!;
    calcOrder.push(current);

    const cellDependents = dependents[current] || [];
    cellDependents.forEach(neighbor => {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    });
  }

  const hasCycle = calcOrder.length !== ALL_CELL_IDS.length;

  if (hasCycle) {
    ALL_CELL_IDS.forEach(id => {
      if (inDegree[id] > 0) {
        newGrid[id].error = '#CIRCULAR';
        newGrid[id].value = '#CIRCULAR';
      }
    });
  }

  calcOrder.forEach(cellId => {
    const cell = newGrid[cellId];

    if (cell.error === '#CIRCULAR') return;

    if (cell.raw.startsWith('=')) {
      try {
        const result = evaluateFormula(cell.raw, newGrid);
        newGrid[cellId].value = result;
      } catch (e: any) {
        newGrid[cellId].error = e.message || '#ERROR';
        newGrid[cellId].value = newGrid[cellId].error;
      }
    } else {
      if (cell.raw.trim() === '') {
        newGrid[cellId].value = null;
      } else {
        const num = Number(cell.raw);
        newGrid[cellId].value = isNaN(num) ? cell.raw : num;
      }
    }
  });

  return newGrid;
};
