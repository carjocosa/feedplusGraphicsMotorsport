// Helpers para hacer match de filas de scrap contra los inscritos maestros
// (Rally o Circuito) por número de auto, con override manual por índice de fila.

export interface MatchableEntry {
  id: string;
  carNumber: string;
  driverName: string;
  coDriverName?: string;
  driverCountry?: string;
  team?: string;
  car?: string;
}

const norm = (v: any) => String(v ?? '').trim().replace(/^#/, '').toLowerCase();

export const findEntryByCarNumber = (
  entries: MatchableEntry[],
  carNumber: any,
): MatchableEntry | null => {
  const k = norm(carNumber);
  if (!k) return null;
  return entries.find(e => norm(e.carNumber) === k) ?? null;
};

export type OverrideMap = Record<number, string>; // rowIndex -> entryId ('' = forzar sin match)

export const resolveMatch = (
  entries: MatchableEntry[],
  rawRow: Record<string, any>,
  rowIndex: number,
  overrides: OverrideMap,
  carNumberKey = 'carNumber',
): MatchableEntry | null => {
  const ov = overrides[rowIndex];
  if (ov === '') return null;
  if (ov) return entries.find(e => e.id === ov) ?? null;
  return findEntryByCarNumber(entries, rawRow?.[carNumberKey]);
};
