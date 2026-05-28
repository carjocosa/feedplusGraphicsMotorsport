import { useRallyStore } from '@/store/rallyStore';
import { useCircuitStore } from '@/store/circuitStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { SessionKind } from '@/types/circuit';

const SESSIONS: SessionKind[] = ['practice', 'qualifying', 'race', 'sprint', 'feature'];

const EventInfoTab = () => {
  const { event, setEvent, rallyIntro, setRallyIntro, addStage, updateStage, removeStage } = useRallyStore();
  const circuit = useCircuitStore();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Rally event */}
      <div className="space-y-4 p-4 border border-border bg-card">
        <h3 className="text-sm font-bold tracking-wider text-primary uppercase">🏔 Evento Rally</h3>
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-xs">Nombre del Rally</Label><Input value={rallyIntro.eventName} onChange={e => { setRallyIntro({ eventName: e.target.value }); setEvent({ eventName: e.target.value }); }} /></div>
          <div><Label className="text-xs">Edición</Label><Input value={rallyIntro.edition ?? ''} onChange={e => setRallyIntro({ edition: e.target.value })} /></div>
          <div><Label className="text-xs">Localidad</Label><Input value={rallyIntro.location} onChange={e => setRallyIntro({ location: e.target.value })} /></div>
          <div><Label className="text-xs">Fechas</Label><Input value={rallyIntro.dates} onChange={e => setRallyIntro({ dates: e.target.value })} /></div>
          <div><Label className="text-xs">Distancia total</Label><Input value={rallyIntro.totalDistance} onChange={e => setRallyIntro({ totalDistance: e.target.value })} /></div>
          <div><Label className="text-xs">Superficie</Label><Input value={rallyIntro.surface} onChange={e => setRallyIntro({ surface: e.target.value })} /></div>
          <div className="col-span-2"><Label className="text-xs">Headline</Label><Input value={rallyIntro.headline ?? ''} onChange={e => setRallyIntro({ headline: e.target.value })} /></div>
          <div><Label className="text-xs">SS actual #</Label><Input type="number" value={event.stageNumber} onChange={e => setEvent({ stageNumber: +e.target.value })} /></div>
          <div><Label className="text-xs">Nombre SS actual</Label><Input value={event.stageName} onChange={e => setEvent({ stageName: e.target.value })} /></div>
        </div>

        <div className="border-t border-border pt-3">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Etapas ({rallyIntro.stages.length})</Label>
            <button
              onClick={() => addStage({ stageNumber: rallyIntro.stages.length + 1, stageName: 'Nueva SS', distance: '0 km', surface: 'gravel' })}
              className="px-2 py-1 text-[10px] bg-primary text-primary-foreground hover:opacity-80"
            >+ SS</button>
          </div>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {rallyIntro.stages.map((s, i) => (
              <div key={i} className="grid grid-cols-[40px_1fr_80px_70px_60px_30px] gap-1 items-center">
                <Input className="h-7 text-xs" type="number" value={s.stageNumber} onChange={e => updateStage(i, { stageNumber: +e.target.value })} />
                <Input className="h-7 text-xs" value={s.stageName} onChange={e => updateStage(i, { stageName: e.target.value })} />
                <Input className="h-7 text-xs" placeholder="km" value={s.distance} onChange={e => updateStage(i, { distance: e.target.value })} />
                <Input className="h-7 text-xs" placeholder="08:30" value={s.startTime ?? ''} onChange={e => updateStage(i, { startTime: e.target.value })} />
                <select className="h-7 text-xs border border-input bg-background text-foreground px-1" value={s.surface} onChange={e => updateStage(i, { surface: e.target.value as any })}>
                  <option value="gravel">tierra</option><option value="asphalt">asfalto</option><option value="snow">nieve</option>
                </select>
                <button onClick={() => removeStage(i)} className="text-rally-red hover:opacity-70 text-xs">✕</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Circuit event */}
      <div className="space-y-4 p-4 border border-border bg-card">
        <h3 className="text-sm font-bold tracking-wider text-primary uppercase">🏁 Evento Circuito</h3>
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-xs">Serie</Label><Input value={circuit.event.series} onChange={e => circuit.setEvent({ series: e.target.value })} /></div>
          <div><Label className="text-xs">Ronda / Fecha</Label><Input value={circuit.event.round} onChange={e => circuit.setEvent({ round: e.target.value })} /></div>
          <div className="col-span-2"><Label className="text-xs">Circuito</Label><Input value={circuit.event.circuit} onChange={e => circuit.setEvent({ circuit: e.target.value })} /></div>
          <div>
            <Label className="text-xs">Tipo de sesión</Label>
            <select
              className="flex h-10 w-full border border-input bg-background px-2 text-sm text-foreground"
              value={circuit.event.sessionType}
              onChange={e => circuit.setEvent({ sessionType: e.target.value as SessionKind })}
            >
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div><Label className="text-xs">Vueltas totales</Label><Input type="number" value={circuit.event.totalLaps} onChange={e => circuit.setEvent({ totalLaps: +e.target.value })} /></div>
          <div><Label className="text-xs">Vuelta actual</Label><Input type="number" value={circuit.event.currentLap} onChange={e => circuit.setEvent({ currentLap: +e.target.value })} /></div>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Estos datos se usan en Scorebug, Live Timing, Podio y Resultados Finales.
        </p>
      </div>
    </div>
  );
};

export default EventInfoTab;
