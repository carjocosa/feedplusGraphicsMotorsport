import { useState, useCallback } from 'react';
import { useCircuitStore } from '@/store/circuitStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GraphicControl from '@/components/control/GraphicControl';
import CircuitEntryPicker from './CircuitEntryPicker';
import TimingSyncPanel from './TimingSyncPanel';
import type { CircuitTimingEntry, GuestLowerThirdData } from '@/types/circuit';
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

interface ColDef {
  key: string;
  label: string;
  width: string;
  render: (row: CircuitTimingEntry) => React.ReactNode;
}

const LapsTab = ({ onTake, onClear, liveGraphics }: Props) => {
  const { timing, setTiming, driverLap, setDriverLap, event, setEvent, entries, categories, selectedCategory, setSelectedCategory } = useCircuitStore();
  const [showPits, setShowPits] = useState(false);
  const [guest, setGuest] = useState<GuestLowerThirdData>({ name: '', role: '', subtitle: '' });

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

  const resolvePhoto = (carNumber: string, fallback?: string) => {
    const match = entries.find(e => e.carNumber === carNumber);
    return fallback || match?.photoUrl || undefined;
  };

  const cols: ColDef[] = [
    { key: 'photo', label: '', width: '32px', render: (r) => {
      const src = resolvePhoto(r.carNumber, r.photoUrl);
      return src ? <img src={src} alt="" className="w-7 h-7 rounded-sm object-cover" /> : <span className="w-7 h-7 rounded-sm border border-dashed border-muted-foreground block" />;
    }},
    { key: 'position', label: 'POS', width: '40px', render: (r) => <span className="text-xs text-center font-bold">{r.position}</span> },
    { key: 'carNumber', label: 'Nº', width: '60px', render: (r) => <Input className="h-7 text-xs" value={r.carNumber} onChange={e => update(r.carNumber, { carNumber: e.target.value })} /> },
    { key: 'driverName', label: 'Piloto', width: '1fr', render: (r) => <Input className="h-7 text-xs" value={r.driverName} onChange={e => update(r.carNumber, { driverName: e.target.value })} /> },
    { key: 'team', label: 'Equipo', width: '1fr', render: (r) => <Input className="h-7 text-xs" value={r.team} onChange={e => update(r.carNumber, { team: e.target.value })} /> },
    { key: 'lap', label: 'Vta', width: '70px', render: (r) => <Input className="h-7 text-xs" type="number" value={r.lap} onChange={e => update(r.carNumber, { lap: +e.target.value })} /> },
    { key: 'pitStops', label: 'Pits', width: '70px', render: (r) => <Input className="h-7 text-xs" type="number" value={r.pitStops ?? 0} onChange={e => update(r.carNumber, { pitStops: +e.target.value })} /> },
    { key: 'gap', label: 'Dif', width: '90px', render: (r) => <Input className="h-7 text-xs font-mono" value={r.gap} onChange={e => update(r.carNumber, { gap: e.target.value })} /> },
    { key: 'lastLap', label: 'Últ', width: '90px', render: (r) => <Input className="h-7 text-xs font-mono" value={r.lastLap} onChange={e => update(r.carNumber, { lastLap: e.target.value })} /> },
    { key: 'purple', label: '★', width: '50px', render: (r) => (
      <button onClick={() => update(r.carNumber, { isPurple: !r.isPurple })}
        className={`text-xs px-1 ${r.isPurple ? 'bg-purple-600 text-white' : 'bg-muted text-muted-foreground'}`}
        title="Mejor vuelta de la sesión">★</button>
    )},
    { key: 'remove', label: '', width: '30px', render: (r) => <button onClick={() => remove(r.carNumber)} className="text-rally-red hover:opacity-70 text-xs">✕</button> },
  ];

  const visibleCols = cols.filter(c => c.key !== 'pitStops' || showPits);
  const gridCols = visibleCols.map(c => c.width).join(' ');

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
            <Label className="text-xs">Total vueltas (líder)</Label>
            <Input type="number" value={event.totalLaps} onChange={e => setEvent({ totalLaps: +e.target.value })} />
          </div>
        </div>
      </div>

      <div className="p-4 border border-border bg-card space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-sm font-bold tracking-wider text-primary uppercase">Tiempos en Vivo</h3>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-muted-foreground hover:text-foreground transition-colors select-none">
              <input type="checkbox" checked={showPits} onChange={e => setShowPits(e.target.checked)} className="accent-primary" />
              Pits
            </label>
            <div className="w-[220px]">
              <CircuitEntryPicker label="" onPick={addFromPicker} />
            </div>
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

        <div className="grid gap-1 text-[10px] uppercase tracking-wider text-muted-foreground px-1" style={{ gridTemplateColumns: gridCols }}>
          {visibleCols.map(c => <span key={c.key}>{c.label}</span>)}
        </div>

        <div className="max-h-[360px] overflow-y-auto space-y-1">
          {filteredTiming.map((row) => (
            <div key={row.carNumber} className="grid gap-1 items-center" style={{ gridTemplateColumns: gridCols }}>
              {visibleCols.map(c => <span key={c.key}>{c.render(row)}</span>)}
            </div>
          ))}
        </div>

        <GraphicControl
          label="Tiempos en Vivo"
          graphicId={'circuitTiming' as any}
          onTake={() => onTake('circuitTiming', {
            rows: filteredTiming.map(r => {
              const match = entries.find(e => e.carNumber === r.carNumber);
              return { ...r, photoUrl: r.photoUrl || match?.photoUrl || undefined };
            }),
            currentLap: event.currentLap,
            totalLaps: event.totalLaps,
            columns: getLiveCols(event.sessionType),
          })}
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
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-muted-foreground hover:text-foreground transition-colors select-none">
            <input type="checkbox" checked={driverLap.showTelemetry !== false} onChange={e => setDriverLap({ showTelemetry: e.target.checked })} className="accent-primary" />
            Mostrar tiempos (VTA/ÚLT/MEJ/DIF)
          </label>
        </div>
        <GraphicControl
          label="Piloto (lower third)"
          graphicId={'driverLap' as any}
          onTake={() => onTake('driverLap', { ...driverLap, lap: event.currentLap, totalLaps: event.totalLaps })}
          onClear={() => onClear('driverLap')}
          isLive={liveGraphics.has('driverLap')}
        />
      </div>

      <div className="p-4 border border-border bg-card space-y-3">
        <h3 className="text-sm font-bold tracking-wider text-primary uppercase">Invitado (lower third)</h3>
        <div className="grid grid-cols-3 gap-3">
          <div><Label className="text-xs">Nombre</Label><Input value={guest.name} onChange={e => setGuest(g => ({ ...g, name: e.target.value }))} placeholder="Juan Pérez" /></div>
          <div><Label className="text-xs">Rol / Cargo</Label><Input value={guest.role} onChange={e => setGuest(g => ({ ...g, role: e.target.value }))} placeholder="Invitado Especial" /></div>
          <div><Label className="text-xs">Subtítulo</Label><Input value={guest.subtitle} onChange={e => setGuest(g => ({ ...g, subtitle: e.target.value }))} placeholder="FIA Karting" /></div>
        </div>
        <GraphicControl
          label="Invitado (lower third)"
          graphicId={'guestLowerThird' as any}
          onTake={() => onTake('guestLowerThird', guest)}
          onClear={() => onClear('guestLowerThird')}
          isLive={liveGraphics.has('guestLowerThird')}
        />
      </div>
    </div>
  );
};

export default LapsTab;
