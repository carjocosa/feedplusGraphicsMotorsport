import { useState } from 'react';
import { useRallyStore } from '@/store/rallyStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GraphicControl from './GraphicControl';
import type { GraphicType, GpxRouteData } from '@/types/rally';
import { parseGpx } from '@/lib/gpxParser';
import { Upload, Map, FileText, X } from 'lucide-react';

interface Props {
  onTake: (id: GraphicType, data: Record<string, unknown>) => void;
  onClear: (id: GraphicType) => void;
  liveGraphics: Set<string>;
}

const MapContextTab = ({ onTake, onClear, liveGraphics }: Props) => {
  const { weather, setWeather, rallyIntro, setRallyIntro, stages: _stages, setStages } = useRallyStore();
  const [gpxError, setGpxError] = useState<string | null>(null);
  const [gpxPreview, setGpxPreview] = useState<GpxRouteData | null>(null);

  const handleGpxUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setGpxError(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const xml = ev.target?.result as string;
        const data = parseGpx(xml);
        setGpxPreview(data);

        const stageIdx = rallyIntro.stages.findIndex(s => s.stageName.toLowerCase().includes(data.name.toLowerCase().slice(0, 10)));
        if (stageIdx >= 0) {
          setStages(rallyIntro.stages.map((s, i) => i === stageIdx ? { ...s, gpxData: data } : s));
        } else {
          const updated = [...rallyIntro.stages];
          if (updated.length > 0) {
            updated[0] = { ...updated[0], gpxData: data };
            setStages(updated);
          }
        }
      } catch (err: any) {
        setGpxError(err.message || 'Failed to parse GPX file');
      }
    };
    reader.readAsText(file);
  };

  const clearGpx = () => {
    setGpxPreview(null);
    setGpxError(null);
    setStages(rallyIntro.stages.map(s => ({ ...s, gpxData: undefined })));
  };

  const firstGpxData = rallyIntro.stages.find(s => s.gpxData)?.gpxData;
  const takeWithGpx = (id: string) => onTake(id as any, firstGpxData ? { gpxData: firstGpxData } : {});

  return (
    <div className="space-y-6">
      {/* Weather */}
      <div className="space-y-3 p-4 border border-border bg-card">
        <h3 className="text-sm font-bold tracking-wider text-primary uppercase">Weather</h3>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Condition</Label>
            <select
              value={weather.condition}
              onChange={e => setWeather({ condition: e.target.value as any })}
              className="flex h-10 w-full border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="sunny">☀️ Sunny</option>
              <option value="cloudy">☁️ Cloudy</option>
              <option value="rainy">🌧️ Rainy</option>
              <option value="snowy">🌨️ Snowy</option>
              <option value="foggy">🌫️ Foggy</option>
            </select>
          </div>
          <div><Label className="text-xs text-muted-foreground">Temperature °C</Label><Input type="number" value={weather.temperature} onChange={e => setWeather({ temperature: +e.target.value })} /></div>
          <div><Label className="text-xs text-muted-foreground">Wind</Label><Input value={weather.windSpeed} onChange={e => setWeather({ windSpeed: e.target.value })} /></div>
        </div>
        <GraphicControl label="Weather" graphicId="weather" onTake={() => onTake('weather', weather)} onClear={onClear} isLive={liveGraphics.has('weather')} />
      </div>

      {/* GPX Upload */}
      <div className="space-y-3 p-4 border border-border bg-card">
        <h3 className="text-sm font-bold tracking-wider text-primary uppercase flex items-center gap-2">
          <Map className="w-4 h-4" />
          GPX Route Upload
        </h3>
        <p className="text-xs text-muted-foreground">Upload a GPX file to animate the stage route on the map overlay</p>

        <div className="flex items-center gap-3">
          <label className="flex-1 flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors rounded-lg">
            <Upload className="w-5 h-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Drop GPX file or click to browse</span>
            <input type="file" accept=".gpx" onChange={handleGpxUpload} className="hidden" />
          </label>
        </div>

        {gpxError && (
          <div className="text-xs text-rally-red bg-rally-red/10 border border-rally-red/30 p-2 rounded flex items-center gap-2">
            <X className="w-3 h-3" />
            {gpxError}
          </div>
        )}

        {gpxPreview && (
          <div className="space-y-2 p-3 bg-background/50 border border-border rounded">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-3 h-3 text-primary" />
                <span className="text-xs font-bold text-foreground">{gpxPreview.name}</span>
              </div>
              <button onClick={clearGpx} className="text-[10px] text-muted-foreground hover:text-rally-red">Clear</button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-muted-foreground">
              <span>{gpxPreview.points.length} track points</span>
              {gpxPreview.totalDistance && <span>{(gpxPreview.totalDistance / 1000).toFixed(2)} km</span>}
              {gpxPreview.elevationGain !== undefined && <span>▲ {gpxPreview.elevationGain}m</span>}
            </div>
          </div>
        )}

        <GraphicControl label="Stage Map (GPX)" graphicId="stageMap" onTake={() => takeWithGpx('stageMap')} onClear={onClear} isLive={liveGraphics.has('stageMap')} />
      </div>

      {/* Stage Map (fallback SVG) */}
      <div className="space-y-3 p-4 border border-border bg-card">
        <h3 className="text-sm font-bold tracking-wider text-primary uppercase">Stage Map (SVG Fallback)</h3>
        <p className="text-xs text-muted-foreground">Animated SVG stage route without GPX data</p>
        <GraphicControl label="Stage Map" graphicId="stageMap" onTake={() => takeWithGpx('stageMap')} onClear={onClear} isLive={liveGraphics.has('stageMap')} />
      </div>

      {/* Elevation Profile */}
      <div className="space-y-3 p-4 border border-border bg-card">
        <h3 className="text-sm font-bold tracking-wider text-primary uppercase">Elevation Profile</h3>
        <p className="text-xs text-muted-foreground">Altimetry chart of current stage</p>
        <GraphicControl label="Elevation Profile" graphicId="elevationProfile" onTake={() => takeWithGpx('elevationProfile')} onClear={onClear} isLive={liveGraphics.has('elevationProfile')} />
      </div>
    </div>
  );
};

export default MapContextTab;
