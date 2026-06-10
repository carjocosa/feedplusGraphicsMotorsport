import { useState, useCallback, useMemo, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBroadcastSender } from '@/hooks/useBroadcast';
import { useToast } from '@/hooks/use-toast';
import type { GraphicType } from '@/types/rally';
import CrewTab from '@/components/control/CrewTab';
import TimingTab from '@/components/control/TimingTab';
import BrandingTab from '@/components/control/BrandingTab';
import MapContextTab from '@/components/control/MapContextTab';
import SettingsTab from '@/components/control/SettingsTab';
import EntriesTab from '@/components/control/EntriesTab';
import IntroTab from '@/components/control/IntroTab';
import ImportTab from '@/components/control/ImportTab';
import CircuitEntriesTab from '@/components/control/circuit/CircuitEntriesTab';
import GridTab from '@/components/control/circuit/GridTab';
import LapsTab from '@/components/control/circuit/LapsTab';
import FlagsTab from '@/components/control/circuit/FlagsTab';
import PitsTab from '@/components/control/circuit/PitsTab';
import PodiumTab from '@/components/control/circuit/PodiumTab';
import CircuitIntroTab from '@/components/control/circuit/CircuitIntroTab';
import GuideTab from '@/components/control/GuideTab';
import FeedLogo from '@/components/ui/FeedLogo';
import { useRallyStore } from '@/store/rallyStore';
import { label } from '@/lib/i18n';
import { useModeStore } from '@/store/modeStore';
import { useThemeStore } from '@/store/themeStore';
import Footer from '@/components/ui/Footer';

const RALLY_GRAPHICS: GraphicType[] = ['crewLowerThird', 'stageLowerThird', 'interviewLowerThird', 'stageResults', 'overallStandings', 'headToHead', 'startList', 'stageMap', 'elevationProfile', 'weather', 'scorebug', 'sponsorCrawl', 'countdown', 'rallyIntro', 'stagePresentation', 'stageWeather'];
const CIRCUIT_GRAPHICS: string[] = ['startGrid', 'circuitTiming', 'driverLap', 'raceFlag', 'pitTracker', 'podium', 'finalResults', 'circuitScorebug', 'guestLowerThird', 'circuitIntro'];

const CONFLICT_GROUPS: string[][] = [
  ['scorebug', 'circuitScorebug', 'weather', 'stageResults', 'overallStandings', 'startList', 'startGrid', 'pitTracker', 'finalResults', 'raceFlag'],
  ['rallyIntro', 'stagePresentation', 'stageWeather', 'podium', 'circuitIntro'],
  ['headToHead', 'countdown'],
];

function getConflictGroup(id: string): string[] | null {
  return CONFLICT_GROUPS.find(g => g.includes(id)) ?? null;
}

function isFullscreenGraphic(id: string): boolean {
  return ['rallyIntro', 'stagePresentation', 'stageWeather', 'podium', 'circuitIntro'].includes(id);
}

const CrossIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6L6 18" /><path d="M6 6L18 18" />
  </svg>
);

const ExternalIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13V19C18 20.1 17.1 21 16 21H5C3.9 21 3 20.1 3 19V8C3 6.9 3.9 6 5 6H11" />
    <path d="M15 3H21V9" />
    <path d="M10 14L21 3" />
  </svg>
);

const CopyIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4C2.9 15 2 14.1 2 13V4C2 2.9 2.9 2 4 2H13C14.1 2 15 2.9 15 4V5" />
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17L4 12" />
  </svg>
);

const Control = () => {
  const { toast } = useToast();
  const room = useMemo(() => {
    const url = new URL(window.location.href);
    let r = url.searchParams.get('room') || localStorage.getItem('rs-room');
    if (!r) {
      r = Math.random().toString(36).slice(2, 10);
    }
    localStorage.setItem('rs-room', r);
    if (!url.searchParams.get('room')) {
      url.searchParams.set('room', r);
      window.history.replaceState({}, '', url.toString());
    }
    return r;
  }, []);
  const send = useBroadcastSender(room);
  const [liveGraphics, setLiveGraphics] = useState<Set<string>>(new Set());
  const settings = useRallyStore(s => s.settings);
  const { mode, setMode } = useModeStore();

  const outputUrl = useMemo(() => `${window.location.origin}/output?room=${room}`, [room]);

  const openOutput = () => {
    window.open(outputUrl, 'feed-output', 'width=1920,height=1080');
  };

  const copyOutputUrl = async () => {
    try {
      await navigator.clipboard.writeText(outputUrl);
      toast({ title: 'URL copied', description: 'Paste as Browser Source in OBS (1920x1080).' });
    } catch {
      toast({ title: outputUrl, description: 'Copy manually' });
    }
  };

  const handleTake = useCallback((id: any, data: any) => {
    if (isFullscreenGraphic(id)) {
      [...RALLY_GRAPHICS, ...CIRCUIT_GRAPHICS].forEach(g => {
        if (g !== id) send({ type: 'CLEAR', graphic: g });
      });
      setLiveGraphics(new Set([id]));
    } else {
      const group = getConflictGroup(id);
      if (group) {
        group.forEach(g => {
          if (g !== id && liveGraphics.has(g)) {
            send({ type: 'CLEAR', graphic: g });
          }
        });
      }
      if (isFullscreenGraphic(id) === false) {
        ['rallyIntro', 'stagePresentation', 'stageWeather', 'raceFlag', 'podium'].forEach(g => {
          if (liveGraphics.has(g)) send({ type: 'CLEAR', graphic: g });
        });
      }
    }

    send({ type: 'TAKE', graphic: id, data });
    setLiveGraphics(prev => {
      const next = new Set(prev);
      const group = getConflictGroup(id);
      if (group) {
        group.forEach(g => { if (g !== id) next.delete(g); });
      }
      if (isFullscreenGraphic(id)) {
        [...RALLY_GRAPHICS, ...CIRCUIT_GRAPHICS].forEach(g => { if (g !== id) next.delete(g); });
      } else {
        ['rallyIntro', 'stagePresentation', 'stageWeather', 'raceFlag', 'podium'].forEach(g => next.delete(g));
      }
      next.add(id);
      return next;
    });
  }, [send, liveGraphics]);

  const handleClear = useCallback((id: any) => {
    send({ type: 'CLEAR', graphic: id });
    setLiveGraphics(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, [send]);

  const clearAll = () => {
    [...RALLY_GRAPHICS, ...CIRCUIT_GRAPHICS].forEach(g => send({ type: 'CLEAR', graphic: g }));
    setLiveGraphics(new Set());
  };

  const switchMode = (m: 'rally' | 'circuit') => {
    if (m === mode) return;
    clearAll();
    setMode(m);
    send({ type: 'SET_MODE', mode: m });
  };

  const activeTabs = mode === 'rally'
    ? [
        { value: 'import', label: 'Importar' },
        { value: 'entries', label: 'Inscritos' },
        { value: 'intro', label: 'Intro / Stages' },
        { value: 'crews', label: 'Crews' },
        { value: 'timing', label: 'Timing' },
        { value: 'branding', label: 'Branding' },
        { value: 'context', label: 'Map / Context' },
        { value: 'settings', label: 'Style Editor' },
        { value: 'guide', label: 'Guía' },
      ]
    : [
        { value: 'entries', label: 'Pilotos' },
        { value: 'intro', label: 'Intro Circuito' },
        { value: 'grid', label: 'Parrilla' },
        { value: 'laps', label: 'Vueltas / Live' },
        { value: 'flags', label: 'Banderas' },
        { value: 'pits', label: 'Pits' },
        { value: 'podium', label: 'Podio' },
        { value: 'settings', label: 'Style Editor' },
      ];

  const accent = settings.accentColor || '#FF6B00';
  const { theme, toggleTheme } = useThemeStore();
  const tc = theme === 'dark'
    ? { bg: '#0F0F11', surface: '#1A1A1E', border: '#2A2A2E', muted: '#6A6A7A', text: '#E8E8F0' }
    : { bg: '#F5F5F0', surface: '#FFFFFF', border: '#D4D4D4', muted: '#999999', text: '#1A1A1E' };

  useEffect(() => { document.title = 'Feed+ Motorsport — Control Panel  |  by Studio+'; }, []);

  return (
    <div className="min-h-screen" style={{
      background: tc.bg,
      '--theme-bg': tc.bg,
      '--theme-surface': tc.surface,
      '--theme-border': tc.border,
      '--theme-muted': tc.muted,
      '--theme-text': tc.text,
    } as React.CSSProperties}>
      <header className="sticky top-0 z-50 border-b" style={{ background: tc.surface, borderColor: tc.border }}>
        <div className="px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-5">
            <FeedLogo variant={theme === 'dark' ? 'light' : 'dark'} size="sm" />

            <div className="flex rounded-sm overflow-hidden border" style={{ borderColor: tc.border }}>
              {(['rally', 'circuit'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className="px-3.5 py-1.5 text-[11px] font-semibold tracking-wider uppercase transition-all"
                  style={{
                    background: mode === m ? accent : 'transparent',
                    color: mode === m ? '#000' : tc.muted,
                  }}
                >
                  {m === 'rally' ? 'Rally' : 'Circuito'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm border" style={{ borderColor: tc.border }}>
              <CheckIcon />
              <span className="text-[10px] font-mono font-medium" style={{ color: tc.muted }}>{room}</span>
            </div>

            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-8 h-8 rounded-sm border transition-all"
              style={{ borderColor: tc.border, color: tc.muted }}
              title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {theme === 'dark' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {liveGraphics.size > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm" style={{ background: `${accent}18` }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse-live" style={{ background: accent }} />
                <span className="text-[10px] font-semibold tracking-wider" style={{ color: accent }}>
                  {liveGraphics.size} ON AIR
                </span>
              </div>
            )}

            <button
              onClick={copyOutputUrl}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-sm border transition-all"
              style={{ borderColor: tc.border, color: tc.muted }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = tc.text; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = tc.border; e.currentTarget.style.color = tc.muted; }}
            >
              <CopyIcon />
              <span className="hidden sm:inline">{label('Copy URL', settings.language, settings.customLabels)}</span>
            </button>

            <button
              onClick={openOutput}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-sm border transition-all"
              style={{ borderColor: tc.border, color: tc.muted }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = tc.text; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = tc.border; e.currentTarget.style.color = tc.muted; }}
            >
              <ExternalIcon />
              <span className="hidden sm:inline">Output</span>
            </button>

            {liveGraphics.size > 0 && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-sm transition-all"
                style={{ background: '#9F2F2D', color: 'white' }}
              >
                <CrossIcon />
                {label('Clear All', settings.language, settings.customLabels)}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="px-6 py-4">
        <Tabs defaultValue={mode === 'rally' ? 'import' : 'entries'} className="w-full" key={mode}>
            <TabsList
              className="flex gap-0 h-auto p-0 w-full justify-start rounded-sm overflow-hidden"
              style={{ background: tc.surface, border: `1px solid ${tc.border}` }}
            >
              {activeTabs.map(t => (
                <TabsTrigger
                  key={t.value}
                  value={t.value}
                  className="relative flex-1 px-3 py-2.5 text-[11px] font-medium tracking-wider uppercase rounded-none bg-transparent data-[state=active]:shadow-none transition-all"
                  style={{
                    borderRight: `1px solid ${tc.border}`,
                  }}
              >
                <span
                  className="absolute inset-x-0 top-0 h-0.5 transition-opacity"
                  style={{
                    background: accent,
                    opacity: 0,
                  }}
                  data-active-indicator=""
                />
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <style>{`
            [data-state="active"] [data-active-indicator] { opacity: 1 !important; }
            [data-state="active"] { background: ${accent}12 !important; color: ${accent} !important; font-weight: 600 !important; }
            button[role="tab"]:not([data-state="active"]) { color: ${tc.muted} !important; }
          `}</style>

          <TabsContent value="import"><ImportTab /></TabsContent>
          <TabsContent value="entries">{mode === 'rally' ? <EntriesTab /> : <CircuitEntriesTab />}</TabsContent>
          <TabsContent value="intro"><IntroTab onTake={handleTake} onClear={handleClear} liveGraphics={liveGraphics} /></TabsContent>
          <TabsContent value="crews"><CrewTab onTake={handleTake} onClear={handleClear} liveGraphics={liveGraphics} /></TabsContent>
          <TabsContent value="timing"><TimingTab onTake={handleTake} onClear={handleClear} liveGraphics={liveGraphics} sendBroadcast={send} /></TabsContent>
          <TabsContent value="branding"><BrandingTab onTake={handleTake} onClear={handleClear} liveGraphics={liveGraphics} /></TabsContent>
          <TabsContent value="context"><MapContextTab onTake={handleTake} onClear={handleClear} liveGraphics={liveGraphics} /></TabsContent>
          <TabsContent value="settings"><SettingsTab sendBroadcast={send} liveGraphics={liveGraphics} /></TabsContent>
          <TabsContent value="guide"><GuideTab /></TabsContent>

          <TabsContent value="intro"><CircuitIntroTab onTake={handleTake} onClear={handleClear} liveGraphics={liveGraphics} /></TabsContent>
          <TabsContent value="grid"><GridTab onTake={handleTake} onClear={handleClear} liveGraphics={liveGraphics} /></TabsContent>
          <TabsContent value="laps"><LapsTab onTake={handleTake} onClear={handleClear} liveGraphics={liveGraphics} /></TabsContent>
          <TabsContent value="flags"><FlagsTab onTake={handleTake} onClear={handleClear} liveGraphics={liveGraphics} /></TabsContent>
          <TabsContent value="pits"><PitsTab onTake={handleTake} onClear={handleClear} liveGraphics={liveGraphics} /></TabsContent>
          <TabsContent value="podium"><PodiumTab onTake={handleTake} onClear={handleClear} liveGraphics={liveGraphics} /></TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Control;
