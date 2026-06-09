import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { resolveMatch, type OverrideMap } from '@/lib/entryMatch';
import { fetchTiming } from '@/lib/timingScraper';

interface BaseEntry {
  id: string;
  carNumber: string;
  driverName: string;
  [key: string]: unknown;
}

interface FieldDef {
  key: string;
  label: string;
  numeric?: boolean;
}

interface TimingSyncPanelProps<RowType, EntryType extends BaseEntry> {
  title: string;
  storageKey: string;
  presetsKey: string;
  fields: FieldDef[];
  defaultInterval: number;
  masterEntries: EntryType[];
  onSync: (rows: RowType[], meta?: { currentLap?: number; totalLaps?: number }) => void;
  onAutoSync?: (rows: RowType[], meta?: { currentLap?: number; totalLaps?: number }) => void;
  buildRow: (raw: Record<string, unknown>, i: number, mapping: Record<string, string>, autoMatch: boolean, overrides: OverrideMap, entries: EntryType[]) => { row: RowType; warns: string[] };
  extraControls?: React.ReactNode;
  extraPresetFields?: Record<string, unknown>;
  loadExtraPresetFields?: (preset: Record<string, unknown>) => void;
}

const TimingSyncPanel = <RowType, EntryType extends BaseEntry>({
  title,
  storageKey,
  presetsKey,
  fields,
  defaultInterval,
  masterEntries,
  onSync,
  onAutoSync,
  buildRow,
  extraControls,
  extraPresetFields,
  loadExtraPresetFields,
}: TimingSyncPanelProps<RowType, EntryType>) => {
  const { toast } = useToast();
  const timerRef = useRef<number | null>(null);

  const initial = (() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  })() || {};

  const [url, setUrl] = useState(initial.url || '');
  const [hint, setHint] = useState(initial.hint || '');
  const [intervalSec, setIntervalSec] = useState(initial.intervalSec || defaultInterval);
  const [mapping, setMapping] = useState<Record<string, string>>(initial.mapping || {});
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [showMapping, setShowMapping] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [sourceFields, setSourceFields] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, unknown>[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [presets, setPresets] = useState<Record<string, unknown>[]>(() => {
    try { return JSON.parse(localStorage.getItem(presetsKey) || '[]'); } catch { return []; }
  });
  const [presetName, setPresetName] = useState('');
  const [autoMatch, setAutoMatch] = useState(true);
  const [overrides, setOverrides] = useState<OverrideMap>({});

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({ url, hint, intervalSec, mapping, ...extraPresetFields }));
  }, [url, hint, intervalSec, mapping]);

  useEffect(() => {
    localStorage.setItem(presetsKey, JSON.stringify(presets));
  }, [presets]);

  const runOnce = async () => {
    if (!url) {
      toast({ title: 'Falta la URL', description: 'Pega la URL pública de timing', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setLastError(null);
    try {
      const rows = await fetchTiming(url);
      setRawRows(rows as Record<string, unknown>[]);
      if (rows[0]) {
        const fields = Object.keys(rows[0]);
        setSourceFields(fields);
        // Auto-open mapping when new fields are detected
        setShowMapping(true);
      }

      const allWarns: string[] = [];
      const mapped = rows.map((r, i) => {
        const { row, warns } = buildRow(r as Record<string, unknown>, i, mapping, autoMatch, overrides, masterEntries);
        allWarns.push(...warns);
        return row;
      });
      setWarnings(allWarns.slice(0, 8));
      onSync(mapped);
      if (running) onAutoSync?.(mapped);
      setLastSync(new Date().toLocaleTimeString());
      if (allWarns.length) {
        toast({ title: `Sync con ${allWarns.length} aviso(s)`, description: 'Revisa la sección "Avisos" abajo' });
      } else {
        toast({ title: 'Timing sincronizado', description: `${mapped.length} pilotos actualizados` });
      }
    } catch (e: unknown) {
      setLastError(e instanceof Error ? e.message : String(e));
      toast({ title: 'Error de sync', description: e instanceof Error ? e.message : String(e), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!running) {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }
    runOnce();
    timerRef.current = window.setInterval(runOnce, Math.max(5, intervalSec) * 1000);
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, intervalSec, url, hint, mapping]);

  useEffect(() => {
    if (rawRows.length === 0) return;
    const allWarns: string[] = [];
    const rows = rawRows.map((r, i) => {
      const { row, warns } = buildRow(r, i, mapping, autoMatch, overrides, masterEntries);
      allWarns.push(...warns);
      return row;
    });
    setWarnings(allWarns.slice(0, 8));
    onSync(rows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overrides, autoMatch, masterEntries]);

  const savePreset = () => {
    const name = presetName.trim();
    if (!name) { toast({ title: 'Nombre requerido', variant: 'destructive' }); return; }
    const p = { name, url, hint, intervalSec, mapping, ...extraPresetFields };
    setPresets(prev => [...prev.filter(x => x.name !== name), p]);
    setPresetName('');
    toast({ title: `Preset "${name}" guardado` });
  };

  const loadPreset = (p: Record<string, unknown>) => {
    setUrl(p.url);
    setHint(p.hint);
    setIntervalSec(p.intervalSec);
    setMapping(p.mapping || {});
    if (loadExtraPresetFields) loadExtraPresetFields(p);
    toast({ title: `Preset "${p.name}" cargado` });
  };

  const deletePreset = (name: string) => setPresets(prev => prev.filter(x => x.name !== name));

  return (
    <div className="p-4 border border-border bg-card space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-wider text-primary uppercase">{title}</h3>
        <div className="flex items-center gap-2 text-xs">
          <span className={`inline-block w-2 h-2 rounded-full ${running ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'}`} />
          <span className="text-muted-foreground">{running ? 'AUTO' : 'IDLE'}</span>
          {lastSync && <span className="text-muted-foreground">· {lastSync}</span>}
        </div>
      </div>

      <div className="grid grid-cols-[1fr_120px_120px] gap-2 items-end">
        <div>
          <Label className="text-xs">URL pública de timing</Label>
          <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." />
        </div>
        <div>
          <Label className="text-xs">Intervalo (s)</Label>
          <Input type="number" min={5} value={intervalSec} onChange={e => setIntervalSec(+e.target.value)} />
        </div>
        <div className="flex gap-1">
          <button onClick={runOnce} disabled={loading} className="flex-1 h-10 text-xs font-bold bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50">
            {loading ? '...' : 'PROBAR'}
          </button>
          <button onClick={() => setRunning(r => !r)} className={`flex-1 h-10 text-xs font-bold ${running ? 'bg-rally-red text-white' : 'bg-primary text-primary-foreground'}`}>
            {running ? 'STOP' : 'AUTO'}
          </button>
        </div>
      </div>

      <div>
        <Label className="text-xs">Pista al modelo (opcional)</Label>
        <Input value={hint} onChange={e => setHint(e.target.value)} placeholder="Ej: usar columna 'Last' como vuelta" />
      </div>

      {extraControls}

      <div className="flex items-center justify-between gap-2 p-2 bg-background/40 border border-border">
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input type="checkbox" checked={autoMatch} onChange={e => setAutoMatch(e.target.checked)} />
          <span>Match automático con inscritos por nº ({masterEntries.length} cargados)</span>
        </label>
        {Object.keys(overrides).length > 0 && (
          <button onClick={() => setOverrides({})} className="text-[11px] text-muted-foreground hover:text-rally-red">
            Limpiar overrides ({Object.keys(overrides).length})
          </button>
        )}
      </div>

      {warnings.length > 0 && (
        <div className="border border-yellow-500/40 bg-yellow-500/10 p-3 space-y-1">
          <div className="text-[11px] font-bold tracking-wider uppercase text-yellow-500">⚠ Avisos ({warnings.length})</div>
          <ul className="text-[11px] text-yellow-200/90 space-y-0.5 max-h-28 overflow-auto font-mono">
            {warnings.map((w, i) => <li key={i}>- {w}</li>)}
          </ul>
        </div>
      )}

      <div className="border-t border-border pt-3">
        <button onClick={() => setShowPreview(s => !s)} className="text-xs font-bold tracking-wider uppercase text-primary hover:opacity-80">
          {showPreview ? '▼' : '▶'} Vista previa del scrap {rawRows.length > 0 && `(${rawRows.length} filas)`}
        </button>
        {showPreview && (
          <div className="mt-2 p-2 bg-background/50 border border-border">
            {rawRows.length === 0 ? (
              <p className="text-[11px] text-muted-foreground">Presiona PROBAR para ver datos crudos.</p>
            ) : (
              <div className="overflow-auto max-h-56 text-[10px] font-mono">
                <table className="w-full">
                  <thead className="bg-card sticky top-0">
                    <tr>
                      <th className="text-left px-2 py-1 border-b border-border text-primary">Match</th>
                      {sourceFields.map(f => <th key={f} className="text-left px-2 py-1 border-b border-border text-muted-foreground">{f}</th>)}
                    </tr>
                  </thead>
                  <tbody>
            {rawRows.slice(0, 20).map((r, i) => {
              const m = autoMatch ? resolveMatch(masterEntries, r, i, overrides) : null;
              const scrapDriver = String(r.driverName ?? r.Driver ?? r.driver ?? r.name ?? '');
              const scrapCoDriver = String(r.coDriverName ?? r.CoDriver ?? r.codriver ?? r.copiloto ?? '');
              return (
                <tr key={i} className={`border-b border-border/30 ${m ? 'bg-green-500/5' : ''}`}>
                  <td className="px-2 py-1 border-r border-border/40 align-top">
                    <div className="space-y-1">
                      <select
                        value={overrides[i] ?? '__auto'}
                        onChange={e => {
                          const v = e.target.value;
                          setOverrides(o => { const n = { ...o }; if (v === '__auto') delete n[i]; else n[i] = v; return n; });
                        }}
                        className="h-6 text-[10px] border border-input bg-background text-foreground px-1 w-full"
                      >
                        <option value="__auto">{m ? `✓ #${m.carNumber}` : '— sin match —'}</option>
                        <option value="">(forzar sin match)</option>
                        {masterEntries.map(e => (
                          <option key={e.id} value={e.id}>#{e.carNumber} {e.driverName}</option>
                        ))}
                      </select>
                      {scrapDriver && (
                        <div className="text-[10px]">
                          <div className="font-semibold text-foreground">{scrapDriver}</div>
                          {scrapCoDriver && <div className="text-muted-foreground">{scrapCoDriver}</div>}
                        </div>
                      )}
                      {m && (
                        <div className="text-[10px] text-green-400">
                          <div className="font-semibold">#{m.carNumber} {m.driverName}</div>
                          {m.coDriverName && <div>{m.coDriverName}</div>}
                        </div>
                      )}
                    </div>
                  </td>
                  {sourceFields.map(f => <td key={f} className="px-2 py-1 truncate max-w-[120px]">{String(r[f] ?? '')}</td>)}
                </tr>
              );
            })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-border pt-3 flex items-center justify-between">
        <button onClick={() => setShowMapping(s => !s)} className={`text-xs font-bold tracking-wider uppercase hover:opacity-80 flex items-center gap-2 ${sourceFields.length > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
          {showMapping ? '▼' : '▶'} Mapeo de campos
          {sourceFields.length > 0 && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${Object.keys(mapping).length > 0 ? 'bg-green-500/20 text-green-400' : 'bg-muted text-muted-foreground'}`}>
              {Object.keys(mapping).length}/{fields.length}
            </span>
          )}
          {sourceFields.length === 0 && <span className="text-[10px] text-muted-foreground">(PROBAR primero)</span>}
        </button>
      </div>
      {showMapping && (
        <div className="space-y-2 p-3 bg-background/50 border border-border">
          <p className="text-[11px] text-muted-foreground">
            Asigná cada campo del sistema a la columna que viene del scrap.
            {sourceFields.length > 0 && (
              <span className="ml-1">Campos detectados: <span className="font-mono text-foreground">{sourceFields.join(', ')}</span></span>
            )}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {fields.map(({ key, label, numeric }) => {
              const isMapped = !!mapping[key];
              const autoDetected = sourceFields.includes(key);
              return (
                <div key={key} className={`flex items-center gap-2 p-2 rounded border ${isMapped ? 'border-green-500/40 bg-green-500/5' : autoDetected ? 'border-blue-500/40 bg-blue-500/5' : 'border-border'}`}>
                  <Label className="text-xs w-24 shrink-0">
                    {label}{numeric && <span className="text-yellow-500 ml-1" title="Requiere número">#</span>}
                    {autoDetected && !isMapped && <span className="ml-1 text-[9px] text-blue-400">(auto)</span>}
                  </Label>
                  <select
                    value={mapping[key] || ''}
                    onChange={e => {
                      const v = e.target.value;
                      setMapping(m => { const n = { ...m }; if (!v) delete n[key]; else n[key] = v; return n; });
                    }}
                    className="flex h-8 flex-1 border border-input bg-background px-2 text-xs text-foreground"
                  >
                    <option value="">— sin mapear —</option>
                    {sourceFields.map(f => (
                      <option key={f} value={f} className={f === key ? 'font-bold' : ''}>
                        {f}{f === key ? ' ✓' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
          {Object.keys(mapping).length > 0 && (
            <button onClick={() => setMapping({})} className="text-[11px] text-muted-foreground hover:text-rally-red">Reset mapeo</button>
          )}
        </div>
      )}

      <div className="border-t border-border pt-3">
        <button onClick={() => setShowPresets(s => !s)} className="text-xs font-bold tracking-wider uppercase text-primary hover:opacity-80">
          {showPresets ? '▼' : '▶'} Presets ({presets.length})
        </button>
        {showPresets && (
          <div className="mt-2 p-3 bg-background/50 border border-border space-y-2">
            <div className="flex gap-2">
              <Input value={presetName} onChange={e => setPresetName(e.target.value)} placeholder="Nombre del preset" className="h-8 text-xs" />
              <button onClick={savePreset} className="h-8 px-3 text-xs font-bold bg-primary text-primary-foreground">GUARDAR</button>
            </div>
            {presets.length === 0 ? (
              <p className="text-[11px] text-muted-foreground">Sin presets.</p>
            ) : (
              <div className="space-y-1">
                {presets.map(p => (
                  <div key={p.name} className="flex items-center gap-2 text-xs bg-card px-2 py-1">
                    <span className="flex-1 truncate">
                      <span className="font-bold">{p.name}</span>
                      <span className="text-muted-foreground ml-2 text-[10px]">{p.url.slice(0, 40)}{p.url.length > 40 ? '…' : ''}</span>
                    </span>
                    <button onClick={() => loadPreset(p)} className="px-2 py-0.5 text-[10px] bg-secondary text-secondary-foreground hover:bg-secondary/80">CARGAR</button>
                    <button onClick={() => deletePreset(p.name)} className="px-2 text-rally-red hover:opacity-70">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{lastSync ? `Última sync: ${lastSync}` : 'Sin sincronizar todavía'}</span>
        {lastError && <span className="text-rally-red truncate max-w-[50%]">{lastError}</span>}
      </div>
    </div>
  );
};

export default TimingSyncPanel;
