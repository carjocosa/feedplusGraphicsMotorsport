import { useCircuitStore } from '@/store/circuitStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GraphicControl from '@/components/control/GraphicControl';
import type { FlagKind } from '@/types/circuit';

interface Props {
  onTake: (id: string, data: any) => void;
  onClear: (id: string) => void;
  liveGraphics: Set<string>;
}

const FLAGS: { kind: FlagKind; label: string; color: string }[] = [
  { kind: 'green',     label: 'Verde',         color: '#16A34A' },
  { kind: 'yellow',    label: 'Amarilla',      color: '#FACC15' },
  { kind: 'red',       label: 'Roja',          color: '#DC2626' },
  { kind: 'blue',      label: 'Azul',          color: '#2563EB' },
  { kind: 'white',     label: 'Blanca',        color: '#F8FAFC' },
  { kind: 'checkered', label: 'A cuadros',     color: '#000000' },
  { kind: 'safetycar', label: 'Safety Car',    color: '#FACC15' },
  { kind: 'vsc',       label: 'VSC',           color: '#FACC15' },
];

const FlagsTab = ({ onTake, onClear, liveGraphics }: Props) => {
  const { raceFlag, setRaceFlag, event } = useCircuitStore();

  return (
    <div className="space-y-4">
      <div className="p-4 border border-border bg-card space-y-4">
        <h3 className="text-sm font-bold tracking-wider text-primary uppercase">Bandera de carrera</h3>

        <div className="grid grid-cols-4 gap-2">
          {FLAGS.map(f => (
            <button
              key={f.kind}
              onClick={() => setRaceFlag({ flag: f.kind })}
              className={`px-3 py-4 text-xs font-bold uppercase tracking-wider border-2 transition-all ${
                raceFlag.flag === f.kind ? 'border-primary scale-[1.02]' : 'border-border hover:border-muted-foreground'
              }`}
              style={{
                background: f.kind === 'checkered'
                  ? 'repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) 50% / 16px 16px'
                  : f.color,
                color: f.kind === 'white' || f.kind === 'yellow' || f.kind === 'safetycar' || f.kind === 'vsc' ? '#000' : '#fff',
                textShadow: f.kind === 'checkered' ? '0 0 4px #000' : 'none',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Mensaje opcional</Label>
          <Input
            value={raceFlag.message ?? ''}
            onChange={e => setRaceFlag({ message: e.target.value })}
            placeholder="Ej: Sector 2 - incidente entre #7 y #12"
          />
        </div>

        <GraphicControl
          label={`Bandera ${raceFlag.flag.toUpperCase()}`}
          graphicId={'raceFlag' as any}
          onTake={() => onTake('raceFlag', { ...raceFlag, series: event.series, round: event.round })}
          onClear={() => onClear('raceFlag')}
          isLive={liveGraphics.has('raceFlag')}
        />
      </div>
    </div>
  );
};

export default FlagsTab;
