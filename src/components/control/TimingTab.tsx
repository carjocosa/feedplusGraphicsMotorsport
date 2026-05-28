import { useRallyStore } from '@/store/rallyStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GraphicControl from './GraphicControl';
import EntryPicker from './EntryPicker';
import RallyTimingSyncPanel from './RallyTimingSyncPanel';
import type { GraphicType, TimingEntry, Entry, BroadcastMessage } from '@/types/rally';
import { useState, useEffect, useRef } from 'react';

interface Props {
  onTake: (id: GraphicType, data: any) => void;
  onClear: (id: GraphicType) => void;
  liveGraphics: Set<string>;
  sendBroadcast?: (msg: BroadcastMessage) => void;
}

const TimingTab = ({ onTake, onClear, liveGraphics, sendBroadcast }: Props) => {
  const { stageResults, setStageResults, overallStandings, setOverallStandings, headToHead, setHeadToHead, startList, entries, settings, setSettings } = useRallyStore();
  const [csvText, setCsvText] = useState('');
  const [autoCycleSec, setAutoCycleSec] = useState(0);
  const [autoCycleTarget, setAutoCycleTarget] = useState<'stageResults' | 'overallStandings' | 'entriesList'>('stageResults');
  const autoCycleRef = useRef<number | null>(null);

  const autoCycleData = autoCycleTarget === 'stageResults' ? stageResults : autoCycleTarget === 'overallStandings' ? overallStandings : entries;
  const pageSize = settings.displayPageSize ?? 15;
  const totalPages = Math.ceil(autoCycleData.length / pageSize);

  useEffect(() => {
    if (!autoCycleSec || totalPages <= 1) {
      if (autoCycleRef.current) { window.clearInterval(autoCycleRef.current); autoCycleRef.current = null; }
      return;
    }
    autoCycleRef.current = window.setInterval(() => {
      setSettings(prev => {
        const next = ((prev.displayPageOffset ?? 0) + 1) % totalPages;
        if (sendBroadcast) sendBroadcast({ type: 'PAGE_CHANGE', pageOffset: next });
        return { ...prev, displayPageOffset: next };
      });
    }, autoCycleSec * 1000);
    return () => { if (autoCycleRef.current) window.clearInterval(autoCycleRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoCycleSec, totalPages]);

  const pageNav = (target: 'stageResults' | 'overallStandings' | 'entriesList') => {
    const data = target === 'stageResults' ? stageResults : target === 'overallStandings' ? overallStandings : entries;
    const tp = Math.ceil(data.length / pageSize);
    if (tp <= 1) return null;
    const currentOffset = settings.displayPageOffset ?? 0;
    return (
      <div className="flex items-center gap-2 mt-2">
        <button
          onClick={() => {
            const next = Math.max(0, currentOffset - 1);
            if (sendBroadcast) sendBroadcast({ type: 'PAGE_CHANGE', pageOffset: next });
          }}
          disabled={currentOffset === 0}
          className="px-3 py-1 text-xs font-bold border border-border rounded disabled:opacity-30 hover:bg-muted"
        >
          ←
        </button>
        <span className="text-sm font-mono text-foreground">
          {currentOffset + 1} / {tp}
        </span>
        <button
          onClick={() => {
            const next = Math.min(tp - 1, currentOffset + 1);
            if (sendBroadcast) sendBroadcast({ type: 'PAGE_CHANGE', pageOffset: next });
          }}
          disabled={currentOffset >= tp - 1}
          className="px-3 py-1 text-xs font-bold border border-border rounded disabled:opacity-30 hover:bg-muted"
        >
          →
        </button>
      </div>
    );
  };

  const importCSV = () => {
    try {
      const lines = csvText.trim().split('\n');
      const entries: TimingEntry[] = lines.map((line, i) => {
        const parts = line.split(',').map(s => s.trim());
        return {
          position: i + 1,
          carNumber: parts[0] || '',
          driverName: parts[1] || '',
          coDriverName: parts[2] || '',
          time: parts[3] || '',
          diff: parts[4] || '',
        };
      });
      setStageResults(entries);
    } catch (e) {
      console.error('CSV parse error', e);
    }
  };

  return (
    <div className="space-y-6">
      <RallyTimingSyncPanel />

      {/* Auto-cycle controls */}
      <div className="p-4 border border-border bg-card space-y-3">
        <h3 className="text-sm font-bold tracking-wider text-primary uppercase">Auto-cycle de páginas</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Target</Label>
            <select
              value={autoCycleTarget}
              onChange={e => setAutoCycleTarget(e.target.value as 'stageResults' | 'overallStandings' | 'entriesList')}
              className="flex h-8 border border-input bg-background px-2 text-xs"
            >
              <option value="stageResults">Stage Results</option>
              <option value="overallStandings">Overall</option>
              <option value="entriesList">Entries</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Interval (s)</Label>
            <Input
              type="number"
              min={0}
              value={autoCycleSec}
              onChange={e => setAutoCycleSec(+e.target.value)}
              className="h-8 w-20 text-xs"
            />
          </div>
          {autoCycleSec > 0 && totalPages > 1 && (
            <span className="text-[11px] text-emerald-400 font-bold">
              ▶ Cycling 1-{totalPages} every {autoCycleSec}s
            </span>
          )}
        </div>
      </div>

      {/* Stage Results */}
      <div className="space-y-3 p-4 border border-border bg-card">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold tracking-wider text-primary uppercase">Stage Results</h3>
          <div className="w-[300px]">
            <EntryPicker<Entry>
              entries={entries}
              label=""
              onPick={(e) => {
                const next: TimingEntry = {
                  position: stageResults.length + 1,
                  carNumber: e.carNumber,
                  driverName: e.driverName,
                  coDriverName: e.coDriverName,
                  time: '',
                  diff: '',
                };
                setStageResults([...stageResults, next]);
              }}
            />
          </div>
        </div>
        <div className="max-h-[300px] overflow-y-auto space-y-1">
          {stageResults.map((entry, i) => (
            <div key={i} className="grid grid-cols-6 gap-1 text-xs">
              <span className="text-muted-foreground text-center">P{entry.position}</span>
              <Input className="h-7 text-xs" value={entry.carNumber} onChange={e => {
                const updated = [...stageResults];
                updated[i] = { ...updated[i], carNumber: e.target.value };
                setStageResults(updated);
              }} />
              <Input className="h-7 text-xs col-span-2" value={entry.driverName} onChange={e => {
                const updated = [...stageResults];
                updated[i] = { ...updated[i], driverName: e.target.value };
                setStageResults(updated);
              }} />
              <Input className="h-7 text-xs" value={entry.time} onChange={e => {
                const updated = [...stageResults];
                updated[i] = { ...updated[i], time: e.target.value };
                setStageResults(updated);
              }} />
              <Input className="h-7 text-xs" value={entry.diff} onChange={e => {
                const updated = [...stageResults];
                updated[i] = { ...updated[i], diff: e.target.value };
                setStageResults(updated);
              }} />
            </div>
          ))}
        </div>
        {pageNav('stageResults')}
        {/* CSV Import */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Import CSV (car#, driver, codriver, time, diff)</Label>
          <textarea
            className="w-full h-20 border border-input bg-background px-2 py-1 text-xs font-mono"
            value={csvText}
            onChange={e => setCsvText(e.target.value)}
            placeholder="1, S. Ogier, V. Landais, 12:34.5,&#10;11, T. Neuville, M. Wydaeghe, 12:37.2, +2.7"
          />
          <button onClick={importCSV} className="px-3 py-1 text-xs bg-secondary text-secondary-foreground hover:bg-secondary/80">
            Import CSV
          </button>
        </div>
        <GraphicControl label="Stage Results" graphicId="stageResults" onTake={() => onTake('stageResults', stageResults)} onClear={onClear} isLive={liveGraphics.has('stageResults')} />
      </div>

      {/* Overall Standings */}
      <div className="space-y-3 p-4 border border-border bg-card">
        <h3 className="text-sm font-bold tracking-wider text-primary uppercase">Overall Standings</h3>
        <p className="text-xs text-muted-foreground">Calculado automáticamente sumando los tiempos de todas las etapas.</p>
        {overallStandings.length > 0 && (
          <div className="max-h-[300px] overflow-y-auto space-y-1">
            {overallStandings.map((entry, i) => (
              <div key={i} className="grid grid-cols-6 gap-1 text-xs">
                <span className="text-muted-foreground text-center">P{entry.position}</span>
                <span className="font-mono">{entry.carNumber}</span>
                <span className="col-span-2 truncate">{entry.driverName}{entry.coDriverName && <span className="text-muted-foreground"> / {entry.coDriverName}</span>}</span>
                <span className="font-mono">{entry.time}</span>
                <span className="font-mono text-rally-red">{entry.diff || 'LEADER'}</span>
              </div>
            ))}
          </div>
        )}
        {pageNav('overallStandings')}
        <GraphicControl label="Overall Standings" graphicId="overallStandings" onTake={() => onTake('overallStandings', overallStandings)} onClear={onClear} isLive={liveGraphics.has('overallStandings')} />
      </div>

      {/* Head to Head */}
      <div className="space-y-3 p-4 border border-border bg-card">
        <h3 className="text-sm font-bold tracking-wider text-primary uppercase">Head to Head</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <EntryPicker<Entry>
              entries={entries}
              label="Autocompletar Driver 1"
              onPick={(e) =>
                setHeadToHead({
                  driver1: { name: `${e.driverName.split(' ').map(p => p[0]).slice(0, -1).join('. ')}. ${e.driverName.split(' ').slice(-1)[0]}`, country: e.driverCountry, time: headToHead.driver1.time, carNumber: e.carNumber },
                })
              }
            />
            <Label className="text-xs text-muted-foreground">Driver 1</Label>
            <Input value={headToHead.driver1.name} onChange={e => setHeadToHead({ driver1: { ...headToHead.driver1, name: e.target.value } })} />
          </div>
          <div className="space-y-1">
            <EntryPicker<Entry>
              entries={entries}
              label="Autocompletar Driver 2"
              onPick={(e) =>
                setHeadToHead({
                  driver2: { name: `${e.driverName.split(' ').map(p => p[0]).slice(0, -1).join('. ')}. ${e.driverName.split(' ').slice(-1)[0]}`, country: e.driverCountry, time: headToHead.driver2.time, carNumber: e.carNumber },
                })
              }
            />
            <Label className="text-xs text-muted-foreground">Driver 2</Label>
            <Input value={headToHead.driver2.name} onChange={e => setHeadToHead({ driver2: { ...headToHead.driver2, name: e.target.value } })} />
          </div>
          <div><Label className="text-xs text-muted-foreground">Time 1</Label><Input value={headToHead.driver1.time} onChange={e => setHeadToHead({ driver1: { ...headToHead.driver1, time: e.target.value } })} /></div>
          <div><Label className="text-xs text-muted-foreground">Time 2</Label><Input value={headToHead.driver2.time} onChange={e => setHeadToHead({ driver2: { ...headToHead.driver2, time: e.target.value } })} /></div>
          <div><Label className="text-xs text-muted-foreground">Diff</Label><Input value={headToHead.diff} onChange={e => setHeadToHead({ diff: e.target.value })} /></div>
          <div>
            <Label className="text-xs text-muted-foreground">Leader</Label>
            <select value={headToHead.leader} onChange={e => setHeadToHead({ leader: +e.target.value as 1 | 2 })} className="flex h-10 w-full border border-input bg-background px-3 py-2 text-sm">
              <option value={1}>Driver 1</option>
              <option value={2}>Driver 2</option>
            </select>
          </div>
        </div>
        <GraphicControl label="Head to Head" graphicId="headToHead" onTake={() => onTake('headToHead', headToHead)} onClear={onClear} isLive={liveGraphics.has('headToHead')} />
      </div>

      {/* Start List */}
      <div className="space-y-3 p-4 border border-border bg-card">
        <h3 className="text-sm font-bold tracking-wider text-primary uppercase">Start List</h3>
        <GraphicControl label="Start List" graphicId="startList" onTake={() => onTake('startList', startList)} onClear={onClear} isLive={liveGraphics.has('startList')} />
      </div>

      {/* Entries List */}
      <div className="space-y-3 p-4 border border-border bg-card">
        <h3 className="text-sm font-bold tracking-wider text-primary uppercase">Entries List ({entries.length})</h3>
        <p className="text-xs text-muted-foreground">Presentación de todos los inscritos. Usá page size y ← → para navegar.</p>
        {pageNav('entriesList')}
        <GraphicControl label="Entries List" graphicId="entriesList" onTake={() => onTake('entriesList', entries)} onClear={onClear} isLive={liveGraphics.has('entriesList')} />
      </div>
    </div>
  );
};

export default TimingTab;
