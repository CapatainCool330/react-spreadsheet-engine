import { GridState, CellId, CellData } from '../types';
import { extractDependencies, evaluateFormula } from './formulaParser';
import { ALL_CELL_IDS } from '../constants';

/**
 * The core engine that takes the entire grid state and recalculates
 * all values based on dependencies.
 */
export const recalculateGrid = (currentGrid: GridState): GridState => {
  const newGrid: GridState = { ...currentGrid };

  // 1. Build Dependency Graph
  // Adjacency list: Cell -> [Cells that depend on it]
  const dependents: Record<CellId, CellId[]> = {};
  // Track in-degree: Number of dependencies a cell has
  const inDegree: Record<CellId, number> = {};

  // Initialize
  ALL_CELL_IDS.forEach(id => {
    dependents[id] = [];
    inDegree[id] = 0;
    // Reset errors and values for recalculation (keep raw)
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

  // 2. Topological Sort (Kahn's Algorithm) to detect cycles and determine calc order
  const queue: CellId[] = [];
  const calcOrder: CellId[] = [];

  // Add all cells with 0 dependencies to queue
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

  // 3. Cycle Detection
  // If calcOrder length != total cells, there is a cycle.
  // Any cell with inDegree > 0 after the sort is part of (or dependent on) a cycle.
  const hasCycle = calcOrder.length !== ALL_CELL_IDS.length;

  if (hasCycle) {
    ALL_CELL_IDS.forEach(id => {
      if (inDegree[id] > 0) {
        newGrid[id].error = '#CIRCULAR';
        newGrid[id].value = '#CIRCULAR';
      }
    });
  }

  // 4. Evaluate in Topological Order
  // Only evaluate cells that were part of the valid sort (not in a cycle)
  calcOrder.forEach(cellId => {
    const cell = newGrid[cellId];

    // Skip if already marked as circular
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
      // It's a raw value (number or string)
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
