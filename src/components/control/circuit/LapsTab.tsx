import { useCallback } from 'react';
import { useCircuitStore } from '@/store/circuitStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GraphicControl from '@/components/control/GraphicControl';
import CircuitEntryPicker from './CircuitEntryPicker';
import TimingSyncPanel from './TimingSyncPanel';
import type { CircuitTimingEntry } from '@/types/circuit';
import { getLiveCols } from '@/lib/liveTimingColumns';

interface Props {
  onTake: (id: string, data: any) => void;
  onClear: (id: string) => void;
  liveGraphics: Set<string>;
}

const SESSION_LABELS: Record<string, string> = {
  practice: 'Práctica',
  qualifying: 'Clasificación',
  race: 'Carrera',
  sprint: 'Sprint',
  feature: 'Feature',
};

const LapsTab = ({ onTake, onClear, liveGraphics }: Props) => {
  const { timing, setTiming, driverLap, setDriverLap, event, setEvent, entries, categories, selectedCategory, setSelectedCategory } = useCircuitStore();

  const filteredTiming = selectedCategory
    ? timing.filter(t => entries.some(e => e.carNumber === t.carNumber && e.category === selectedCategory))
    : timing;

  const update = useCallback((carNumber: string, patch: Partial<CircuitTimingEntry>) => {
    const idx = timing.findIndex(t => t.carNumber === carNumber);
    if (idx === -1) return;
    const next = [...timing];
    next[idx] = { ...next[idx], ...patch };
    setTiming(next);
  }, [timing, setTiming]);

  const remove = useCallback((carNumber: string) => {
    setTiming(timing.filter(t => t.carNumber !== carNumber).map((r, i) => ({ ...r, position: i + 1 })));
  }, [timing, setTiming]);

  const addFromPicker = (e: typeof entries[0]) => {
    setTiming([
      ...timing,
      {
        position: timing.length + 1,
        carNumber: e.carNumber,
        driverName: e.driverName,
        team: e.team,
        lap: event.currentLap,
        gap: timing.length === 0 ? 'LEADER' : '',
        interval: '',
        lastLap: '',
        bestLap: '',
        pitStops: 0,
        status: 'racing',
        photoUrl: e.photoUrl || undefined,
      },
    ]);
  };

  return (
    <div className="space-y-4">
      <TimingSyncPanel />

      <div className="p-4 border border-border bg-card space-y-3">
        <h3 className="text-sm font-bold tracking-wider text-primary uppercase">Sesión / Vueltas</h3>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label className="text-xs">Tipo de sesión</Label>
            <select
              value={event.sessionType}
              onChange={e => setEvent({ sessionType: e.target.value as any })}
              className="flex h-10 w-full border border-input bg-background px-3 py-2 text-sm"
            >
              {Object.entries(SESSION_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-xs">Vuelta actual</Label>
            <Input type="number" value={event.currentLap} onChange={e => setEvent({ currentLap: +e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Total vueltas</Label>
            <Input type="number" value={event.totalLaps} onChange={e => setEvent({ totalLaps: +e.target.value })} />
          </div>
        </div>
      </div>

      <div className="p-4 border border-border bg-card space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-sm font-bold tracking-wider text-primary uppercase">Tiempos en Vivo</h3>
          <div className="w-[280px]">
            <CircuitEntryPicker label="" onPick={addFromPicker} />
          </div>
        </div>

        {categories.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Filtrar:</span>
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-2 py-1 text-[10px] font-semibold uppercase rounded-sm transition-all ${!selectedCategory ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            >
              Todas
            </button>
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(selectedCategory === c.name ? null : c.name)}
                className="px-2 py-1 text-[10px] font-semibold uppercase rounded-sm transition-all"
                style={{
                  background: selectedCategory === c.name ? `${c.color}22` : undefined,
                  color: selectedCategory === c.name ? c.color : undefined,
                  border: `1px solid ${selectedCategory === c.name ? c.color : 'transparent'}`,
                }}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-[40px_60px_1fr_1fr_70px_70px_90px_90px_50px_30px] gap-1 text-[10px] uppercase tracking-wider text-muted-foreground px-1">
          <span>POS</span><span>Nº</span><span>Piloto</span><span>Equipo</span><span>Vta</span><span>Pits</span><span>Dif</span><span>Últ</span><span>★</span><span></span>
        </div>

        <div className="max-h-[360px] overflow-y-auto space-y-1">
          {filteredTiming.map((row) => (
            <div key={row.carNumber} className="grid grid-cols-[40px_60px_1fr_1fr_70px_70px_90px_90px_50px_30px] gap-1 items-center">
              <span className="text-xs text-center font-bold">{row.position}</span>
              <Input className="h-7 text-xs" value={row.carNumber} onChange={e => update(row.carNumber, { carNumber: e.target.value })} />
              <Input className="h-7 text-xs" value={row.driverName} onChange={e => update(row.carNumber, { driverName: e.target.value })} />
              <Input className="h-7 text-xs" value={row.team} onChange={e => update(row.carNumber, { team: e.target.value })} />
              <Input className="h-7 text-xs" type="number" value={row.lap} onChange={e => update(row.carNumber, { lap: +e.target.value })} />
              <Input className="h-7 text-xs" type="number" value={row.pitStops ?? 0} onChange={e => update(row.carNumber, { pitStops: +e.target.value })} />
              <Input className="h-7 text-xs font-mono" value={row.gap} onChange={e => update(row.carNumber, { gap: e.target.value })} />
              <Input className="h-7 text-xs font-mono" value={row.lastLap} onChange={e => update(row.carNumber, { lastLap: e.target.value })} />
              <button
                onClick={() => update(row.carNumber, { isPurple: !row.isPurple })}
                className={`text-xs px-1 ${row.isPurple ? 'bg-purple-600 text-white' : 'bg-muted text-muted-foreground'}`}
                title="Mejor vuelta de la sesión"
              >
                ★
              </button>
              <button onClick={() => remove(row.carNumber)} className="text-rally-red hover:opacity-70 text-xs">✕</button>
            </div>
          ))}
        </div>

        <GraphicControl
          label="Tiempos en Vivo"
          graphicId={'circuitTiming' as any}
          onTake={() => onTake('circuitTiming', { rows: filteredTiming, currentLap: event.currentLap, totalLaps: event.totalLaps, columns: getLiveCols(event.sessionType) })}
          onClear={() => onClear('circuitTiming')}
          isLive={liveGraphics.has('circuitTiming')}
        />
        <GraphicControl
          label="Scorebug (serie / circuito / vuelta)"
          graphicId={'circuitScorebug' as any}
          onTake={() => onTake('circuitScorebug', event)}
          onClear={() => onClear('circuitScorebug')}
          isLive={liveGraphics.has('circuitScorebug')}
        />
      </div>

      <div className="p-4 border border-border bg-card space-y-3">
        <h3 className="text-sm font-bold tracking-wider text-primary uppercase">Piloto (lower third)</h3>
        <div className="w-[280px]">
          <CircuitEntryPicker
            label="Cargar piloto desde lista"
            onPick={(e) => setDriverLap({
              carNumber: e.carNumber,
              driverName: e.driverName,
              team: e.team,
              country: e.country,
            })}
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div><Label className="text-xs">Nº</Label><Input value={driverLap.carNumber} onChange={e => setDriverLap({ carNumber: e.target.value })} /></div>
          <div><Label className="text-xs">Piloto</Label><Input value={driverLap.driverName} onChange={e => setDriverLap({ driverName: e.target.value })} /></div>
          <div><Label className="text-xs">País</Label><Input value={driverLap.country} onChange={e => setDriverLap({ country: e.target.value })} /></div>
          <div><Label className="text-xs">Equipo</Label><Input value={driverLap.team} onChange={e => setDriverLap({ team: e.target.value })} /></div>
          <div><Label className="text-xs">Pos</Label><Input type="number" value={driverLap.position} onChange={e => setDriverLap({ position: +e.target.value })} /></div>
          <div><Label className="text-xs">Sector</Label>
            <select value={driverLap.sector} onChange={e => setDriverLap({ sector: +e.target.value as 1 | 2 | 3 })} className="flex h-10 w-full border border-input bg-background px-3 py-2 text-sm">
              <option value={1}>S1</option><option value={2}>S2</option><option value={3}>S3</option>
            </select>
          </div>
          <div><Label className="text-xs">Últ vuelta</Label><Input value={driverLap.lastLap} onChange={e => setDriverLap({ lastLap: e.target.value })} /></div>
          <div><Label className="text-xs">Mejor</Label><Input value={driverLap.bestLap} onChange={e => setDriverLap({ bestLap: e.target.value })} /></div>
          <div><Label className="text-xs">Dif líder</Label><Input value={driverLap.gapToLeader} onChange={e => setDriverLap({ gapToLeader: e.target.value })} /></div>
        </div>
        <GraphicControl
          label="Piloto (lower third)"
          graphicId={'driverLap' as any}
          onTake={() => onTake('driverLap', { ...driverLap, lap: event.currentLap, totalLaps: event.totalLaps })}
          onClear={() => onClear('driverLap')}
          isLive={liveGraphics.has('driverLap')}
        />
      </div>
    </div>
  );
};

export default LapsTab;
