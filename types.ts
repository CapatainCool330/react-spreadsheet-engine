export type CellId = string; // e.g., "A1", "B2"

export interface CellData {
  id: CellId;
  raw: string;      // The formula or value typed by the user (e.g., "=A1+5")
  value: string | number | null; // The computed display value
  error: string | null; // Error message if any (e.g., "#CIRCULAR", "#ERROR")
}

export type GridState = Record<CellId, CellData>;

export interface DependencyGraph {
  dependencies: Record<CellId, CellId[]>; // Key depends on Values
  dependents: Record<CellId, CellId[]>;   // Key is needed by Values
}