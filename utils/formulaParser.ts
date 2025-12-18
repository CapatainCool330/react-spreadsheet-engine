import { GridState, CellId } from '../types';

const CELL_REF_REGEX = /[A-J](?:10|[1-9])/g;

export const evaluateFormula = (
  formula: string,
  grid: GridState
): number | string => {
  const expression = formula.substring(1).toUpperCase();

  const parsedExpression = expression.replace(CELL_REF_REGEX, (match) => {
    const cellId = match as CellId;
    const cell = grid[cellId];

    if (!cell) return '0';

    if (cell.error) {
      throw new Error(cell.error);
    }

    const val = cell.value;

    if (val === null || val === '') return '0';

    const numVal = Number(val);
    if (isNaN(numVal)) {
      throw new Error('#VALUE!');
    }

    return numVal.toString();
  });

  if (!/^[\d\.\+\-\*\/\(\)\s]+$/.test(parsedExpression)) {
    throw new Error('#ERROR');
  }

  try {
    const result = new Function(`return (${parsedExpression})`)();

    if (!isFinite(result) || isNaN(result)) {
      if (result === Infinity || result === -Infinity) return "#DIV/0!";
      return "#NaN";
    }
    return result;
  } catch (e) {
    throw new Error('#ERROR');
  }
};

export const extractDependencies = (formula: string): CellId[] => {
  if (!formula.startsWith('=')) return [];
  const matches = formula.toUpperCase().match(CELL_REF_REGEX);
  return matches ? Array.from(new Set(matches)) : [];
};
