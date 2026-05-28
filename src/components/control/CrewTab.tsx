import { useRallyStore } from '@/store/rallyStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import GraphicControl from './GraphicControl';
import EntryPicker from './EntryPicker';
import type { GraphicType } from '@/types/rally';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, X } from 'lucide-react';

interface Props {
  onTake: (id: GraphicType, data: any) => void;
  onClear: (id: GraphicType) => void;
  liveGraphics: Set<string>;
}

const CrewTab = ({ onTake, onClear, liveGraphics }: Props) => {
  const {
    crew, setCrew, vsData, setVsLeft, setVsRight,
    crewSlots, setCrewSlot, addCrewSlot, removeCrewSlot,
    stage, setStage, interview, setInterview,
    entries, selectedEntryId, selectEntry,
    settings, setSettings,
  } = useRallyStore();

  const isLive = liveGraphics.has('crewLowerThird');
  const isVsLive = liveGraphics.has('vsLowerThird');
  const selectedEntry = entries.find(e => e.id === selectedEntryId) || null;

  return (
    <div className="space-y-6">
      {/* Layout selector */}
      <div className="p-4 border border-border bg-card">
        <h3 className="text-sm font-bold tracking-wider text-primary uppercase mb-3">Lower Third Layout</h3>
        <div className="grid grid-cols-2 gap-2">
          {(['vertical', 'horizontal'] as const).map(l => (
            <button
              key={l}
              onClick={() => setSettings({ lowerThirdLayout: l })}
              className={`px-3 py-3 text-xs uppercase font-bold tracking-wider border transition-colors rounded-md ${
                settings.lowerThirdLayout === l ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted'
              }`}
            >
              {l === 'vertical' ? '📐 Torre (Vertical)' : '↔️ Horizontal'}
            </button>
          ))}
        </div>
      </div>

      {/* Crew Lower Third */}
      <div className="space-y-3 p-4 border border-border bg-card">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold tracking-wider text-primary uppercase">Crew Lower Third</h3>
          {selectedEntry ? (
            <Badge variant="outline" className="font-rajdhani tracking-wider">
              INSCRITO #{selectedEntry.carNumber}
            </Badge>
          ) : (
            <Badge variant="secondary" className="font-rajdhani tracking-wider">MANUAL</Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Cargar inscrito</Label>
            <select
              value={selectedEntryId ?? '__manual__'}
              onChange={e => selectEntry(e.target.value === '__manual__' ? null : e.target.value)}
              className="flex h-10 w-full border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="__manual__">— Manual —</option>
              {entries.map(e => (
                <option key={e.id} value={e.id}>#{e.carNumber} · {e.driverName}</option>
              ))}
            </select>
          </div>
          <div>
            <EntryPicker
              entries={entries}
              label="Buscar"
              onPick={(e) => selectEntry(e.id)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-xs text-muted-foreground">Driver</Label><Input value={crew.driverName} onChange={e => setCrew({ driverName: e.target.value })} /></div>
          <div><Label className="text-xs text-muted-foreground">Co-Driver</Label><Input value={crew.coDriverName} onChange={e => setCrew({ coDriverName: e.target.value })} /></div>
          <div><Label className="text-xs text-muted-foreground">Driver Flag</Label><Input value={crew.driverCountry} onChange={e => setCrew({ driverCountry: e.target.value })} /></div>
          <div><Label className="text-xs text-muted-foreground">Co-Driver Flag</Label><Input value={crew.coDriverCountry} onChange={e => setCrew({ coDriverCountry: e.target.value })} /></div>
          <div><Label className="text-xs text-muted-foreground">Team</Label><Input value={crew.team} onChange={e => setCrew({ team: e.target.value })} /></div>
          <div><Label className="text-xs text-muted-foreground">Car</Label><Input value={crew.car} onChange={e => setCrew({ car: e.target.value })} /></div>
          <div><Label className="text-xs text-muted-foreground">Car #</Label><Input value={crew.carNumber} onChange={e => setCrew({ carNumber: e.target.value })} /></div>
        </div>
        <GraphicControl label="Crew Card" graphicId="crewLowerThird" onTake={() => onTake('crewLowerThird', crew)} onClear={onClear} isLive={isLive} />
      </div>

      {/* VS Lower Third */}
      <div className="space-y-3 p-4 border border-border bg-card">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold tracking-wider text-primary uppercase">VS Lower Third</h3>
          <Badge variant="outline" className="font-rajdhani tracking-wider text-xs">HEAD TO HEAD</Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Left side */}
          <div className="space-y-2 p-3 border border-rally-red/30 rounded-lg bg-rally-red/5">
            <Label className="text-xs font-bold text-rally-red uppercase">Izquierda</Label>
            <EntryPicker
              entries={entries}
              label="Seleccionar"
              onPick={(e) => setVsLeft({ name: e.driverName, country: e.driverCountry, team: e.team, car: e.car, carNumber: e.carNumber })}
            />
            <div><Label className="text-[10px] text-muted-foreground">Nombre</Label><Input className="h-7 text-xs" value={vsData.left.name} onChange={e => setVsLeft({ name: e.target.value })} /></div>
            <div><Label className="text-[10px] text-muted-foreground">País</Label><Input className="h-7 text-xs" value={vsData.left.country} onChange={e => setVsLeft({ country: e.target.value })} /></div>
            <div><Label className="text-[10px] text-muted-foreground">Equipo</Label><Input className="h-7 text-xs" value={vsData.left.team} onChange={e => setVsLeft({ team: e.target.value })} /></div>
            <div><Label className="text-[10px] text-muted-foreground">Auto</Label><Input className="h-7 text-xs" value={vsData.left.car} onChange={e => setVsLeft({ car: e.target.value })} /></div>
            <div><Label className="text-[10px] text-muted-foreground">Nº</Label><Input className="h-7 text-xs" value={vsData.left.carNumber} onChange={e => setVsLeft({ carNumber: e.target.value })} /></div>
          </div>

          {/* Right side */}
          <div className="space-y-2 p-3 border border-blue-500/30 rounded-lg bg-blue-500/5">
            <Label className="text-xs font-bold text-blue-400 uppercase">Derecha</Label>
            <EntryPicker
              entries={entries}
              label="Seleccionar"
              onPick={(e) => setVsRight({ name: e.driverName, country: e.driverCountry, team: e.team, car: e.car, carNumber: e.carNumber })}
            />
            <div><Label className="text-[10px] text-muted-foreground">Nombre</Label><Input className="h-7 text-xs" value={vsData.right.name} onChange={e => setVsRight({ name: e.target.value })} /></div>
            <div><Label className="text-[10px] text-muted-foreground">País</Label><Input className="h-7 text-xs" value={vsData.right.country} onChange={e => setVsRight({ country: e.target.value })} /></div>
            <div><Label className="text-[10px] text-muted-foreground">Equipo</Label><Input className="h-7 text-xs" value={vsData.right.team} onChange={e => setVsRight({ team: e.target.value })} /></div>
            <div><Label className="text-[10px] text-muted-foreground">Auto</Label><Input className="h-7 text-xs" value={vsData.right.car} onChange={e => setVsRight({ car: e.target.value })} /></div>
            <div><Label className="text-[10px] text-muted-foreground">Nº</Label><Input className="h-7 text-xs" value={vsData.right.carNumber} onChange={e => setVsRight({ carNumber: e.target.value })} /></div>
          </div>
        </div>

        <GraphicControl label="VS" graphicId="vsLowerThird" onTake={() => onTake('vsLowerThird', vsData)} onClear={onClear} isLive={isVsLive} />
      </div>

      {/* Multi Crew Slots */}
      <div className="space-y-3 p-4 border border-border bg-card">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold tracking-wider text-primary uppercase">Multi Crew Slots ({crewSlots.length})</h3>
          <button onClick={addCrewSlot} className="flex items-center gap-1 px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:opacity-80">
            <Plus className="w-3 h-3" /> Agregar
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground">Cada slot es un lower third independiente. Editá y usá TAKE para enviar cada uno.</p>

        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {crewSlots.map((slot, i) => (
            <div key={i} className="p-3 border border-border bg-muted/30 rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-primary uppercase">Slot {i + 1}</span>
                {crewSlots.length > 1 && (
                  <button onClick={() => removeCrewSlot(i)} className="p-1 text-rally-red hover:opacity-70"><X className="w-3 h-3" /></button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-[10px] text-muted-foreground">Driver</Label><Input className="h-7 text-xs" value={slot.data.driverName} onChange={e => setCrewSlot(i, { ...slot, data: { ...slot.data, driverName: e.target.value } })} /></div>
                <div><Label className="text-[10px] text-muted-foreground">Co-Driver</Label><Input className="h-7 text-xs" value={slot.data.coDriverName} onChange={e => setCrewSlot(i, { ...slot, data: { ...slot.data, coDriverName: e.target.value } })} /></div>
                <div><Label className="text-[10px] text-muted-foreground">Car #</Label><Input className="h-7 text-xs" value={slot.data.carNumber} onChange={e => setCrewSlot(i, { ...slot, data: { ...slot.data, carNumber: e.target.value } })} /></div>
                <div><Label className="text-[10px] text-muted-foreground">Team</Label><Input className="h-7 text-xs" value={slot.data.team} onChange={e => setCrewSlot(i, { ...slot, data: { ...slot.data, team: e.target.value } })} /></div>
              </div>
              <div className="mt-2">
                <GraphicControl label={`Slot ${i + 1}`} graphicId="crewLowerThird" onTake={() => onTake('crewLowerThird', slot.data)} onClear={onClear} isLive={isLive} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stage Lower Third */}
      <div className="space-y-3 p-4 border border-border bg-card">
        <h3 className="text-sm font-bold tracking-wider text-primary uppercase">Stage Identifier</h3>
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-xs text-muted-foreground">Stage #</Label><Input type="number" value={stage.stageNumber} onChange={e => setStage({ stageNumber: +e.target.value })} /></div>
          <div><Label className="text-xs text-muted-foreground">Stage Name</Label><Input value={stage.stageName} onChange={e => setStage({ stageName: e.target.value })} /></div>
          <div><Label className="text-xs text-muted-foreground">Distance</Label><Input value={stage.distance} onChange={e => setStage({ distance: e.target.value })} /></div>
          <div>
            <Label className="text-xs text-muted-foreground">Surface</Label>
            <select value={stage.surface} onChange={e => setStage({ surface: e.target.value as any })} className="flex h-10 w-full border border-input bg-background px-3 py-2 text-sm">
              <option value="gravel">Gravel</option>
              <option value="asphalt">Asphalt</option>
              <option value="snow">Snow</option>
            </select>
          </div>
        </div>
        <GraphicControl label="Stage ID" graphicId="stageLowerThird" onTake={() => onTake('stageLowerThird', stage)} onClear={onClear} isLive={liveGraphics.has('stageLowerThird')} />
      </div>

      {/* Interview Lower Third */}
      <div className="space-y-3 p-4 border border-border bg-card">
        <h3 className="text-sm font-bold tracking-wider text-primary uppercase">Interview</h3>
        <EntryPicker
          entries={entries}
          label="Autocompletar entrevistado"
          onPick={(e) => setInterview({ name: e.driverName, role: `Piloto · ${e.team}` })}
        />
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-xs text-muted-foreground">Name</Label><Input value={interview.name} onChange={e => setInterview({ name: e.target.value })} /></div>
          <div><Label className="text-xs text-muted-foreground">Role</Label><Input value={interview.role} onChange={e => setInterview({ role: e.target.value })} /></div>
        </div>
        <GraphicControl label="Interview" graphicId="interviewLowerThird" onTake={() => onTake('interviewLowerThird', interview)} onClear={onClear} isLive={liveGraphics.has('interviewLowerThird')} />
      </div>
    </div>
  );
};

export default CrewTab;
