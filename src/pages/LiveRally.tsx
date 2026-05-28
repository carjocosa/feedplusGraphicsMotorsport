import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { TimingEntry } from '@/types/rally';
import FeedLogo from '@/components/ui/FeedLogo';
import Footer from '@/components/ui/Footer';
import { fetchTiming } from '@/lib/timingScraper';

type FieldKey = 'position' | 'carNumber' | 'driverName' | 'coDriverName' | 'time' | 'diff';
type Mapping = Partial<Record<FieldKey, string>>;
type Target = 'stageResults' | 'overallStandings';

interface Preset {
  name: string;
  url: string;
  hint: string;
  intervalSec: number;
  mapping: Mapping;
  target: Target;
}

interface FeedConfig {
  url: string;
  hint: string;
  mapping: Mapping;
}

const PRESETS_KEY = 'rally-timing-presets';
const LIVE_KEY = 'rally-live-page';

const toNum = (v: any): number | null => {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  const s = String(v).trim().replace(',', '.').replace(/[^0-9.\-]/g, '');
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

const applyMapping = (raw: any, i: number, mapping: Mapping): TimingEntry => {
  const get = (t: FieldKey) => {
    const src = mapping[t];
    return src && raw[src] !== undefined && raw[src] !== '' ? raw[src] : raw[t];
  };
  const pos = toNum(get('position'));
  return {
    position: pos ?? i + 1,
    carNumber: String(get('carNumber') ?? ''),
    driverName: String(get('driverName') ?? ''),
    coDriverName: String(get('coDriverName') ?? ''),
    time: String(get('time') ?? raw.lastLap ?? raw.bestLap ?? ''),
    diff: String(get('diff') ?? raw.gap ?? ''),
  };
};

interface Saved {
  intervalSec: number;
  stagePresetName: string | null;
  overallPresetName: string | null;
  stage: FeedConfig;
  overall: FeedConfig;
}
const defaultSaved: Saved = {
  intervalSec: 15,
  stagePresetName: null,
  overallPresetName: null,
  stage: { url: '', hint: '', mapping: {} },
  overall: { url: '', hint: '', mapping: {} },
};

interface RowWithDelta extends TimingEntry {
  delta: number; // prev.position - position (positive = up)
  isNew: boolean;
}

const computeDeltas = (current: TimingEntry[], prev: Map<string, number>): RowWithDelta[] => {
  return current.map(r => {
    const key = r.carNumber || r.driverName;
    const prevPos = prev.get(key);
    const delta = prevPos === undefined ? 0 : prevPos - r.position;
    return { ...r, delta, isNew: prevPos === undefined };
  });
};

const positionMap = (rows: TimingEntry[]) => {
  const m = new Map<string, number>();
  rows.forEach(r => m.set(r.carNumber || r.driverName, r.position));
  return m;
};

const LiveRally = () => {
  useEffect(() => { document.title = 'Feed+ Motorsport — Live Timing  |  by Studio+'; }, []);
  const [searchParams] = useSearchParams();

  const presets: Preset[] = useMemo(() => {
    try { return JSON.parse(localStorage.getItem(PRESETS_KEY) || '[]'); } catch { return []; }
  }, []);

  const initial: Saved = (() => {
    try {
      const raw = localStorage.getItem(LIVE_KEY);
      if (raw) return { ...defaultSaved, ...JSON.parse(raw) };
    } catch { /* */ }
    return defaultSaved;
  })();

  const [intervalSec, setIntervalSec] = useState(
    Number(searchParams.get('interval')) || initial.intervalSec
  );
  const [stageCfg, setStageCfg] = useState<FeedConfig>(initial.stage);
  const [overallCfg, setOverallCfg] = useState<FeedConfig>(initial.overall);
  const [stagePresetName, setStagePresetName] = useState<string | null>(initial.stagePresetName);
  const [overallPresetName, setOverallPresetName] = useState<string | null>(initial.overallPresetName);

  const [running, setRunning] = useState(false);
  const [stageRows, setStageRows] = useState<RowWithDelta[]>([]);
  const [overallRows, setOverallRows] = useState<RowWithDelta[]>([]);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(true);
  const [eventName, setEventName] = useState(searchParams.get('event') || 'RALLY LIVE TIMING');

  const stagePrev = useRef<Map<string, number>>(new Map());
  const overallPrev = useRef<Map<string, number>>(new Map());
  const timerRef = useRef<number | null>(null);

  // persist
  useEffect(() => {
    const s: Saved = { intervalSec, stagePresetName, overallPresetName, stage: stageCfg, overall: overallCfg };
    localStorage.setItem(LIVE_KEY, JSON.stringify(s));
  }, [intervalSec, stagePresetName, overallPresetName, stageCfg, overallCfg]);

  const applyPreset = (which: 'stage' | 'overall', name: string) => {
    const p = presets.find(x => x.name === name);
    if (!p) return;
    const cfg: FeedConfig = { url: p.url, hint: p.hint, mapping: p.mapping || {} };
    if (which === 'stage') { setStagePresetName(name); setStageCfg(cfg); }
    else { setOverallPresetName(name); setOverallCfg(cfg); }
  };

  const fetchFeed = async (cfg: FeedConfig, _kind: 'stage' | 'overall'): Promise<TimingEntry[]> => {
    if (!cfg.url) return [];
    const rows = await fetchTiming(cfg.url);
    return rows.map((r, i) => applyMapping(r, i, cfg.mapping));
  };

  const refresh = async () => {
    setError(null);
    try {
      const tasks: Promise<any>[] = [];
      if (stageCfg.url) tasks.push(fetchFeed(stageCfg, 'stage')); else tasks.push(Promise.resolve(null));
      if (overallCfg.url) tasks.push(fetchFeed(overallCfg, 'overall')); else tasks.push(Promise.resolve(null));
      const [stage, overall] = await Promise.all(tasks);
      if (Array.isArray(stage)) {
        const sorted = [...stage].sort((a, b) => a.position - b.position);
        setStageRows(computeDeltas(sorted, stagePrev.current));
        stagePrev.current = positionMap(sorted);
      }
      if (Array.isArray(overall)) {
        const sorted = [...overall].sort((a, b) => a.position - b.position);
        setOverallRows(computeDeltas(sorted, overallPrev.current));
        overallPrev.current = positionMap(sorted);
      }
      setLastSync(new Date().toLocaleTimeString());
    } catch (e: any) {
      setError(e.message || String(e));
    }
  };

  useEffect(() => {
    if (!running) {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }
    refresh();
    timerRef.current = window.setInterval(refresh, Math.max(5, intervalSec) * 1000);
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, intervalSec, stageCfg.url, overallCfg.url]);

  const renderDelta = (delta: number, isNew: boolean) => {
    if (isNew) return <span className="text-[11px] font-bold tracking-wider" style={{ color: '#FFB800' }}>NEW</span>;
    if (delta > 0) return <span className="text-emerald-400 font-bold tabular-nums">▲ {delta}</span>;
    if (delta < 0) return <span className="font-bold tabular-nums" style={{ color: '#22C55E' }}>▼ {Math.abs(delta)}</span>;
    return <span className="text-muted-foreground">—</span>;
  };

  const renderTable = (title: string, rows: RowWithDelta[], colorTop = '#FF6B00') => (
    <div className="flex-1 min-w-0">
      <div className="h-[44px] flex items-center px-4" style={{ background: '#FF6B00' }}>
        <span className="text-white text-[18px] font-bold tracking-widest uppercase">{title}</span>
        <span className="ml-auto text-white/70 text-[11px] tracking-wider">{rows.length} crews</span>
      </div>
      <div className="border border-[#FF6B00]/30 border-t-0">
        <div className="grid grid-cols-[40px_50px_36px_1fr_120px_90px] gap-2 px-3 py-2 bg-secondary text-[11px] uppercase tracking-wider text-white/60 font-bold">
          <span>Pos</span><span>Δ</span><span>#</span><span>Crew</span><span className="text-right">Time</span><span className="text-right">Diff</span>
        </div>
        <div className="divide-y divide-white/5">
          {rows.length === 0 && (
            <div className="px-3 py-6 text-center text-xs text-muted-foreground font-mono">
              {running ? 'Esperando datos…' : 'Iniciá AUTO para ver datos en vivo.'}
            </div>
          )}
          {rows.map((r, i) => (
            <div
              key={`${r.carNumber}-${i}`}
              className={`grid grid-cols-[40px_50px_36px_1fr_120px_90px] gap-2 px-3 py-2 items-center text-sm transition-colors ${
                r.delta !== 0 || r.isNew ? 'bg-[#FFB800]/5' : ''
              }`}
            >
              <span className="font-bold text-[16px] tabular-nums" style={{ color: i === 0 ? colorTop : '#fff' }}>
                {r.position}
              </span>
              <span className="text-xs">{renderDelta(r.delta, r.isNew)}</span>
              <span className="font-bold tabular-nums" style={{ color: '#FF6B00' }}>{r.carNumber}</span>
              <span className="text-white truncate leading-tight">
                <span className="font-semibold text-[14px]">{r.driverName}</span>
                {r.coDriverName && (
                  <div className="text-white/50 text-[12px]">
                    <span className="mr-1">•</span>{r.coDriverName}
                  </div>
                )}
              </span>
              <span className="text-right text-white font-bold tabular-nums">{r.time || '—'}</span>
              <span className="text-right text-white/70 tabular-nums text-xs">{r.diff || (i === 0 ? 'LEADER' : '—')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen font-rajdhani bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b" style={{ background: '#1A1A1E', borderColor: '#2A2A2E' }}>
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center gap-4">
          <FeedLogo variant="light" size="sm" />

          <div className="ml-auto flex items-center gap-2">
            {/* Status badge */}
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${running ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${running ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              {running ? 'LIVE' : 'PAUSED'}
            </span>

            {lastSync && (
              <span className="text-[10px] text-slate-500 font-mono">⟳ {lastSync}</span>
            )}

            <button
              onClick={() => setRunning(r => !r)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-colors ${running ? 'text-white' : 'text-black'}`}
              style={{ background: running ? '#9F2F2D' : '#FF6B00' }}
            >
              <RadioTower className="w-3 h-3" />
              {running ? 'STOP' : 'START'}
            </button>

            <button onClick={refresh} className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-all" style={{ background: '#1A1A1E', border: '1px solid #2A2A2E', color: '#6A6A7A' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#E8E8F0'; e.currentTarget.style.borderColor = '#FF6B00'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#6A6A7A'; e.currentTarget.style.borderColor = '#2A2A2E'; }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
              </svg>
              Refresh
            </button>

            <button onClick={() => setShowConfig(s => !s)} className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-all" style={{ background: '#1A1A1E', border: '1px solid #2A2A2E', color: '#6A6A7A' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#E8E8F0'; e.currentTarget.style.borderColor = '#FF6B00'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#6A6A7A'; e.currentTarget.style.borderColor = '#2A2A2E'; }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              {showConfig ? 'Hide' : 'Config'}
            </button>

            <Link to="/control" className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-all" style={{ background: '#1A1A1E', border: '1px solid #2A2A2E', color: '#6A6A7A' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#E8E8F0'; e.currentTarget.style.borderColor = '#FF6B00'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#6A6A7A'; e.currentTarget.style.borderColor = '#2A2A2E'; }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 2L20 2" /><path d="M4 6L20 6" /><path d="M4 10L20 10" /><path d="M4 14L20 14" /><rect x="2" y="16" width="20" height="6" rx="1" />
              </svg>
              Control
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">
        {showConfig && (
          <section className="border border-slate-700 bg-slate-800/50 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-bold tracking-widest uppercase" style={{ color: '#FF6B00' }}>⚙️ Configuración del feed</h2>
              <span className="text-[11px] text-slate-400">URL de una página de timing público (JSON o HTML con tablas).</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Stage */}
              <div className="space-y-2 p-3 border border-slate-700 rounded-lg bg-slate-800/30">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-300">Feed Stage Results</div>
                <div className="flex gap-2">
                  <select
                    value={stagePresetName || ''}
                    onChange={e => e.target.value ? applyPreset('stage', e.target.value) : setStagePresetName(null)}
                    className="flex h-9 flex-1 border border-slate-600 bg-slate-700 px-2 text-xs text-white rounded-md"
                  >
                    <option value="">— Preset —</option>
                    {presets.filter(p => p.target === 'stageResults').map(p => (
                      <option key={p.name} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-[10px] text-slate-400">URL</Label>
                  <Input value={stageCfg.url} onChange={e => setStageCfg({ ...stageCfg, url: e.target.value })} placeholder="https://cronotec.app/..." className="h-8 text-xs bg-slate-700 border-slate-600" />
                </div>
                <div>
                  <Label className="text-[10px] text-slate-400">Hint</Label>
                  <Input value={stageCfg.hint} onChange={e => setStageCfg({ ...stageCfg, hint: e.target.value })} placeholder="Opcional" className="h-8 text-xs bg-slate-700 border-slate-600" />
                </div>
              </div>

              {/* Overall */}
              <div className="space-y-2 p-3 border border-slate-700 rounded-lg bg-slate-800/30">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-300">Feed Overall</div>
                <div className="flex gap-2">
                  <select
                    value={overallPresetName || ''}
                    onChange={e => e.target.value ? applyPreset('overall', e.target.value) : setOverallPresetName(null)}
                    className="flex h-9 flex-1 border border-slate-600 bg-slate-700 px-2 text-xs text-white rounded-md"
                  >
                    <option value="">— Preset —</option>
                    {presets.filter(p => p.target === 'overallStandings').map(p => (
                      <option key={p.name} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-[10px] text-slate-400">URL</Label>
                  <Input value={overallCfg.url} onChange={e => setOverallCfg({ ...overallCfg, url: e.target.value })} placeholder="https://cronotec.app/..." className="h-8 text-xs bg-slate-700 border-slate-600" />
                </div>
                <div>
                  <Label className="text-[10px] text-slate-400">Hint</Label>
                  <Input value={overallCfg.hint} onChange={e => setOverallCfg({ ...overallCfg, hint: e.target.value })} placeholder="Opcional" className="h-8 text-xs bg-slate-700 border-slate-600" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 items-end">
              <div>
                <Label className="text-xs text-slate-400">Título del evento</Label>
                <Input value={eventName} onChange={e => setEventName(e.target.value)} className="h-9 text-xs bg-slate-700 border-slate-600" />
              </div>
              <div>
                <Label className="text-xs text-slate-400">Intervalo (s)</Label>
                <Input type="number" min={5} value={intervalSec} onChange={e => setIntervalSec(+e.target.value)} className="h-9 text-xs bg-slate-700 border-slate-600" />
              </div>
              <p className="text-[11px] text-slate-400">
                Funciona con URLs que devuelven JSON o HTML con tablas. Si la página usa JS para cargar datos, puede fallar.
              </p>
            </div>
          </section>
        )}

        {error && (
          <div className="text-xs p-3 font-mono rounded-sm" style={{ color: '#FF6B00', border: '1px solid #FF6B0040', background: '#FF6B0010' }}>
            ⚠️ {error}
          </div>
        )}

        <section className="flex flex-col lg:flex-row gap-6">
          {renderTable('Stage Results', stageRows)}
          {renderTable('Overall Standings', overallRows)}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LiveRally;
