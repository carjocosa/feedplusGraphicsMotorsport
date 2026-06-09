import { useCircuitStore } from '@/store/circuitStore';
import TimingSyncPanel from '../TimingSyncPanel';
import type { CircuitTimingEntry, CircuitEntry, SessionKind } from '@/types/circuit';
import type { OverrideMap } from '@/lib/entryMatch';
import { ALL_COLS, getLiveCols, setLiveCols, getColumnWidth } from '@/lib/liveTimingColumns';
import type { LiveCol } from '@/components/graphics/circuit/CircuitLiveTiming';

interface Props {
  onTake?: (id: string, data: any) => void;
}

const CIRCUIT_FIELDS = [
  { key: 'position', label: 'Posición', numeric: true },
  { key: 'carNumber', label: 'Nº' },
  { key: 'driverName', label: 'Piloto' },
  { key: 'team', label: 'Equipo' },
  { key: 'lap', label: 'Vuelta', numeric: true },
  { key: 'gap', label: 'Diferencia' },
  { key: 'interval', label: 'Intervalo' },
  { key: 'lastLap', label: 'Última vuelta' },
  { key: 'bestLap', label: 'Mejor vuelta' },
  { key: 'pitStops', label: 'Paradas', numeric: true },
  { key: 'status', label: 'Estado' },
];

const toNum = (v: unknown): number | null => {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  const s = String(v).trim().replace(',', '.').replace(/[^0-9.\-]/g, '');
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

const SESSIONS: SessionKind[] = ['practice', 'qualifying', 'race', 'sprint', 'feature'];

const CircuitTimingSyncPanel = ({ onTake }: Props) => {
  const { setTiming, setEvent, event, entries } = useCircuitStore();

  const buildRow = (raw: Record<string, unknown>, i: number, mapping: Record<string, string>, autoMatch: boolean, overrides: OverrideMap, masterEntries: CircuitEntry[]) => {
    const warns: string[] = [];
    const get = (t: string) => {
      const src = mapping[t];
      return src && raw[src] !== undefined && raw[src] !== '' ? raw[src] : raw[t];
    };
    const numOr = (t: string, fb: number) => {
      const v = get(t);
      if (v === undefined || v === null || v === '') return fb;
      const n = toNum(v);
      if (n === null) { warns.push(`Fila ${i + 1}: "${t}" no convertible a número (valor: "${v}")`); return fb; }
      return n;
    };
    const carNumber = String(get('carNumber') ?? '');
    const match = autoMatch
      ? masterEntries.find(e => e.carNumber === carNumber) || null
      : null;
    const pick = (scrap: unknown, fromMatch?: string) => {
      const s = scrap === undefined || scrap === null ? '' : String(scrap);
      return s || (fromMatch ?? '');
    };
    const row: CircuitTimingEntry = {
      position: numOr('position', i + 1),
      carNumber: carNumber || (match?.carNumber ?? ''),
      driverName: pick(get('driverName'), match?.driverName),
      team: pick(get('team'), match?.team),
      lap: numOr('lap', 0),
      gap: String(get('gap') ?? (i === 0 ? 'LEADER' : '')),
      interval: String(get('interval') ?? ''),
      lastLap: String(get('lastLap') ?? ''),
      bestLap: String(get('bestLap') ?? ''),
      totalTime: String(get('totalTime') ?? ''),
      pitStops: numOr('pitStops', 0),
      status: (get('status') as CircuitTimingEntry['status']) || 'racing',
      photoUrl: match?.photoUrl || undefined,
    };
    return { row, warns };
  };

  const fixPositionsAndGaps = (rows: CircuitTimingEntry[]): CircuitTimingEntry[] => {
    const sorted = rows
      .map((r, i) => ({ ...r, position: r.position > 0 ? r.position : i + 1 }))
      .sort((a, b) => a.position - b.position)
      .map((r, i) => ({ ...r, position: i + 1 }));

    const timeToMs = (t: string): number => {
      if (!t) return 0;
      const parts = t.split(':').map(p => parseFloat(p) || 0);
      if (parts.length === 3) return parts[0] * 3600000 + parts[1] * 60000 + parts[2] * 1000;
      if (parts.length === 2) return parts[0] * 60000 + parts[1] * 1000;
      return parts[0] * 1000 || 0;
    };

    const fmt = (ms: number): string => {
      if (ms <= 0) return 'LEADER';
      if (ms >= 60000) return `+${Math.floor(ms / 60000)}:${(Math.round(ms % 60000) / 1000).toFixed(3).padStart(6, '0')}`;
      return `+${(ms / 1000).toFixed(3)}`;
    };

    let leaderMs = 0;
    for (let i = 0; i < sorted.length; i++) {
      const r = sorted[i];
      const t = timeToMs(r.totalTime || '');
      if (i === 0) {
        leaderMs = t;
        r.gap = 'LEADER';
        r.interval = '—';
      } else if (leaderMs > 0 && t > 0) {
        r.gap = fmt(t - leaderMs);
        const prev = timeToMs(sorted[i - 1].totalTime || '');
        r.interval = prev > 0 ? fmt(t - prev) : '';
      } else {
        r.gap = '';
        r.interval = '';
      }
    }
    return sorted;
  };

  const colWidthsOnTake = () => {
    const w: Partial<Record<LiveCol, string>> = {};
    for (const c of ALL_COLS) {
      const v = getColumnWidth(c.key);
      if (v) w[c.key] = v;
    }
    return Object.keys(w).length ? w : undefined;
  };

  return (
    <TimingSyncPanel<CircuitTimingEntry, CircuitEntry>
      title="Sync desde Web (Race Monitor / Z-Round / MyLaps)"
      storageKey="circuit-timing-sync"
      presetsKey="circuit-timing-presets"
      fields={CIRCUIT_FIELDS}
      defaultInterval={12}
      masterEntries={entries}
      onAutoSync={(rows) => {
        const fixed = fixPositionsAndGaps(rows);
        const maxLap = Math.max(...fixed.map(r => r.lap), 0);
        onTake?.('circuitTiming', {
          rows: fixed,
          currentLap: maxLap,
          totalLaps: maxLap,
          columns: getLiveCols(event.sessionType),
          columnWidths: colWidthsOnTake(),
        });
      }}
      onSync={(rows, meta) => {
        const fixed = fixPositionsAndGaps(rows);
        setTiming(fixed);
        if (meta?.currentLap || meta?.totalLaps) {
          setEvent({
            ...(meta.currentLap ? { currentLap: meta.currentLap } : {}),
            ...(meta.totalLaps ? { totalLaps: meta.totalLaps } : {}),
          });
        }
      }}
      buildRow={buildRow}
      extraPresetFields={{
        cols: (() => {
          const cols: Partial<Record<SessionKind, LiveCol[]>> = {};
          SESSIONS.forEach(s => { cols[s] = getLiveCols(s); });
          return cols;
        })(),
      }}
      loadExtraPresetFields={(p) => {
        if (p.cols) {
          SESSIONS.forEach(s => { if (p.cols[s]) setLiveCols(s, p.cols[s]); });
        }
      }}
    />
  );
};

export default CircuitTimingSyncPanel;
