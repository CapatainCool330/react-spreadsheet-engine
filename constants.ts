export const GRID_SIZE = 10;
export const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
export const ROWS = Array.from({ length: GRID_SIZE }, (_, i) => i + 1);

// Generate all valid cell IDs
export const ALL_CELL_IDS = ROWS.flatMap(row => 
  COLS.map(col => `${col}${row}`)
);