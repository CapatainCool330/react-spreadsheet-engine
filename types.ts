export type CellId = string;

export interface CellData {
  id: CellId;
  raw: string;
  value: string | number | null;
  error: string | null;
}

export type GridState = Record<CellId, CellData>;

export interface DependencyGraph {
  dependencies: Record<CellId, CellId[]>;
  dependents: Record<CellId, CellId[]>;
}