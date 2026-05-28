import { useState } from 'react';
import { useRallyStore } from '@/store/rallyStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Entry } from '@/types/rally';
import { fetchEntries, ENTRY_FIELDS } from '@/lib/timingScraper';

const newEntry = (): Entry => ({
  id: `e${Date.now()}`,
  carNumber: '',
  driverName: '',
  coDriverName: '',
  driverCountry: '',
  coDriverCountry: '',
  team: '',
  car: '',
  category: '',
});

/**
 * Auto-detect column mapping by matching source field names to target keys.
 */
const autoDetectMapping = (sourceFields: string[]): Record<string, string> => {
  const mapping: Record<string, string> = {};
  for (const field of ENTRY_FIELDS) {
    const key = field.key.toLowerCase();
    for (const src of sourceFields) {
      const srcLower = src.toLowerCase().replace(/[^a-záéíóúñ0-9]/g, '');
      // Direct match
      if (srcLower === key) { mapping[field.key] = src; break; }
      // Contains match
      if (srcLower.includes(key) || key.includes(srcLower)) { mapping[field.key] = src; break; }
      // Common aliases
      const aliases: Record<string, string[]> = {
        carnumber: ['nº', 'num', 'numero', 'number', 'no', 'nro'],
        drivername: ['piloto', 'driver', 'conductor', 'nombre'],
        codrivername: ['copiloto', 'codriver', 'navigator', 'copil'],
        drivercountry: ['paispiloto', 'banderapiloto', 'paisp', 'flagdriver'],
        codrivercountry: ['paiscopiloto', 'banderacopi', 'paisc', 'flagcodriver'],
        team: ['equipo', 'team', 'escuderia', 'escudería'],
        car: ['auto', 'car', 'vehiculo', 'vehículo', 'modelo'],
        category: ['categoria', 'categoría', 'cat', 'class', 'clase'],
      };
      const fieldAliases = aliases[key] || [];
      for (const alias of fieldAliases) {
        if (srcLower.includes(alias) || alias.includes(srcLower)) {
          mapping[field.key] = src;
          break;
        }
      }
      if (mapping[field.key]) break;
    }
  }
  return mapping;
};

const EntriesTab = () => {
  const { entries, setEntries, addEntry, updateEntry, removeEntry, generateStartListFromEntries } = useRallyStore();
  const [csvText, setCsvText] = useState('');
  const [sheetUrl, setSheetUrl] = useState('');
  const [sourceFields, setSourceFields] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, unknown>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMapping, setShowMapping] = useState(false);
  const [previewCount, setPreviewCount] = useState(0);

  const syncAllFromEntries = () => {
    generateStartListFromEntries();
  };

  const importCSV = () => {
    try {
      const lines = csvText.trim().split('\n').filter(l => l.trim());
      const parsed: Entry[] = lines.map((line, i) => {
        const p = line.split(',').map(s => s.trim());
        return {
          id: `csv-${Date.now()}-${i}`,
          carNumber: p[0] || '',
          driverName: p[1] || '',
          coDriverName: p[2] || '',
          driverCountry: p[3] || '',
          coDriverCountry: p[4] || '',
          team: p[5] || '',
          car: p[6] || '',
          category: p[7] || '',
        };
      });
      setEntries(parsed);
      setCsvText('');
    } catch (e) {
      console.error('CSV parse error', e);
    }
  };

  const exportCSV = () => {
    const csv = entries.map(e =>
      [e.carNumber, e.driverName, e.coDriverName, e.driverCountry, e.coDriverCountry, e.team, e.car, e.category || ''].join(',')
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'inscritos.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const fetchSheet = async () => {
    if (!sheetUrl.trim()) {
      setError('Pegá la URL del Google Sheet publicado.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchEntries(sheetUrl.trim());
      setRawRows(rows);
      if (rows[0]) {
        const fields = Object.keys(rows[0]);
        setSourceFields(fields);
        // Auto-detect mapping
        setMapping(autoDetectMapping(fields));
        setShowMapping(true);
      }
      setPreviewCount(rows.length);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const applyMapping = () => {
    const mapped: Entry[] = rawRows.map((r, i) => {
      const get = (key: string) => {
        const src = mapping[key];
        return src && r[src] !== undefined && r[src] !== '' ? String(r[src]) : String(r[key] ?? '');
      };
      return {
        id: `sheet-${Date.now()}-${i}`,
        carNumber: get('carNumber'),
        driverName: get('driverName'),
        coDriverName: get('coDriverName'),
        driverCountry: get('driverCountry'),
        coDriverCountry: get('coDriverCountry'),
        team: get('team'),
        car: get('car'),
        category: get('category'),
      };
    }).filter(e => e.carNumber || e.driverName);
    setEntries(mapped);
    setShowMapping(false);
    setRawRows([]);
    setSourceFields([]);
  };

  const mappedPreview = rawRows.length > 0 ? rawRows.map(r => {
    const get = (key: string) => {
      const src = mapping[key];
      return src && r[src] !== undefined && r[src] !== '' ? String(r[src]) : String(r[key] ?? '');
    };
    return {
      carNumber: get('carNumber'),
      driverName: get('driverName'),
      coDriverName: get('coDriverName'),
      team: get('team'),
      category: get('category'),
    };
  }).filter(e => e.carNumber || e.driverName) : [];

  return (
    <div className="space-y-6">
      {/* Google Sheets Sync */}
      <div className="space-y-3 p-4 border border-border bg-card">
        <h3 className="text-sm font-bold tracking-wider text-primary uppercase">📊 Importar desde Google Sheets</h3>
        <p className="text-xs text-muted-foreground">
          Pegá la URL publicada del Google Sheet (Formato: <span className="font-mono">.../pubhtml</span>). Se convierte a CSV automáticamente.
        </p>
        <div className="flex gap-2">
          <Input
            value={sheetUrl}
            onChange={e => setSheetUrl(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/e/.../pubhtml"
            className="h-9 text-xs"
          />
          <button
            onClick={fetchSheet}
            disabled={loading}
            className="h-9 px-4 text-xs font-bold bg-primary text-primary-foreground hover:opacity-80 disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? '...' : 'PROBAR'}
          </button>
        </div>

        {error && (
          <div className="text-xs text-rally-red border border-rally-red/40 bg-rally-red/10 p-2 rounded">
            ⚠️ {error}
          </div>
        )}

        {previewCount > 0 && (
          <div className="text-xs text-emerald-400">
            ✓ {previewCount} filas detectadas
          </div>
        )}

        {/* Column Mapping */}
        {showMapping && sourceFields.length > 0 && (
          <div className="space-y-2 p-3 bg-background/50 border border-border">
            <p className="text-[11px] text-muted-foreground">
              Asigná cada campo del sistema a la columna del Sheet.
              <span className="ml-1 font-mono">Campos detectados: {sourceFields.join(', ')}</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              {ENTRY_FIELDS.map(({ key, label }) => {
                const autoDetected = !!mapping[key];
                return (
                  <div key={key} className={`flex items-center gap-2 p-2 rounded border ${autoDetected ? 'border-green-500/40 bg-green-500/5' : 'border-border'}`}>
                    <Label className="text-xs w-28 shrink-0">
                      {label}
                      {autoDetected && <span className="ml-1 text-[9px] text-green-400">(auto)</span>}
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
                        <option key={f} value={f} className={f === mapping[key] ? 'font-bold' : ''}>
                          {f}{f === mapping[key] ? ' ✓' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>

            {/* Preview */}
            {mappedPreview.length > 0 && (
              <div className="mt-2 p-2 bg-background rounded border max-h-32 overflow-auto">
                <p className="text-[10px] text-muted-foreground mb-1">Vista previa ({mappedPreview.length} entries):</p>
                {mappedPreview.slice(0, 5).map((e, i) => (
                  <div key={i} className="text-[10px] font-mono">
                    #{e.carNumber} {e.driverName}{e.coDriverName ? ` / ${e.coDriverName}` : ''} — {e.team}
                  </div>
                ))}
                {mappedPreview.length > 5 && (
                  <div className="text-[10px] text-muted-foreground">... y {mappedPreview.length - 5} más</div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={applyMapping} className="px-3 py-1 text-xs font-bold bg-primary text-primary-foreground rounded hover:opacity-80">
                Importar {mappedPreview.length} inscritos
              </button>
              <button onClick={() => { setMapping({}); setRawRows([]); setSourceFields([]); setShowMapping(false); }} className="px-3 py-1 text-xs text-muted-foreground hover:text-rally-red">
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Manual Entries */}
      <div className="space-y-3 p-4 border border-border bg-card">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold tracking-wider text-primary uppercase">Inscritos ({entries.length})</h3>
          <div className="flex gap-2">
            <button onClick={syncAllFromEntries} className="px-3 py-1 text-xs bg-accent text-accent-foreground hover:opacity-80 font-bold">⚡ Sync All</button>
            <button onClick={() => addEntry(newEntry())} className="px-3 py-1 text-xs bg-primary text-primary-foreground hover:opacity-80">+ Agregar</button>
            <button onClick={exportCSV} className="px-3 py-1 text-xs bg-secondary text-secondary-foreground hover:bg-secondary/80">Exportar CSV</button>
            <button onClick={() => setEntries([])} className="px-3 py-1 text-xs bg-destructive text-destructive-foreground hover:opacity-80">Vaciar</button>
          </div>
        </div>

        <div className="max-h-[420px] overflow-y-auto space-y-2">
          {entries.map((e) => (
            <div key={e.id} className="grid grid-cols-9 gap-1 text-xs items-center">
              <Input className="h-7 text-xs" placeholder="#" value={e.carNumber} onChange={ev => updateEntry(e.id, { carNumber: ev.target.value })} />
              <Input className="h-7 text-xs col-span-2" placeholder="Piloto" value={e.driverName} onChange={ev => updateEntry(e.id, { driverName: ev.target.value })} />
              <Input className="h-7 text-xs col-span-2" placeholder="Copiloto" value={e.coDriverName} onChange={ev => updateEntry(e.id, { coDriverName: ev.target.value })} />
              <Input className="h-7 text-xs" placeholder="🇫🇷" value={e.driverCountry} onChange={ev => updateEntry(e.id, { driverCountry: ev.target.value })} />
              <Input className="h-7 text-xs" placeholder="Equipo" value={e.team} onChange={ev => updateEntry(e.id, { team: ev.target.value })} />
              <Input className="h-7 text-xs" placeholder="Auto" value={e.car} onChange={ev => updateEntry(e.id, { car: ev.target.value })} />
              <button onClick={() => removeEntry(e.id)} className="h-7 text-xs bg-destructive text-destructive-foreground hover:opacity-80">✕</button>
            </div>
          ))}
          {entries.length === 0 && <p className="text-xs text-muted-foreground py-4 text-center">Sin inscritos. Agrega uno o importa CSV.</p>}
        </div>
      </div>

      {/* CSV Import */}
      <div className="space-y-2 p-4 border border-border bg-card">
        <Label className="text-xs text-muted-foreground">Importar CSV (carNumber, piloto, copiloto, banderaPiloto, banderaCopi, equipo, auto, categoría)</Label>
        <textarea
          className="w-full h-28 border border-input bg-background px-2 py-1 text-xs font-mono"
          value={csvText}
          onChange={e => setCsvText(e.target.value)}
          placeholder="1, Sébastien Ogier, Vincent Landais, 🇫🇷, 🇫🇷, Toyota Gazoo Racing, Toyota GR Yaris Rally1, Rally1"
        />
        <button onClick={importCSV} className="px-3 py-1 text-xs bg-primary text-primary-foreground hover:opacity-80">Importar CSV (reemplaza)</button>
      </div>
    </div>
  );
};

export default EntriesTab;
