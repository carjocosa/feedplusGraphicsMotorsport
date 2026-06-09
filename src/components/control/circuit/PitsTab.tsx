import { useState } from 'react';
import { useCircuitStore } from '@/store/circuitStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GraphicControl from '@/components/control/GraphicControl';
import CircuitEntryPicker from './CircuitEntryPicker';
import type { PitEvent } from '@/types/circuit';

interface Props {
  onTake: (id: string, data: any) => void;
  onClear: (id: string) => void;
  liveGraphics: Set<string>;
}

const PitsTab = ({ onTake, onClear, liveGraphics }: Props) => {
  const { pitEvents, setPitEvents, addPitEvent, event } = useCircuitStore();
  const [draft, setDraft] = useState<PitEvent>({
    id: '',
    carNumber: '',
    driverName: '',
    team: '',
    pitTime: '',
    positionBefore: 1,
    positionAfter: 1,
    status: 'in',
    lap: event.currentLap,
  });

  const submit = () => {
    if (!draft.carNumber) return;
    addPitEvent({ ...draft, id: `p-${Date.now()}` });
    setDraft({ ...draft, carNumber: '', driverName: '', team: '', pitTime: '', status: 'in' });
  };

  return (
    <div className="space-y-4">
      <div className="p-4 border border-border bg-card space-y-3">
        <h3 className="text-sm font-bold tracking-wider text-primary uppercase">Registrar evento de pit</h3>
        <div className="w-[280px]">
          <CircuitEntryPicker
            label="Cargar piloto"
            onPick={(e) => setDraft(d => ({
              ...d,
              carNumber: e.carNumber,
              driverName: e.driverName,
              team: e.team,
            }))}
          />
        </div>
        <div className="grid grid-cols-4 gap-3">
          <div><Label className="text-xs">Nº</Label><Input value={draft.carNumber} onChange={e => setDraft({ ...draft, carNumber: e.target.value })} /></div>
          <div><Label className="text-xs">Piloto</Label><Input value={draft.driverName} onChange={e => setDraft({ ...draft, driverName: e.target.value })} /></div>
          <div><Label className="text-xs">Equipo</Label><Input value={draft.team} onChange={e => setDraft({ ...draft, team: e.target.value })} /></div>
          <div><Label className="text-xs">Tiempo en pits</Label><Input value={draft.pitTime} onChange={e => setDraft({ ...draft, pitTime: e.target.value })} placeholder="23.4s" /></div>
          <div><Label className="text-xs">Pos antes</Label><Input type="number" value={draft.positionBefore} onChange={e => setDraft({ ...draft, positionBefore: +e.target.value })} /></div>
          <div><Label className="text-xs">Pos después</Label><Input type="number" value={draft.positionAfter} onChange={e => setDraft({ ...draft, positionAfter: +e.target.value })} /></div>
          <div><Label className="text-xs">Vuelta</Label><Input type="number" value={draft.lap ?? 0} onChange={e => setDraft({ ...draft, lap: +e.target.value })} /></div>
          <div>
            <Label className="text-xs">Estado</Label>
            <select value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value as 'in' | 'out' })} className="flex h-10 w-full border border-input bg-background px-3 py-2 text-sm">
              <option value="in">Entrando</option>
              <option value="out">Saliendo</option>
            </select>
          </div>
        </div>
        <button onClick={submit} className="px-4 py-2 text-xs font-bold uppercase bg-primary text-primary-foreground hover:opacity-80">
          Agregar evento
        </button>
      </div>

      <div className="p-4 border border-border bg-card space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold tracking-wider text-primary uppercase">Eventos recientes</h3>
          <button onClick={() => setPitEvents([])} className="text-xs text-muted-foreground hover:text-foreground">
            Limpiar
          </button>
        </div>
        <div className="max-h-[280px] overflow-y-auto space-y-1 text-xs">
          {pitEvents.map((e, i) => (
            <div key={e.id} className="grid grid-cols-[50px_1fr_70px_70px_30px] gap-2 items-center px-2 py-1.5 bg-muted/30">
              <span className="font-bold text-accent">#{e.carNumber}</span>
              <span className="truncate">{e.driverName} · <span className="text-muted-foreground">{e.team}</span></span>
              <span className="font-mono">{e.pitTime}</span>
              <span className="font-bold">{e.status === 'in' ? 'IN' : `→ P${e.positionAfter}`}</span>
              <button onClick={() => setPitEvents(pitEvents.filter((_, idx) => idx !== i))} className="text-rally-red hover:opacity-70">✕</button>
            </div>
          ))}
          {pitEvents.length === 0 && <p className="text-xs text-muted-foreground">Sin eventos.</p>}
        </div>
        <GraphicControl
          label="Tracker de Pits"
          graphicId={'pitTracker' as any}
          onTake={() => onTake('pitTracker', { events: pitEvents, title: 'PITS LANE' })}
          onClear={() => onClear('pitTracker')}
          isLive={liveGraphics.has('pitTracker')}
        />
      </div>
    </div>
  );
};

export default PitsTab;
