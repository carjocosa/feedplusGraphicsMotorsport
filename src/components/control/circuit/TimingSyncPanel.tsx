import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { useCircuitStore } from '@/store/circuitStore';
import TimingSyncPanel from '../TimingSyncPanel';
import type { CircuitTimingEntry, CircuitEntry, SessionKind } from '@/types/circuit';
import type { OverrideMap } from '@/lib/entryMatch';
import { ALL_COLS, getLiveCols, setLiveCols } from '@/lib/liveTimingColumns';
import type { LiveCol } from '@/components/graphics/circuit/CircuitLiveTiming';

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

const CircuitTimingSyncPanel = () => {
  const { setTiming, setEvent, event, entries } = useCircuitStore();
  const [activeCols, setActiveCols] = useState<LiveCol[]>(() => getLiveCols(event.sessionType));
  const [showCols, setShowCols] = useState(false);

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
      pitStops: numOr('pitStops', 0),
      status: (get('status') as CircuitTimingEntry['status']) || 'racing',
    };
    return { row, warns };
  };

  const toggleCol = (c: LiveCol) => {
    const next = activeCols.includes(c) ? activeCols.filter(x => x !== c) : [...activeCols, c];
    setActiveCols(next);
    setLiveCols(event.sessionType, next);
  };

  const moveCol = (c: LiveCol, dir: -1 | 1) => {
    const i = activeCols.indexOf(c);
    if (i < 0) return;
    const j = i + dir;
    if (j < 0 || j >= activeCols.length) return;
    const next = [...activeCols];
    [next[i], next[j]] = [next[j], next[i]];
    setActiveCols(next);
    setLiveCols(event.sessionType, next);
  };

  const colControls = (
    <div className="border-t border-border pt-3">
      <button onClick={() => setShowCols(s => !s)} className="text-xs font-bold tracking-wider uppercase text-primary hover:opacity-80">
        {showCols ? '▼' : '▶'} Columnas visibles · sesión: <span className="text-accent">{event.sessionType}</span> ({activeCols.length})
      </button>
      {showCols && (
        <div className="mt-2 p-3 bg-background/50 border border-border space-y-2">
          <p className="text-[11px] text-muted-foreground">Activá/ordená las columnas del overlay Live Timing.</p>
          <div className="space-y-1">
            {activeCols.map((c, i) => {
              const def = ALL_COLS.find(x => x.key === c);
              return (
                <div key={c} className="flex items-center gap-2 text-xs bg-card px-2 py-1">
                  <span className="text-muted-foreground w-5">{i + 1}.</span>
                  <span className="flex-1">{def?.label ?? c}</span>
                  <button onClick={() => moveCol(c, -1)} disabled={i === 0} className="px-1 hover:text-primary disabled:opacity-30">↑</button>
                  <button onClick={() => moveCol(c, 1)} disabled={i === activeCols.length - 1} className="px-1 hover:text-primary disabled:opacity-30">↓</button>
                  <button onClick={() => toggleCol(c)} className="px-2 text-rally-red hover:opacity-70">✕</button>
                </div>
              );
            })}
          </div>
          <div className="pt-2 border-t border-border">
            <Label className="text-[10px] text-muted-foreground">Agregar columna</Label>
            <div className="flex flex-wrap gap-1 mt-1">
              {ALL_COLS.filter(c => !activeCols.includes(c.key)).map(c => (
                <button key={c.key} onClick={() => toggleCol(c.key)} className="text-[10px] px-2 py-1 border border-border hover:bg-primary hover:text-primary-foreground transition-colors">
                  + {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <TimingSyncPanel<CircuitTimingEntry, CircuitEntry>
      title="Sync desde Web (Race Monitor / Z-Round / MyLaps)"
      storageKey="circuit-timing-sync"
      presetsKey="circuit-timing-presets"
      fields={CIRCUIT_FIELDS}
      defaultInterval={12}
      masterEntries={entries}
      onSync={(rows, meta) => {
        setTiming(rows);
        if (meta?.currentLap || meta?.totalLaps) {
          setEvent({
            ...(meta.currentLap ? { currentLap: meta.currentLap } : {}),
            ...(meta.totalLaps ? { totalLaps: meta.totalLaps } : {}),
          });
        }
      }}
      buildRow={buildRow}
      extraControls={colControls}
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
