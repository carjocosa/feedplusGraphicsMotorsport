import { useState } from 'react';
import { useRallyStore } from '@/store/rallyStore';
import TimingSyncPanel from './TimingSyncPanel';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { TimingEntry, Entry } from '@/types/rally';
import type { OverrideMap } from '@/lib/entryMatch';

const RALLY_FIELDS = [
  { key: 'position', label: 'Posición', numeric: true },
  { key: 'carNumber', label: 'Nº' },
  { key: 'driverName', label: 'Piloto' },
  { key: 'coDriverName', label: 'Copiloto' },
  { key: 'time', label: 'Tiempo' },
  { key: 'diff', label: 'Diff' },
];

const toNum = (v: unknown): number | null => {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  const s = String(v).trim().replace(',', '.').replace(/[^0-9.\-]/g, '');
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

const RallyTimingSyncPanel = () => {
  const { entries, addOrUpdateStageResult, removeStageResult, stageResultsByStage, overallStandings, setStageResults } = useRallyStore();
  const [stageName, setStageName] = useState('');

  const buildRow = (raw: Record<string, unknown>, i: number, mapping: Record<string, string>, autoMatch: boolean, overrides: OverrideMap, masterEntries: Entry[]) => {
    const warns: string[] = [];
    const get = (t: string) => {
      const src = mapping[t];
      return src && raw[src] !== undefined && raw[src] !== '' ? raw[src] : raw[t];
    };
    const numOr = (t: string, fb: number) => {
      const v = get(t);
      if (v === undefined || v === null || v === '') return fb;
      const n = toNum(v);
      if (n === null) { warns.push(`Fila ${i + 1}: "${t}" no convertible (valor: "${v}")`); return fb; }
      return n;
    };
    const carNumber = String(get('carNumber') ?? '');
    const match = autoMatch
      ? masterEntries.find((e: Entry) => e.carNumber === carNumber) || null
      : null;
    const pick = (scrap: unknown, fromMatch?: string) => {
      const s = scrap === undefined || scrap === null ? '' : String(scrap);
      return s || (fromMatch ?? '');
    };
    const row: TimingEntry = {
      position: numOr('position', i + 1),
      carNumber: carNumber || (match?.carNumber ?? ''),
      driverName: pick(get('driverName'), match?.driverName),
      coDriverName: pick(get('coDriverName'), match?.coDriverName),
      time: String(get('time') ?? raw.lastLap ?? raw.bestLap ?? ''),
      diff: String(get('diff') ?? raw.gap ?? ''),
    };
    return { row, warns };
  };

  const stageControls = (
    <div className="border-t border-border pt-3 space-y-3">
      <div>
        <Label className="text-xs font-bold tracking-wider uppercase text-primary">Etapas acumuladas ({stageResultsByStage.length})</Label>
        <p className="text-[11px] text-muted-foreground mt-1">Cada etapa se guarda por separado. El overall se calcula automáticamente.</p>
      </div>

      <div className="flex gap-2">
        <Input
          value={stageName}
          onChange={e => setStageName(e.target.value)}
          placeholder="Nombre de etapa (ej: SS4 El Cóndor)"
          className="h-8 text-xs"
        />
      </div>

      {/* Overall calculado */}
      {overallStandings.length > 0 && (
        <div className="flex items-center gap-2 p-2 bg-primary/5 border border-primary/20 rounded">
          <span className="text-[11px] font-bold text-primary uppercase">Overall calculado</span>
          <span className="text-[11px] text-muted-foreground">{overallStandings.length} crews · {stageResultsByStage.length} etapas</span>
          <button
            onClick={() => setStageResults(overallStandings)}
            className="ml-auto px-2 py-0.5 text-[10px] bg-primary text-primary-foreground rounded hover:opacity-80"
          >
            MOSTRAR
          </button>
        </div>
      )}

      {stageResultsByStage.length === 0 ? (
        <p className="text-[11px] text-muted-foreground">Sin etapas aún. Presiona PROBAR para agregar la primera.</p>
      ) : (
        <div className="space-y-1 max-h-40 overflow-auto">
          {stageResultsByStage.map(sr => (
            <div key={sr.name} className="flex items-center gap-2 text-xs bg-card px-2 py-1.5 rounded">
              <span className="flex-1 truncate">
                <span className="font-bold">{sr.name}</span>
                <span className="text-muted-foreground ml-2 text-[10px]">{sr.results.length} crews</span>
              </span>
              <button
                onClick={() => setStageResults(sr.results)}
                className="px-2 py-0.5 text-[10px] bg-secondary text-secondary-foreground rounded hover:opacity-80"
              >
                MOSTRAR
              </button>
              <button
                onClick={() => removeStageResult(sr.name)}
                className="px-2 text-rally-red hover:opacity-70"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <TimingSyncPanel<TimingEntry, Entry>
      title="Sync desde Web (Cronotec / Rally results)"
      storageKey="rally-timing-sync"
      presetsKey="rally-timing-presets"
      fields={RALLY_FIELDS}
      defaultInterval={75}
      masterEntries={entries}
      onSync={(rows, _meta) => {
        const name = stageName.trim() || `Etapa ${stageResultsByStage.length + 1}`;
        const url = '';
        addOrUpdateStageResult(name, url, rows);
        setStageResults(rows);
      }}
      buildRow={buildRow}
      extraControls={stageControls}
      extraPresetFields={{ stageName }}
      loadExtraPresetFields={(p) => { if (p.stageName) setStageName(p.stageName as string); }}
    />
  );
};

export default RallyTimingSyncPanel;
