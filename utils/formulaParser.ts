import { GridState, CellId } from '../types';

// Regex for valid cell IDs (A1 to J10)
const CELL_REF_REGEX = /[A-J](?:10|[1-9])/g;

/**
 * Tokenizes and evaluates a math expression.
 * Uses strict validation to avoid unsafe eval usage.
 */
export const evaluateFormula = (
  formula: string,
  grid: GridState
): number | string => {
  // 1. Remove the leading '='
  const expression = formula.substring(1).toUpperCase();

  // 2. Resolve Cell References
  // We replace cell IDs with their computed values in the string.
  // If a referenced cell has an error or is not a number, we throw.
  const parsedExpression = expression.replace(CELL_REF_REGEX, (match) => {
    const cellId = match as CellId;
    const cell = grid[cellId];

    if (!cell) return '0'; // Should not happen given rigid grid

    if (cell.error) {
      throw new Error(cell.error); // Propagate error
    }

    const val = cell.value;
    
    if (val === null || val === '') return '0';
    
    const numVal = Number(val);
    if (isNaN(numVal)) {
      throw new Error('#VALUE!');
    }
    
    return numVal.toString();
  });

  // 3. Safety Check: Ensure the string only contains valid math characters
  // Allowed: digits, decimal point, operators (+ - * /), parentheses, and spaces.
  if (!/^[\d\.\+\-\*\/\(\)\s]+$/.test(parsedExpression)) {
    throw new Error('#ERROR');
  }

  // 4. Evaluate using Function constructor (safer than eval, scoped)
  try {
    // eslint-disable-next-line no-new-func
    const result = new Function(`return (${parsedExpression})`)();
    
    if (!isFinite(result) || isNaN(result)) {
       if(result === Infinity || result === -Infinity) return "#DIV/0!";
       return "#NaN";
    }
    return result;
  } catch (e) {
    throw new Error('#ERROR');
  }
};

/**
 * Extracts dependencies from a formula string.
 * Returns an array of Cell IDs.
 */
export const extractDependencies = (formula: string): CellId[] => {
  if (!formula.startsWith('=')) return [];
  const matches = formula.toUpperCase().match(CELL_REF_REGEX);
  return matches ? Array.from(new Set(matches)) : [];
};
