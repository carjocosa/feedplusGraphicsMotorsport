import type { LiveCol } from '@/components/graphics/circuit/CircuitLiveTiming';
import type { SessionKind } from '@/types/circuit';

const KEY = 'circuit-live-cols';

export const ALL_COLS: { key: LiveCol; label: string }[] = [
  { key: 'position',   label: 'Posición' },
  { key: 'carNumber',  label: 'Nº' },
  { key: 'driverName', label: 'Piloto' },
  { key: 'team',       label: 'Equipo' },
  { key: 'lap',        label: 'Vuelta' },
  { key: 'gap',        label: 'Gap' },
  { key: 'interval',   label: 'Intervalo' },
  { key: 'lastLap',    label: 'Última' },
  { key: 'bestLap',    label: 'Mejor' },
  { key: 'pitStops',   label: 'Pits' },
];

const DEFAULTS: Record<SessionKind, LiveCol[]> = {
  practice:   ['position', 'carNumber', 'driverName', 'lastLap', 'bestLap'],
  qualifying: ['position', 'carNumber', 'driverName', 'bestLap', 'gap'],
  race:       ['position', 'carNumber', 'driverName', 'gap', 'lastLap', 'pitStops'],
  sprint:     ['position', 'carNumber', 'driverName', 'gap', 'lastLap'],
  feature:    ['position', 'carNumber', 'driverName', 'gap', 'lastLap', 'pitStops'],
};

type Store = Partial<Record<SessionKind, LiveCol[]>>;

function read(): Store {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
}

export function getLiveCols(session: SessionKind): LiveCol[] {
  const s = read();
  return s[session] && s[session]!.length ? s[session]! : DEFAULTS[session];
}

export function setLiveCols(session: SessionKind, cols: LiveCol[]) {
  const s = read();
  s[session] = cols;
  localStorage.setItem(KEY, JSON.stringify(s));
}
