import { useEffect, useRef, useState, useCallback } from 'react';
import { useRallyStore } from '@/store/rallyStore';
import { useModeStore } from '@/store/modeStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import type { BroadcastMessage, GraphicsSettings, TransformableGraphic, GraphicLayout, GraphicColorOverride, GraphicLayoutMap } from '@/types/rally';
import { getLayout, defaultLayoutForGraphic } from '@/lib/graphicsStyle';
import CrewLowerThird from '@/components/graphics/CrewLowerThird';
import StageLowerThird from '@/components/graphics/StageLowerThird';
import InterviewLowerThird from '@/components/graphics/InterviewLowerThird';
import VsLowerThird from '@/components/graphics/VsLowerThird';
import Scorebug from '@/components/graphics/Scorebug';
import StageResults from '@/components/graphics/StageResults';
import OverallStandings from '@/components/graphics/OverallStandings';
import HeadToHead from '@/components/graphics/HeadToHead';
import StartList from '@/components/graphics/StartList';
import EntriesList from '@/components/graphics/EntriesList';
import StageMap from '@/components/graphics/StageMap';
import ElevationProfile from '@/components/graphics/ElevationProfile';
import Weather from '@/components/graphics/Weather';
import SponsorCrawl from '@/components/graphics/SponsorCrawl';
import CountdownTimer from '@/components/graphics/CountdownTimer';
import RallyIntro from '@/components/graphics/RallyIntro';
import StagePresentation from '@/components/graphics/StagePresentation';
import StageWeather from '@/components/graphics/StageWeather';
import CircuitScorebug from '@/components/graphics/circuit/CircuitScorebug';
import StartGrid from '@/components/graphics/circuit/StartGrid';
import CircuitLiveTiming from '@/components/graphics/circuit/CircuitLiveTiming';
import DriverLapLowerThird from '@/components/graphics/circuit/DriverLapLowerThird';
import RaceFlag from '@/components/graphics/circuit/RaceFlag';
import PitTracker from '@/components/graphics/circuit/PitTracker';
import Podium from '@/components/graphics/circuit/Podium';
import FinalResults from '@/components/graphics/circuit/FinalResults';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronDown, Save, Trash2, Upload } from 'lucide-react';

interface Props {
  sendBroadcast: (msg: BroadcastMessage) => void;
  liveGraphics?: Set<string>;
}

const FONTS: GraphicsSettings['fontDisplay'][] = ['Rajdhani', 'Oswald', 'Bebas Neue', 'Barlow Condensed', 'Russo One'];
const CORNERS: GraphicsSettings['cornerStyle'][] = ['sharp', 'subtle', 'rounded'];
const SPEEDS: GraphicsSettings['animationSpeed'][] = ['instant', 'fast', 'normal', 'cinematic'];

type Preset = {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  fontDisplay: GraphicsSettings['fontDisplay'];
  cornerStyle: GraphicsSettings['cornerStyle'];
  shearAngle: number;
  animationSpeed: GraphicsSettings['animationSpeed'];
  borderAccent: boolean;
  panelOpacity: number;
  lowerThirdLayout: 'vertical' | 'horizontal';
  fontSizeScale: number;
};

const PRESETS: Preset[] = [
  {
    name: 'Feed+', primaryColor: '#1A1A1E', secondaryColor: '#0F0F11', accentColor: '#FF6B00',
    textColor: '#E8E8F0', fontDisplay: 'Barlow Condensed', cornerStyle: 'sharp', shearAngle: 0,
    animationSpeed: 'fast', borderAccent: true, panelOpacity: 0.92, lowerThirdLayout: 'horizontal', fontSizeScale: 0.95,
  },
  {
    name: 'Feed+ Light', primaryColor: '#FFFFFF', secondaryColor: '#F5F5F0', accentColor: '#FF6B00',
    textColor: '#1A1A1E', fontDisplay: 'Barlow Condensed', cornerStyle: 'sharp', shearAngle: 0,
    animationSpeed: 'fast', borderAccent: true, panelOpacity: 0.95, lowerThirdLayout: 'horizontal', fontSizeScale: 0.95,
  },
  {
    name: 'WRC Classic', primaryColor: '#E11D48', secondaryColor: '#0F172A', accentColor: '#FDE047',
    textColor: '#FFFFFF', fontDisplay: 'Rajdhani', cornerStyle: 'sharp', shearAngle: 15,
    animationSpeed: 'fast', borderAccent: false, panelOpacity: 1, lowerThirdLayout: 'vertical', fontSizeScale: 1,
  },
  {
    name: 'Dakar', primaryColor: '#D97706', secondaryColor: '#1C1917', accentColor: '#FBBF24',
    textColor: '#FFFFFF', fontDisplay: 'Oswald', cornerStyle: 'sharp', shearAngle: 12,
    animationSpeed: 'normal', borderAccent: false, panelOpacity: 1, lowerThirdLayout: 'vertical', fontSizeScale: 1,
  },
  {
    name: 'Monte Carlo', primaryColor: '#1D4ED8', secondaryColor: '#0F172A', accentColor: '#F8FAFC',
    textColor: '#FFFFFF', fontDisplay: 'Bebas Neue', cornerStyle: 'subtle', shearAngle: 10,
    animationSpeed: 'normal', borderAccent: false, panelOpacity: 1, lowerThirdLayout: 'vertical', fontSizeScale: 1,
  },
  {
    name: 'Safari', primaryColor: '#16A34A', secondaryColor: '#1A2E05', accentColor: '#FDE047',
    textColor: '#FFFFFF', fontDisplay: 'Barlow Condensed', cornerStyle: 'sharp', shearAngle: 18,
    animationSpeed: 'fast', borderAccent: false, panelOpacity: 1, lowerThirdLayout: 'vertical', fontSizeScale: 1,
  },
  {
    name: 'Arctic', primaryColor: '#0EA5E9', secondaryColor: '#0C4A6E', accentColor: '#F0F9FF',
    textColor: '#FFFFFF', fontDisplay: 'Rajdhani', cornerStyle: 'rounded', shearAngle: 8,
    animationSpeed: 'cinematic', borderAccent: false, panelOpacity: 0.95, lowerThirdLayout: 'vertical', fontSizeScale: 1,
  },
  {
    name: 'Neon Esports', primaryColor: '#A855F7', secondaryColor: '#0B0613', accentColor: '#22D3EE',
    textColor: '#F5F3FF', fontDisplay: 'Russo One', cornerStyle: 'subtle', shearAngle: 0,
    animationSpeed: 'fast', borderAccent: false, panelOpacity: 0.9, lowerThirdLayout: 'horizontal', fontSizeScale: 0.95,
  },
  {
    name: 'Karting Pro', primaryColor: '#0EA5E9', secondaryColor: '#0B1220', accentColor: '#FACC15',
    textColor: '#FFFFFF', fontDisplay: 'Barlow Condensed', cornerStyle: 'sharp', shearAngle: 12,
    animationSpeed: 'fast', borderAccent: false, panelOpacity: 1, lowerThirdLayout: 'vertical', fontSizeScale: 1,
  },
  {
    name: 'Endurance', primaryColor: '#7C3AED', secondaryColor: '#09090B', accentColor: '#F97316',
    textColor: '#FAFAFA', fontDisplay: 'Oswald', cornerStyle: 'subtle', shearAngle: 8,
    animationSpeed: 'normal', borderAccent: false, panelOpacity: 0.95, lowerThirdLayout: 'vertical', fontSizeScale: 1,
  },
  {
    name: 'F-Regional', primaryColor: '#DC2626', secondaryColor: '#0A0A0A', accentColor: '#FFFFFF',
    textColor: '#FFFFFF', fontDisplay: 'Russo One', cornerStyle: 'sharp', shearAngle: 6,
    animationSpeed: 'fast', borderAccent: false, panelOpacity: 1, lowerThirdLayout: 'vertical', fontSizeScale: 1,
  },
];

const CUSTOM_LABEL_KEYS: { key: string; hint: string }[] = [
  { key: 'STAGE MAP', hint: 'Stage Map' },
  { key: 'ELEVATION PROFILE', hint: 'Elevation Profile' },
  { key: 'STAGE RESULTS', hint: 'Stage Results' },
  { key: 'OVERALL STANDINGS', hint: 'Overall Standings' },
  { key: 'START LIST', hint: 'Start List' },
  { key: 'HEAD TO HEAD', hint: 'Head to Head' },
  { key: 'ENTRANTS LIST', hint: 'Entrants List' },
  { key: 'LIVE TIMING', hint: 'Live Timing' },
  { key: 'START', hint: 'Start' },
  { key: 'FINISH', hint: 'Finish' },
  { key: 'LEADER', hint: 'Leader' },
  { key: 'FASTEST', hint: 'Fastest' },
  { key: 'Pos', hint: 'Pos' },
  { key: 'Crew', hint: 'Crew' },
  { key: 'Team', hint: 'Team' },
  { key: 'Time', hint: 'Time' },
  { key: 'Diff', hint: 'Diff' },
];

const RALLY_GRAPHICS: { id: TransformableGraphic; label: string }[] = [
  { id: 'crewLowerThird', label: 'Crew LT' },
  { id: 'stageLowerThird', label: 'Stage LT' },
  { id: 'interviewLowerThird', label: 'Interview LT' },
  { id: 'vsLowerThird', label: 'VS' },
  { id: 'scorebug', label: 'Scorebug' },
  { id: 'stageResults', label: 'Stage Results' },
  { id: 'overallStandings', label: 'Standings' },
  { id: 'headToHead', label: 'Head 2 Head' },
  { id: 'startList', label: 'Start List' },
  { id: 'entriesList', label: 'Entries' },
  { id: 'stageMap', label: 'Stage Map' },
  { id: 'elevationProfile', label: 'Elevation' },
  { id: 'weather', label: 'Weather' },
  { id: 'sponsorCrawl', label: 'Sponsors' },
  { id: 'countdown', label: 'Countdown' },
  { id: 'rallyIntro', label: 'Rally Intro' },
  { id: 'stagePresentation', label: 'Stage Pres.' },
  { id: 'stageWeather', label: 'Stage Wx' },
];

const CIRCUIT_GRAPHICS: { id: TransformableGraphic; label: string }[] = [
  { id: 'circuitScorebug', label: 'Circuit SB' },
  { id: 'startGrid', label: 'Start Grid' },
  { id: 'circuitTiming', label: 'Live Timing' },
  { id: 'driverLap', label: 'Driver Lap' },
  { id: 'raceFlag', label: 'Race Flag' },
  { id: 'pitTracker', label: 'Pit Tracker' },
  { id: 'podium', label: 'Podium' },
  { id: 'finalResults', label: 'Final Results' },
];

const PREVIEW_W = 640; // visual preview width in CSS px
const SCALE = PREVIEW_W / 1920;
const PREVIEW_H = 1080 * SCALE;

const SettingsTab = ({ sendBroadcast, liveGraphics }: Props) => {
  const { mode } = useModeStore();
  const {
    settings, setSettings, crew, stage, interview, event, vsData,
    stageResults, overallStandings, headToHead, startList, entries,
    weather, sponsors, countdown, rallyIntro, stageWeather,
  } = useRallyStore();
  const graphics = mode === 'rally' ? RALLY_GRAPHICS : CIRCUIT_GRAPHICS;
  const [selected, setSelected] = useState<TransformableGraphic>(mode === 'rally' ? 'crewLowerThird' : 'circuitScorebug');

  // Reset selection when mode changes
  useEffect(() => {
    setSelected(mode === 'rally' ? 'crewLowerThird' : 'circuitScorebug');
  }, [mode]);
  const [dragging, setDragging] = useState(false);
  const dragOriginRef = useRef<{ mx: number; my: number; ox: number; oy: number } | null>(null);
  const [layoutPresets, setLayoutPresets] = useState<{ name: string; layouts: GraphicLayoutMap }[]>(() => {
    try { return JSON.parse(localStorage.getItem('rally-layout-presets') || '[]'); } catch { return []; }
  });
  const [presetName, setPresetName] = useState('');
  const [showPresets, setShowPresets] = useState(false);

  const update = (updates: Partial<GraphicsSettings>) => {
    setSettings(updates);
    sendBroadcast({ type: 'UPDATE_SETTINGS', settings: { ...settings, ...updates } });
  };

  const layout = getLayout(settings, selected);
  const colorOverride = settings.colorOverrides?.[selected] ?? {};
  const dataLength = selected === 'overallStandings' ? overallStandings.length : stageResults.length;

  const updateLayout = (patch: Partial<GraphicLayout>) => {
    const layouts = { ...settings.layouts, [selected]: { ...layout, ...patch } };
    const newSettings = { ...settings, layouts };
    setSettings(newSettings);
    sendBroadcast({ type: 'UPDATE_LAYOUT', layout: { graphic: selected, patch } });
  };

  const updateColorOverride = (patch: Partial<GraphicColorOverride>) => {
    const colorOverrides = { ...settings.colorOverrides, [selected]: { ...colorOverride, ...patch } };
    update({ colorOverrides });
  };

  const saveLayoutPreset = () => {
    const name = presetName.trim();
    if (!name) return;
    const preset = { name, layouts: settings.layouts ?? {} };
    const updated = [...layoutPresets.filter(p => p.name !== name), preset];
    setLayoutPresets(updated);
    localStorage.setItem('rally-layout-presets', JSON.stringify(updated));
    setPresetName('');
  };

  const loadLayoutPreset = (preset: { name: string; layouts: GraphicLayoutMap }) => {
    const newSettings = { ...settings, layouts: preset.layouts };
    setSettings(newSettings);
    sendBroadcast({ type: 'UPDATE_SETTINGS', settings: newSettings });
  };

  const deleteLayoutPreset = (name: string) => {
    const updated = layoutPresets.filter(p => p.name !== name);
    setLayoutPresets(updated);
    localStorage.setItem('rally-layout-presets', JSON.stringify(updated));
  };

  const exportLayouts = () => {
    const json = JSON.stringify(settings.layouts ?? {}, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'rally-layouts.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const importLayouts = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const layouts = JSON.parse(ev.target?.result as string) as GraphicLayoutMap;
          const newSettings = { ...settings, layouts };
          setSettings(newSettings);
          sendBroadcast({ type: 'UPDATE_SETTINGS', settings: newSettings });
        } catch { /* ignore */ }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
    dragOriginRef.current = {
      mx: e.clientX,
      my: e.clientY,
      ox: layout.x,
      oy: layout.y,
    };
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const o = dragOriginRef.current;
      if (!o) return;
      const dx = (e.clientX - o.mx) / SCALE;
      const dy = (e.clientY - o.my) / SCALE;
      updateLayout({ x: Math.round(o.ox + dx), y: Math.round(o.oy + dy) });
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging]);

  const reset = () => {
    const def = defaultLayoutForGraphic(selected);
    updateLayout({ x: def.x, y: def.y, width: def.width, height: def.height, opacity: 1, scale: 1, visible: true });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_700px] gap-6">
      {/* LEFT: style controls */}
      <div className="space-y-3">
        {/* Colors */}
        <Collapsible defaultOpen>
          <div className="border border-[#EAEAEA] bg-white rounded-lg overflow-hidden">
            <Tooltip>
              <TooltipTrigger asChild>
                <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-[#F9F9F8] transition-colors group cursor-pointer">
                  <h3 className="text-xs font-bold tracking-wider uppercase" style={{ color: '#2F3437' }}>Color Scheme</h3>
                  <ChevronDown className="w-3.5 h-3.5 text-[#787774] transition-transform group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs max-w-[280px]">
                Colors for all graphics: primary, secondary, accent, and text. Modify from here or pick a preset below.
              </TooltipContent>
            </Tooltip>
            <CollapsibleContent className="px-4 pb-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                {([
                  ['Primary', 'primaryColor'],
                  ['Secondary', 'secondaryColor'],
                  ['Accent', 'accentColor'],
                  ['Text', 'textColor'],
                ] as const).map(([label, key]) => (
                  <div key={key}>
                    <Label className="text-xs text-muted-foreground">{label}</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        value={settings[key] as string}
                        onChange={e => update({ [key]: e.target.value } as Partial<GraphicsSettings>)}
                        className="w-10 h-10 cursor-pointer border-0 bg-transparent"
                      />
                      <Input
                        className="h-8 text-xs font-mono"
                        value={settings[key] as string}
                        onChange={e => update({ [key]: e.target.value } as Partial<GraphicsSettings>)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Typography */}
        <Collapsible>
          <div className="border border-[#EAEAEA] bg-white rounded-lg overflow-hidden">
            <Tooltip>
              <TooltipTrigger asChild>
                <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-[#F9F9F8] transition-colors group cursor-pointer">
                  <h3 className="text-xs font-bold tracking-wider uppercase" style={{ color: '#2F3437' }}>Typography</h3>
                  <ChevronDown className="w-3.5 h-3.5 text-[#787774] transition-transform group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs max-w-[280px]">
                Choose the display font family for on-screen titles and adjust the overall size scale.
              </TooltipContent>
            </Tooltip>
            <CollapsibleContent className="px-4 pb-4 space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Display Font</Label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {FONTS.map(f => (
                    <button
                      key={f}
                      onClick={() => update({ fontDisplay: f })}
                      className={`px-3 py-2 text-sm border transition-colors ${
                        settings.fontDisplay === f ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted'
                      }`}
                      style={{ fontFamily: `'${f}', sans-serif` }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Font Size Scale</Label>
                <div className="flex items-center gap-4 mt-1">
                  <Slider
                    value={[settings.fontSizeScale * 100]}
                    onValueChange={([v]) => update({ fontSizeScale: v / 100 })}
                    min={80} max={140} step={5}
                    className="flex-1"
                  />
                  <span className="text-sm font-mono text-foreground w-16 text-right">{Math.round(settings.fontSizeScale * 100)}%</span>
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Geometry & Motion */}
        <Collapsible>
          <div className="border border-[#EAEAEA] bg-white rounded-lg overflow-hidden">
            <Tooltip>
              <TooltipTrigger asChild>
                <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-[#F9F9F8] transition-colors group cursor-pointer">
                  <h3 className="text-xs font-bold tracking-wider uppercase" style={{ color: '#2F3437' }}>Geometry &amp; Motion</h3>
                  <ChevronDown className="w-3.5 h-3.5 text-[#787774] transition-transform group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs max-w-[280px]">
                Animation speed, panel appearance, corner rounding, route animation duration, and layout behavior.
              </TooltipContent>
            </Tooltip>
            <CollapsibleContent className="px-4 pb-4 space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Shear Angle</Label>
                <div className="flex items-center gap-4 mt-1">
                  <Slider value={[settings.shearAngle]} onValueChange={([v]) => update({ shearAngle: v })} min={0} max={30} step={1} className="flex-1" />
                  <span className="text-sm font-mono text-foreground w-12 text-right">{settings.shearAngle}°</span>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Corner Style</Label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {CORNERS.map(c => (
                    <button
                      key={c}
                      onClick={() => update({ cornerStyle: c })}
                      className={`px-3 py-2 text-xs uppercase font-bold tracking-wider border transition-colors ${
                        settings.cornerStyle === c ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Animation Speed</Label>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {SPEEDS.map(s => (
                    <button
                      key={s}
                      onClick={() => update({ animationSpeed: s })}
                      className={`px-2 py-2 text-xs uppercase font-bold tracking-wider border transition-colors ${
                        settings.animationSpeed === s ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Panel Opacity</Label>
                <div className="flex items-center gap-4 mt-1">
                  <Slider value={[settings.panelOpacity * 100]} onValueChange={([v]) => update({ panelOpacity: v / 100 })} min={50} max={100} step={5} className="flex-1" />
                  <span className="text-sm font-mono text-foreground w-16 text-right">{Math.round(settings.panelOpacity * 100)}%</span>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Route Animation (seconds)</Label>
                <div className="flex items-center gap-4 mt-1">
                  <Slider
                    value={[settings.routeAnimDuration ?? 8]}
                    onValueChange={([v]) => update({ routeAnimDuration: v })}
                    min={2} max={30} step={1}
                    className="flex-1"
                  />
                  <span className="text-sm font-mono text-foreground w-16 text-right">{settings.routeAnimDuration ?? 8}s</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Accent border on panels</Label>
                <Switch checked={settings.borderAccent} onCheckedChange={(v) => update({ borderAccent: v })} />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Lower Third Layout</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {(['vertical', 'horizontal'] as const).map(l => (
                    <button
                      key={l}
                      onClick={() => update({ lowerThirdLayout: l })}
                      className={`px-3 py-2 text-xs uppercase font-bold tracking-wider border transition-colors ${
                        settings.lowerThirdLayout === l ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted'
                      }`}
                    >
                      {l === 'vertical' ? 'Torre (Vertical)' : 'Horizontal'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Tower Width</Label>
                <div className="flex items-center gap-4 mt-1">
                  <Slider value={[settings.towerWidth ?? 560]} onValueChange={([v]) => update({ towerWidth: v })} min={400} max={800} step={10} className="flex-1" />
                  <span className="text-sm font-mono text-foreground w-16 text-right">{settings.towerWidth ?? 560}px</span>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Rows per page</Label>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {[10, 15, 20, 30].map(n => (
                    <button
                      key={n}
                      onClick={() => update({ displayPageSize: n, displayPageOffset: 0 })}
                      className={`px-2 py-2 text-xs uppercase font-bold tracking-wider border transition-colors ${
                        (settings.displayPageSize ?? 15) === n ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {dataLength > (settings.displayPageSize ?? 15) && (
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Page</Label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => update({ displayPageOffset: Math.max(0, (settings.displayPageOffset ?? 0) - 1) })}
                      disabled={(settings.displayPageOffset ?? 0) === 0}
                      className="px-3 py-1 text-xs font-bold border border-border rounded disabled:opacity-30 hover:bg-muted"
                    >
                      ←
                    </button>
                    <span className="text-sm font-mono text-foreground">
                      {(settings.displayPageOffset ?? 0) + 1} / {Math.ceil(dataLength / (settings.displayPageSize ?? 15))}
                    </span>
                    <button
                      onClick={() => update({ displayPageOffset: Math.min(Math.ceil(dataLength / (settings.displayPageSize ?? 15)) - 1, (settings.displayPageOffset ?? 0) + 1) })}
                      disabled={(settings.displayPageOffset ?? 0) >= Math.ceil(dataLength / (settings.displayPageSize ?? 15)) - 1}
                      className="px-3 py-1 text-xs font-bold border border-border rounded disabled:opacity-30 hover:bg-muted"
                    >
                      →
                    </button>
                  </div>
                </div>
              )}
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Language */}
        <Collapsible>
          <div className="border border-[#EAEAEA] bg-white rounded-lg overflow-hidden">
            <Tooltip>
              <TooltipTrigger asChild>
                <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-[#F9F9F8] transition-colors group cursor-pointer">
                  <h3 className="text-xs font-bold tracking-wider uppercase" style={{ color: '#2F3437' }}>Language</h3>
                  <ChevronDown className="w-3.5 h-3.5 text-[#787774] transition-transform group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs max-w-[280px]">
                Switch between Spanish and English for all on-screen graphic text. Falls back to English when translation is missing.
              </TooltipContent>
            </Tooltip>
            <CollapsibleContent className="px-4 pb-4 space-y-3">
              <div className="grid grid-cols-2 gap-2 mt-1">
                {(['es', 'en'] as const).map(l => (
                  <button
                    key={l}
                    onClick={() => update({ language: l })}
                    className={`px-3 py-2 text-xs uppercase font-bold tracking-wider border transition-colors ${
                      settings.language === l ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted'
                    }`}
                  >
                    {l === 'es' ? 'Español' : 'English'}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                When a direct translation is missing the English term is used (Spanglish fallback).
              </p>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Custom Labels */}
        <Collapsible>
          <div className="border border-[#EAEAEA] bg-white rounded-lg overflow-hidden">
            <Tooltip>
              <TooltipTrigger asChild>
                <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-[#F9F9F8] transition-colors group cursor-pointer">
                  <h3 className="text-xs font-bold tracking-wider uppercase" style={{ color: '#2F3437' }}>Custom Labels</h3>
                  <ChevronDown className="w-3.5 h-3.5 text-[#787774] transition-transform group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs max-w-[280px]">
                Override any text shown on graphics individually. Leave empty to use the default language value.
              </TooltipContent>
            </Tooltip>
            <CollapsibleContent className="px-4 pb-4 space-y-3">
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {CUSTOM_LABEL_KEYS.map(({ key, hint }) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-muted-foreground w-2/5 shrink-0 truncate" title={hint}>
                      {key}
                    </span>
                    <input
                      value={settings.customLabels?.[key] ?? ''}
                      onChange={e => update({ customLabels: { ...settings.customLabels, [key]: e.target.value } })}
                      placeholder={hint}
                      className="flex h-7 w-full border border-input bg-background px-2 py-1 text-[11px] font-mono"
                    />
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Style Presets */}
        <Collapsible>
          <div className="border border-[#EAEAEA] bg-white rounded-lg overflow-hidden">
            <Tooltip>
              <TooltipTrigger asChild>
                <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-[#F9F9F8] transition-colors group cursor-pointer">
                  <h3 className="text-xs font-bold tracking-wider uppercase" style={{ color: '#2F3437' }}>Style Presets</h3>
                  <ChevronDown className="w-3.5 h-3.5 text-[#787774] transition-transform group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs max-w-[280px]">
                Quick-apply complete visual styles. <strong style="color:#FF6B00">Feed+</strong> (dark) and <strong style="color:#FF6B00">Feed+ Light</strong> are the platform defaults — precision broadcast aesthetic with orange accent.
              </TooltipContent>
            </Tooltip>
              <CollapsibleContent className="px-4 pb-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {PRESETS.map(p => (
                    <button
                      key={p.name}
                      onClick={() => update(p)}
                      className={`flex items-center gap-3 px-3 py-2 text-xs font-medium border transition-colors text-left ${p.name === 'Feed+' ? 'border-[#FF6B00]/50 bg-[#FF6B00]/5' : 'border-border hover:bg-muted'}`}
                    >
                      <div className="flex gap-0.5">
                        <div className="w-3 h-6" style={{ background: p.primaryColor }} />
                        <div className="w-3 h-6" style={{ background: p.secondaryColor }} />
                        <div className="w-3 h-6" style={{ background: p.accentColor }} />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span style={{ fontFamily: `'${p.fontDisplay}', sans-serif` }} className="font-bold tracking-wider uppercase text-foreground">
                            {p.name}
                          </span>
                          {(p.name === 'Feed+' || p.name === 'Feed+ Light') && (
                            <span className="text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-wider" style={{ background: '#FF6B00', color: '#000' }}>
                              Default
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground">{p.fontDisplay} &middot; {p.cornerStyle}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </CollapsibleContent>
          </div>
        </Collapsible>
      </div>

      {/* RIGHT: live preview + per-graphic transforms */}
      <aside className="space-y-4">
        <div className="p-4 border border-slate-200 bg-white rounded-xl shadow-sm sticky top-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold tracking-wider text-primary uppercase">
              Preview
              <span className="ml-2 text-[10px] font-normal normal-case text-slate-500">
                ({mode === 'rally' ? 'Rally' : 'Circuito'})
              </span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">{Math.round(SCALE * 100)}%</span>
          </div>

          {/* Graphic selector */}
          <div className="grid grid-cols-4 gap-1">
            {graphics.map(g => {
              const isLive = liveGraphics?.has(g.id);
              return (
                <button
                  key={g.id}
                  onClick={() => setSelected(g.id)}
                  className={`relative px-2 py-1.5 text-[11px] uppercase font-bold tracking-wider border rounded-md transition-all ${
                    selected === g.id
                      ? 'border-primary bg-primary text-white shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {isLive && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-rally-red rounded-full animate-pulse-live" />
                  )}
                  {g.label}
                </button>
              );
            })}
          </div>

          {/* Preview canvas */}
          <div
            className="relative overflow-hidden border-2 border-slate-200 rounded-lg select-none shadow-inner"
            style={{
              width: PREVIEW_W,
              height: PREVIEW_H,
              background: 'repeating-linear-gradient(45deg,#f8fafc,#f8fafc 10px,#f1f5f9 10px,#f1f5f9 20px)',
              cursor: dragging ? 'grabbing' : 'default',
            }}
          >
            <div
              style={{
                width: 1920,
                height: 1080,
                transform: `scale(${SCALE})`,
                transformOrigin: 'top left',
                position: 'relative',
              }}
            >
              {selected === 'scorebug' && <Scorebug data={event} settings={settings} onMouseDown={onMouseDown} />}
              {selected === 'crewLowerThird' && <CrewLowerThird data={crew} settings={settings} onMouseDown={onMouseDown} />}
              {selected === 'stageLowerThird' && <StageLowerThird data={stage} settings={settings} onMouseDown={onMouseDown} />}
              {selected === 'interviewLowerThird' && <InterviewLowerThird data={interview} settings={settings} onMouseDown={onMouseDown} />}
              {selected === 'vsLowerThird' && <VsLowerThird left={vsData.left} right={vsData.right} settings={settings} onMouseDown={onMouseDown} />}
              {selected === 'stageResults' && <StageResults data={stageResults} settings={settings} onMouseDown={onMouseDown} />}
              {selected === 'overallStandings' && <OverallStandings data={overallStandings} settings={settings} onMouseDown={onMouseDown} />}
              {selected === 'headToHead' && <HeadToHead data={headToHead} settings={settings} onMouseDown={onMouseDown} />}
              {selected === 'startList' && <StartList data={startList} settings={settings} onMouseDown={onMouseDown} />}
              {selected === 'entriesList' && <EntriesList data={entries} settings={settings} onMouseDown={onMouseDown} />}
              {selected === 'stageMap' && <StageMap settings={settings} onMouseDown={onMouseDown} />}
              {selected === 'elevationProfile' && <ElevationProfile settings={settings} onMouseDown={onMouseDown} />}
              {selected === 'weather' && <Weather data={weather} settings={settings} onMouseDown={onMouseDown} />}
              {selected === 'sponsorCrawl' && <SponsorCrawl data={sponsors} settings={settings} onMouseDown={onMouseDown} />}
              {selected === 'countdown' && <CountdownTimer data={countdown} settings={settings} onMouseDown={onMouseDown} />}
              {selected === 'rallyIntro' && <RallyIntro data={rallyIntro} settings={settings} onMouseDown={onMouseDown} />}
              {selected === 'stagePresentation' && <StagePresentation data={{ stageNumber: stage.stageNumber, stageName: stage.stageName, distance: stage.distance, surface: stage.surface, totalStages: rallyIntro.stages?.length ?? 1, startTime: '10:30', location: 'Córdoba', logoUrl: event.logoUrl, eventName: event.name }} settings={settings} onMouseDown={onMouseDown} />}
              {selected === 'stageWeather' && <StageWeather data={stageWeather} settings={settings} onMouseDown={onMouseDown} />}
              {selected === 'circuitScorebug' && <CircuitScorebug data={{ series: 'Karting Nacional', round: 'Fecha 4', circuit: 'Zárate Karting', sessionType: 'race', totalLaps: 20, currentLap: 12 }} settings={settings} onMouseDown={onMouseDown} />}
              {selected === 'startGrid' && <StartGrid data={[{ position: 1, carNumber: '1', driverName: 'M. Rossi', team: 'Team Rossi', qualifyingTime: '1:22.100' }, { position: 2, carNumber: '2', driverName: 'J. López', team: 'Team López', qualifyingTime: '1:22.345', gap: '+0.245' }, { position: 3, carNumber: '3', driverName: 'P. García', team: 'Team García', qualifyingTime: '1:22.567', gap: '+0.467' }]} settings={settings} onMouseDown={onMouseDown} />}
              {selected === 'circuitTiming' && <CircuitLiveTiming data={[{ position: 1, carNumber: '1', driverName: 'M. Rossi', team: 'Team Rossi', gap: '', interval: '', lastLap: '1:23.4', bestLap: '1:22.1', lap: 12, pitStops: 1 }, { position: 2, carNumber: '2', driverName: 'J. López', team: 'Team López', gap: '+2.3', interval: '+2.3', lastLap: '1:23.8', bestLap: '1:22.5', lap: 12, pitStops: 1 }]} settings={settings} onMouseDown={onMouseDown} />}
              {selected === 'driverLap' && <DriverLapLowerThird data={{ carNumber: '1', driverName: 'M. Rossi', team: 'Team Rossi', country: '🇮🇹', position: 1, lap: 12, totalLaps: 20, sector: 2, sectorTime: '28.4', lastLap: '1:23.4', bestLap: '1:22.1', gapToLeader: 'LEADER' }} settings={settings} onMouseDown={onMouseDown} />}
              {selected === 'raceFlag' && <RaceFlag data={{ flag: 'green', message: 'TRACK CLEAR', series: 'Karting Nacional', round: 'Fecha 4' }} settings={settings} onMouseDown={onMouseDown} />}
              {selected === 'pitTracker' && <PitTracker data={{ events: [{ id: '1', carNumber: '3', driverName: 'P. García', team: 'Team García', pitTime: '23.4s', positionBefore: 2, positionAfter: 4, status: 'out', lap: 10 }] }} settings={settings} onMouseDown={onMouseDown} />}
              {selected === 'podium' && <Podium data={{ series: 'Karting Nacional', raceName: 'Fecha 4', podium: [{ position: 1, carNumber: '1', driverName: 'M. Rossi', team: 'Team Rossi', country: '🇮🇹', totalTime: '24:31.2', bestLap: '1:22.1' }, { position: 2, carNumber: '2', driverName: 'J. López', team: 'Team López', country: '🇦🇷', totalTime: '24:33.5', bestLap: '1:22.5' }, { position: 3, carNumber: '3', driverName: 'P. García', team: 'Team García', country: '🇪🇸', totalTime: '24:36.1', bestLap: '1:22.8' }] }} settings={settings} onMouseDown={onMouseDown} />}
              {selected === 'finalResults' && <FinalResults data={{ series: 'Karting Nacional', raceName: 'Fecha 4', totalLaps: 20, results: [{ position: 1, carNumber: '1', driverName: 'M. Rossi', team: 'Team Rossi', laps: 20, totalTime: '24:31.2', bestLap: '1:22.1', status: 'finished' }, { position: 2, carNumber: '2', driverName: 'J. López', team: 'Team López', laps: 20, totalTime: '+2.3', bestLap: '1:22.5', status: 'finished' }, { position: 3, carNumber: '3', driverName: 'P. García', team: 'Team García', laps: 20, totalTime: '+4.9', bestLap: '1:22.8', status: 'finished' }] }} settings={settings} onMouseDown={onMouseDown} />}
            </div>

            <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-md text-[10px] uppercase font-bold tracking-wider text-slate-700 pointer-events-none shadow-sm">
              Editing: <span className="text-primary">{graphics.find(g => g.id === selected)?.label}</span>
            </div>
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-md text-[10px] font-mono text-slate-500 pointer-events-none shadow-sm">
              x:{layout.x} y:{layout.y} {layout.width}×{layout.height} α{Math.round(layout.opacity * 100)}% ×{layout.scale.toFixed(2)}
            </div>
          </div>

          {/* Per-graphic layout controls */}
          <div className="space-y-3 p-3 border border-slate-200 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between">
              <Label className="text-xs uppercase font-bold tracking-wider text-slate-700">
                Layout — {graphics.find(g => g.id === selected)?.label}
              </Label>
              <button
                onClick={reset}
                className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 border border-slate-200 rounded-md hover:bg-white transition-colors text-slate-600"
              >
                Reset
              </button>
            </div>

            {/* Visibility toggle */}
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Visible</Label>
              <Switch checked={layout.visible} onCheckedChange={(v) => updateLayout({ visible: v })} />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">X position</Label>
                <span className="text-xs font-mono text-foreground">{layout.x}px</span>
              </div>
              <Slider
                value={[layout.x]}
                onValueChange={([v]) => updateLayout({ x: v })}
                min={0} max={1920} step={1}
                className="mt-1"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Y position</Label>
                <span className="text-xs font-mono text-foreground">{layout.y}px</span>
              </div>
              <Slider
                value={[layout.y]}
                onValueChange={([v]) => updateLayout({ y: v })}
                min={0} max={1080} step={1}
                className="mt-1"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Width</Label>
                <span className="text-xs font-mono text-foreground">{layout.width}px</span>
              </div>
              <Slider
                value={[layout.width]}
                onValueChange={([v]) => updateLayout({ width: v })}
                min={50} max={1920} step={1}
                className="mt-1"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Height</Label>
                <span className="text-xs font-mono text-foreground">{layout.height}px</span>
              </div>
              <Slider
                value={[layout.height]}
                onValueChange={([v]) => updateLayout({ height: v })}
                min={20} max={1080} step={1}
                className="mt-1"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Opacity</Label>
                <span className="text-xs font-mono text-foreground">{Math.round(layout.opacity * 100)}%</span>
              </div>
              <Slider
                value={[layout.opacity * 100]}
                onValueChange={([v]) => updateLayout({ opacity: v / 100 })}
                min={0} max={100} step={5}
                className="mt-1"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Scale</Label>
                <span className="text-xs font-mono text-foreground">×{layout.scale.toFixed(2)}</span>
              </div>
              <Slider
                value={[layout.scale * 100]}
                onValueChange={([v]) => updateLayout({ scale: v / 100 })}
                min={10} max={200} step={1}
                className="mt-1"
              />
            </div>

            {/* Per-graphic color overrides */}
            <div className="pt-3 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs uppercase font-bold tracking-wider text-foreground">Color Override</Label>
                {Object.keys(colorOverride).length > 0 && (
                  <button onClick={() => updateColorOverride({ primaryColor: undefined, secondaryColor: undefined, accentColor: undefined, textColor: undefined })} className="text-[10px] text-muted-foreground hover:text-rally-red">Reset</button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {([
                  ['Primary', 'primaryColor'],
                  ['Secondary', 'secondaryColor'],
                  ['Accent', 'accentColor'],
                  ['Text', 'textColor'],
                ] as const).map(([label, key]) => (
                  <div key={key}>
                    <Label className="text-[10px] text-muted-foreground">{label}</Label>
                    <div className="flex items-center gap-1 mt-0.5">
                      <input
                        type="color"
                        value={(colorOverride as Record<string, string>)[key] ?? settings[key]}
                        onChange={e => updateColorOverride({ [key]: e.target.value } as Partial<GraphicColorOverride>)}
                        className="w-6 h-6 cursor-pointer border-0 bg-transparent p-0"
                      />
                      <Input
                        className="h-6 text-[10px] font-mono"
                        value={(colorOverride as Record<string, string>)[key] ?? settings[key]}
                        onChange={e => updateColorOverride({ [key]: e.target.value } as Partial<GraphicColorOverride>)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground">
            Click &amp; drag to reposition. Use sliders for precise position, size, opacity, and scale of each graphic.
          </p>

          {/* Layout Presets */}
          <Collapsible open={showPresets} onOpenChange={setShowPresets} className="mt-4 p-4 border border-slate-200 bg-white rounded-xl shadow-sm">
            <CollapsibleTrigger className="flex items-center justify-between w-full text-xs font-bold tracking-wider text-primary uppercase">
              <span>Layout Presets</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showPresets ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-3">
              <div className="flex gap-2">
                <Input value={presetName} onChange={e => setPresetName(e.target.value)} placeholder="Nombre del preset" className="h-8 text-xs" />
                <button onClick={saveLayoutPreset} className="h-8 px-3 text-xs font-bold bg-primary text-primary-foreground flex items-center gap-1 rounded-md">
                  <Save className="w-3 h-3" /> GUARDAR
                </button>
              </div>

              <div className="flex gap-2">
                <button onClick={exportLayouts} className="flex-1 h-8 text-xs font-bold bg-secondary text-secondary-foreground flex items-center justify-center gap-1 rounded-md hover:opacity-80">
                  <Upload className="w-3 h-3" /> Exportar
                </button>
                <button onClick={importLayouts} className="flex-1 h-8 text-xs font-bold bg-secondary text-secondary-foreground flex items-center justify-center gap-1 rounded-md hover:opacity-80">
                  <Upload className="w-3 h-3 rotate-180" /> Importar
                </button>
              </div>

              {layoutPresets.length === 0 ? (
                <p className="text-[11px] text-muted-foreground">Sin presets guardados.</p>
              ) : (
                <div className="space-y-1">
                  {layoutPresets.map(p => (
                    <div key={p.name} className="flex items-center gap-2 text-xs bg-muted/50 px-2 py-1.5 rounded">
                      <span className="flex-1 font-bold">{p.name}</span>
                      <button onClick={() => loadLayoutPreset(p)} className="px-2 py-0.5 text-[10px] bg-primary text-primary-foreground rounded hover:opacity-80">CARGAR</button>
                      <button onClick={() => deleteLayoutPreset(p.name)} className="p-1 text-rally-red hover:opacity-70"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </aside>
    </div>
  );
};

export default SettingsTab;
