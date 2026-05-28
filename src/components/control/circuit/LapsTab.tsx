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

const LapsTab = ({ onTake, onClear, liveGraphics }: Props) => {
  const { timing, setTiming, driverLap, setDriverLap, event, setEvent } = useCircuitStore();

  const update = (i: number, patch: Partial<CircuitTimingEntry>) => {
    const next = [...timing];
    next[i] = { ...next[i], ...patch };
    setTiming(next);
  };

  const remove = (i: number) => {
    setTiming(timing.filter((_, idx) => idx !== i).map((r, idx) => ({ ...r, position: idx + 1 })));
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
              <option value="practice">Practice</option>
              <option value="qualifying">Qualifying</option>
              <option value="race">Race</option>
              <option value="sprint">Sprint</option>
              <option value="feature">Feature</option>
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
          <h3 className="text-sm font-bold tracking-wider text-primary uppercase">Live Timing</h3>
          <div className="w-[280px]">
            <CircuitEntryPicker
              label=""
              onPick={(e) =>
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
                  },
                ])
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-[40px_60px_1fr_1fr_70px_70px_90px_90px_50px_30px] gap-1 text-[10px] uppercase tracking-wider text-muted-foreground px-1">
          <span>POS</span><span>Nº</span><span>Piloto</span><span>Equipo</span><span>Lap</span><span>Pits</span><span>Gap</span><span>Last</span><span>★</span><span></span>
        </div>

        <div className="max-h-[360px] overflow-y-auto space-y-1">
          {timing.map((row, i) => (
            <div key={i} className="grid grid-cols-[40px_60px_1fr_1fr_70px_70px_90px_90px_50px_30px] gap-1 items-center">
              <span className="text-xs text-center font-bold">{row.position}</span>
              <Input className="h-7 text-xs" value={row.carNumber} onChange={e => update(i, { carNumber: e.target.value })} />
              <Input className="h-7 text-xs" value={row.driverName} onChange={e => update(i, { driverName: e.target.value })} />
              <Input className="h-7 text-xs" value={row.team} onChange={e => update(i, { team: e.target.value })} />
              <Input className="h-7 text-xs" type="number" value={row.lap} onChange={e => update(i, { lap: +e.target.value })} />
              <Input className="h-7 text-xs" type="number" value={row.pitStops ?? 0} onChange={e => update(i, { pitStops: +e.target.value })} />
              <Input className="h-7 text-xs font-mono" value={row.gap} onChange={e => update(i, { gap: e.target.value })} />
              <Input className="h-7 text-xs font-mono" value={row.lastLap} onChange={e => update(i, { lastLap: e.target.value })} />
              <button
                onClick={() => update(i, { isPurple: !row.isPurple })}
                className={`text-xs px-1 ${row.isPurple ? 'bg-purple-600 text-white' : 'bg-muted text-muted-foreground'}`}
                title="Mejor vuelta de la sesión"
              >
                ★
              </button>
              <button onClick={() => remove(i)} className="text-rally-red hover:opacity-70 text-xs">✕</button>
            </div>
          ))}
        </div>

        <GraphicControl
          label="Live Timing"
          graphicId={'circuitTiming' as any}
          onTake={() => onTake('circuitTiming', { rows: timing, currentLap: event.currentLap, totalLaps: event.totalLaps, columns: getLiveCols(event.sessionType) })}
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
        <h3 className="text-sm font-bold tracking-wider text-primary uppercase">Driver Lap (lower third)</h3>
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
          <div><Label className="text-xs">Last</Label><Input value={driverLap.lastLap} onChange={e => setDriverLap({ lastLap: e.target.value })} /></div>
          <div><Label className="text-xs">Best</Label><Input value={driverLap.bestLap} onChange={e => setDriverLap({ bestLap: e.target.value })} /></div>
          <div><Label className="text-xs">Gap líder</Label><Input value={driverLap.gapToLeader} onChange={e => setDriverLap({ gapToLeader: e.target.value })} /></div>
        </div>
        <GraphicControl
          label="Driver Lap LT"
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
