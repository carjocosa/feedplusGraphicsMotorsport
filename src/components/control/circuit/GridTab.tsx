import { useCircuitStore } from '@/store/circuitStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GraphicControl from '@/components/control/GraphicControl';
import CircuitEntryPicker from './CircuitEntryPicker';
import type { GridSlot } from '@/types/circuit';

interface Props {
  onTake: (id: string, data: any) => void;
  onClear: (id: string) => void;
  liveGraphics: Set<string>;
}

const GridTab = ({ onTake, onClear, liveGraphics }: Props) => {
  const { grid, setGrid, event, setEvent, entries, categories, selectedCategory, setSelectedCategory } = useCircuitStore();

  const filteredEntries = selectedCategory
    ? entries.filter(e => e.category === selectedCategory)
    : entries;

  const update = (i: number, patch: Partial<GridSlot>) => {
    const next = [...grid];
    next[i] = { ...next[i], ...patch };
    setGrid(next);
  };

  const remove = (i: number) => {
    setGrid(grid.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, position: idx + 1 })));
  };

  const buildFromQualifying = () => {
    const sorted = [...filteredEntries]
      .filter(e => e.qualifyingTime)
      .sort((a, b) => (a.qualifyingTime ?? '').localeCompare(b.qualifyingTime ?? ''));
    setGrid(sorted.map((e, i) => ({
      position: i + 1,
      carNumber: e.carNumber,
      driverName: e.driverName,
      team: e.team,
      qualifyingTime: e.qualifyingTime,
      gap: i === 0 ? 'POLE' : `+${(0.05 + i * 0.1).toFixed(3)}`,
      photoUrl: e.photoUrl,
    })));
  };

  const addToGrid = (e: typeof entries[0]) => {
    setGrid([
      ...grid,
      {
        position: grid.length + 1,
        carNumber: e.carNumber,
        driverName: e.driverName,
        team: e.team,
        qualifyingTime: e.qualifyingTime,
        gap: grid.length === 0 ? 'POLE' : '',
        photoUrl: e.photoUrl,
      },
    ]);
  };

  return (
    <div className="space-y-4">
      <div className="p-4 border border-border bg-card space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold tracking-wider text-primary uppercase">Encabezado del evento</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div><Label className="text-xs">Serie</Label><Input value={event.series} onChange={e => setEvent({ series: e.target.value })} /></div>
          <div><Label className="text-xs">Fecha / Round</Label><Input value={event.round} onChange={e => setEvent({ round: e.target.value })} /></div>
          <div><Label className="text-xs">Circuito</Label><Input value={event.circuit} onChange={e => setEvent({ circuit: e.target.value })} /></div>
        </div>
      </div>

      <div className="p-4 border border-border bg-card space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-sm font-bold tracking-wider text-primary uppercase">Parrilla de salida</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={buildFromQualifying}
              className="px-3 py-1.5 text-xs font-bold uppercase bg-secondary text-secondary-foreground hover:opacity-80"
            >
              Generar desde Clasificación
            </button>
            <div className="w-[280px]">
              <CircuitEntryPicker
                label=""
                onPick={addToGrid}
              />
            </div>
          </div>
        </div>

        {/* Category filter */}
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

        <div className="max-h-[420px] overflow-y-auto space-y-1">
          {grid.map((slot, i) => (
            <div key={i} className="grid grid-cols-[40px_60px_1fr_1fr_90px_90px_30px] gap-1 items-center text-xs">
              <span className="text-center font-bold text-accent">P{slot.position}</span>
              <Input className="h-7 text-xs" value={slot.carNumber} onChange={e => update(i, { carNumber: e.target.value })} />
              <Input className="h-7 text-xs" value={slot.driverName} onChange={e => update(i, { driverName: e.target.value })} />
              <Input className="h-7 text-xs" value={slot.team} onChange={e => update(i, { team: e.target.value })} />
              <Input className="h-7 text-xs font-mono" value={slot.qualifyingTime ?? ''} onChange={e => update(i, { qualifyingTime: e.target.value })} placeholder="0:48.1" />
              <Input className="h-7 text-xs font-mono" value={slot.gap ?? ''} onChange={e => update(i, { gap: e.target.value })} placeholder="+0.123" />
              <button onClick={() => remove(i)} className="text-rally-red hover:opacity-70">✕</button>
            </div>
          ))}
        </div>

        <GraphicControl
          label="Parrilla de Salida"
          graphicId={'startGrid' as any}
          onTake={() => onTake('startGrid', grid)}
          onClear={() => onClear('startGrid')}
          isLive={liveGraphics.has('startGrid')}
        />
      </div>
    </div>
  );
};

export default GridTab;
