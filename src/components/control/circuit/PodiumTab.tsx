import { useCircuitStore } from '@/store/circuitStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GraphicControl from '@/components/control/GraphicControl';
import CircuitEntryPicker from './CircuitEntryPicker';
import type { FinalResultEntry } from '@/types/circuit';

interface Props {
  onTake: (id: string, data: any) => void;
  onClear: (id: string) => void;
  liveGraphics: Set<string>;
}

const PodiumTab = ({ onTake, onClear, liveGraphics }: Props) => {
  const { podium, setPodium, finalResults, setFinalResults, event, entries, categories, selectedCategory, setSelectedCategory } = useCircuitStore();

  const filteredResults = selectedCategory
    ? { ...finalResults, results: finalResults.results.filter(r => entries.some(e => e.carNumber === r.carNumber && e.category === selectedCategory)) }
    : finalResults;

  const updateFinal = (i: number, patch: Partial<FinalResultEntry>) => {
    const next = [...finalResults.results];
    next[i] = { ...next[i], ...patch };
    setFinalResults({ results: next });
  };

  const updatePodium = (pos: 1 | 2 | 3, patch: any) => {
    const next = podium.podium.map(p => p.position === pos ? { ...p, ...patch } : p);
    setPodium({ podium: next });
  };

  return (
    <div className="space-y-4">
      <div className="p-4 border border-border bg-card space-y-3">
        <h3 className="text-sm font-bold tracking-wider text-primary uppercase">Podio</h3>
        <div className="grid grid-cols-3 gap-3">
          <div><Label className="text-xs">Serie</Label><Input value={podium.series} onChange={e => setPodium({ series: e.target.value })} /></div>
          <div className="col-span-2"><Label className="text-xs">Carrera</Label><Input value={podium.raceName} onChange={e => setPodium({ raceName: e.target.value })} /></div>
        </div>
        {podium.podium.map(p => (
          <div key={p.position} className="border border-border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-accent uppercase tracking-wider text-sm">P{p.position}</span>
              <div className="w-[260px]">
                <CircuitEntryPicker
                  label=""
                  onPick={(e) => updatePodium(p.position, {
                    carNumber: e.carNumber,
                    driverName: e.driverName,
                    team: e.team,
                    country: e.country,
                  })}
                />
              </div>
            </div>
            <div className="grid grid-cols-5 gap-2">
              <div><Label className="text-xs">Nº</Label><Input value={p.carNumber} onChange={e => updatePodium(p.position, { carNumber: e.target.value })} /></div>
              <div><Label className="text-xs">Piloto</Label><Input value={p.driverName} onChange={e => updatePodium(p.position, { driverName: e.target.value })} /></div>
              <div><Label className="text-xs">País</Label><Input value={p.country} onChange={e => updatePodium(p.position, { country: e.target.value })} /></div>
              <div><Label className="text-xs">Equipo</Label><Input value={p.team} onChange={e => updatePodium(p.position, { team: e.target.value })} /></div>
              <div><Label className="text-xs">Tiempo</Label><Input value={p.totalTime} onChange={e => updatePodium(p.position, { totalTime: e.target.value })} /></div>
            </div>
          </div>
        ))}
        <GraphicControl
          label="Podio"
          graphicId={'podium' as any}
          onTake={() => onTake('podium', podium)}
          onClear={() => onClear('podium')}
          isLive={liveGraphics.has('podium')}
        />
      </div>

      <div className="p-4 border border-border bg-card space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-sm font-bold tracking-wider text-primary uppercase">Resultados finales</h3>
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

        <div className="grid grid-cols-3 gap-3">
          <div><Label className="text-xs">Serie</Label><Input value={finalResults.series} onChange={e => setFinalResults({ series: e.target.value })} /></div>
          <div><Label className="text-xs">Carrera</Label><Input value={finalResults.raceName} onChange={e => setFinalResults({ raceName: e.target.value })} /></div>
          <div><Label className="text-xs">Total vueltas</Label><Input type="number" value={finalResults.totalLaps} onChange={e => setFinalResults({ totalLaps: +e.target.value })} /></div>
        </div>
        <div className="grid grid-cols-[40px_50px_1fr_1fr_60px_100px_90px_60px] gap-1 text-[10px] uppercase tracking-wider text-muted-foreground px-1">
          <span>POS</span><span>Nº</span><span>Piloto</span><span>Equipo</span><span>Vts</span><span>Tiempo</span><span>Mejor</span><span>Estado</span>
        </div>
        <div className="max-h-[320px] overflow-y-auto space-y-1">
          {filteredResults.results.map((r, i) => (
            <div key={i} className="grid grid-cols-[40px_50px_1fr_1fr_60px_100px_90px_60px] gap-1 items-center text-xs">
              <Input className="h-7 text-xs" value={r.position} onChange={e => updateFinal(i, { position: +e.target.value })} />
              <Input className="h-7 text-xs" value={r.carNumber} onChange={e => updateFinal(i, { carNumber: e.target.value })} />
              <Input className="h-7 text-xs" value={r.driverName} onChange={e => updateFinal(i, { driverName: e.target.value })} />
              <Input className="h-7 text-xs" value={r.team} onChange={e => updateFinal(i, { team: e.target.value })} />
              <Input className="h-7 text-xs" type="number" value={r.laps} onChange={e => updateFinal(i, { laps: +e.target.value })} />
              <Input className="h-7 text-xs font-mono" value={r.totalTime} onChange={e => updateFinal(i, { totalTime: e.target.value })} />
              <Input className="h-7 text-xs font-mono" value={r.bestLap} onChange={e => updateFinal(i, { bestLap: e.target.value })} />
              <select value={r.status ?? 'finished'} onChange={e => updateFinal(i, { status: e.target.value as any })} className="h-7 text-[10px] border border-input bg-background">
                <option value="finished">FIN</option>
                <option value="dnf">DNF</option>
                <option value="dsq">DSQ</option>
              </select>
            </div>
          ))}
        </div>
        <GraphicControl
          label="Resultados Finales"
          graphicId={'finalResults' as any}
          onTake={() => onTake('finalResults', filteredResults)}
          onClear={() => onClear('finalResults')}
          isLive={liveGraphics.has('finalResults')}
        />
      </div>
    </div>
  );
};

export default PodiumTab;
