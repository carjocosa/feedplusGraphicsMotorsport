import { useRallyStore } from '@/store/rallyStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import GraphicControl from './GraphicControl';
import type { GraphicType, StageInfo, StagePresentationData, StageMapPoint } from '@/types/rally';
import { Plus, Trash2, Play, MapPin } from 'lucide-react';
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Props {
  onTake: (id: GraphicType, data: any) => void;
  onClear: (id: GraphicType) => void;
  liveGraphics: Set<string>;
}

const IntroTab = ({ onTake, onClear, liveGraphics }: Props) => {
  const { rallyIntro, setRallyIntro, addStage, updateStage, removeStage, stageWeather, setStageWeather } = useRallyStore();
  const [showMiniMapByStage, setShowMiniMapByStage] = useState<Record<number, boolean>>({});
  const [stageVariantByIndex, setStageVariantByIndex] = useState<Record<number, 'fullscreen' | 'board'>>({});
  const [mapEditorOpen, setMapEditorOpen] = useState<number | null>(null);
  const [openStages, setOpenStages] = useState<Record<number, boolean>>({});

  const takeStagePresentation = (s: StageInfo, idx: number) => {
    const data: StagePresentationData = {
      ...s,
      totalStages: rallyIntro.totalStages || rallyIntro.stages.length,
      showMiniMap: showMiniMapByStage[idx] ?? false,
      variant: stageVariantByIndex[idx] ?? 'fullscreen',
      logoUrl: rallyIntro.logoUrl,
      eventName: rallyIntro.eventName,
    };
    onTake('stagePresentation', data);
  };

  const updateMapPoint = (stageIdx: number, pointIdx: number, patch: Partial<StageMapPoint>) => {
    const stage = rallyIntro.stages[stageIdx];
    const points = [...(stage.mapPoints ?? [])];
    points[pointIdx] = { ...points[pointIdx], ...patch };
    updateStage(stageIdx, { mapPoints: points });
  };
  const addMapPoint = (stageIdx: number) => {
    const stage = rallyIntro.stages[stageIdx];
    const points = [...(stage.mapPoints ?? []), { km: 0, label: 'Punto clave', type: 'split' as const }];
    updateStage(stageIdx, { mapPoints: points });
  };
  const removeMapPoint = (stageIdx: number, pointIdx: number) => {
    const stage = rallyIntro.stages[stageIdx];
    const points = (stage.mapPoints ?? []).filter((_, i) => i !== pointIdx);
    updateStage(stageIdx, { mapPoints: points });
  };

  const sendWeatherWithPresentation = (s: StageInfo, idx: number) => {
    setStageWeather({ stageNumber: s.stageNumber, stageName: s.stageName });
    onTake('stageWeather', {
      ...stageWeather,
      stageNumber: s.stageNumber,
      stageName: s.stageName,
      logoUrl: rallyIntro.logoUrl,
      eventName: rallyIntro.eventName,
    });
    setTimeout(() => takeStagePresentation(s, idx), 250);
  };

  return (
    <div className="space-y-6">
      {/* Rally Intro card */}
      <div className="space-y-4 p-4 border border-border bg-card">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold tracking-wider text-primary uppercase">
            Pantalla de Inicio de Transmisión
          </h3>
          <span className="text-xs text-muted-foreground font-rajdhani">
            Apertura full-screen del rally
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Nombre del Evento</Label>
            <Input value={rallyIntro.eventName} onChange={(e) => setRallyIntro({ eventName: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Edición</Label>
            <Input value={rallyIntro.edition ?? ''} onChange={(e) => setRallyIntro({ edition: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Localización</Label>
            <Input value={rallyIntro.location} onChange={(e) => setRallyIntro({ location: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Fechas</Label>
            <Input value={rallyIntro.dates} onChange={(e) => setRallyIntro({ dates: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Distancia Total</Label>
            <Input value={rallyIntro.totalDistance} onChange={(e) => setRallyIntro({ totalDistance: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Superficie</Label>
            <Input value={rallyIntro.surface} onChange={(e) => setRallyIntro({ surface: e.target.value })} />
          </div>
          <div className="col-span-2">
            <Label className="text-xs text-muted-foreground">Tagline / Headline</Label>
            <Textarea
              rows={2}
              value={rallyIntro.headline ?? ''}
              onChange={(e) => setRallyIntro({ headline: e.target.value })}
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border/40 pt-3">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Variante</Label>
            <div className="flex rounded overflow-hidden border border-input">
              <button
                className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${(rallyIntro.variant ?? 'fullscreen') === 'fullscreen' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground'}`}
                onClick={() => setRallyIntro({ variant: 'fullscreen' })}
              >
                Fullscreen
              </button>
              <button
                className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${rallyIntro.variant === 'board' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground'}`}
                onClick={() => setRallyIntro({ variant: 'board' })}
              >
                Board
              </button>
            </div>
          </div>
          <GraphicControl
            label={`Rally Intro — ${rallyIntro.eventName} (${rallyIntro.stages.length} SS)`}
            graphicId="rallyIntro"
            onTake={() => onTake('rallyIntro', { ...rallyIntro, totalStages: rallyIntro.stages.length })}
            onClear={onClear}
            isLive={liveGraphics.has('rallyIntro')}
          />
        </div>
      </div>

      {/* Stages list */}
      <div className="space-y-3 p-4 border border-border bg-card">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold tracking-wider text-primary uppercase">
            Especiales de Velocidad ({rallyIntro.stages.length})
          </h3>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              addStage({
                stageNumber: rallyIntro.stages.length + 1,
                stageName: 'Nueva Especial',
                distance: '0.00 km',
                surface: 'gravel',
              })
            }
          >
            <Plus className="w-3 h-3 mr-1" />
            Añadir SS
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Edita los detalles técnicos de cada SS. Usa <strong>PRESENTAR</strong> para enviar la pantalla
          introductoria estilo WRC al overlay.
        </p>

        <div className="space-y-3">
          {rallyIntro.stages.map((s, i) => {
            const liveId = `stagePresentation-${s.stageNumber}`;
            const isLive = liveGraphics.has('stagePresentation');
            return (
              <Collapsible
                key={i}
                open={openStages[i] ?? false}
                onOpenChange={(v) => setOpenStages(prev => ({ ...prev, [i]: v }))}
                className="border border-border/60 bg-background/40"
              >
                <CollapsibleTrigger className="w-full p-3 cursor-pointer hover:bg-accent/20 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-3 h-3 text-muted-foreground transition-transform"
                        style={{ transform: openStages[i] ? 'rotate(90deg)' : 'rotate(0deg)' }}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M9 18L15 12L9 6" />
                      </svg>
                      <span className="px-2 py-0.5 text-xs font-bold bg-primary text-primary-foreground">
                        SS{s.stageNumber}
                      </span>
                      <span className="text-sm font-medium">{s.stageName}</span>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1 text-[10px] uppercase text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <Switch
                          checked={showMiniMapByStage[i] ?? false}
                          onCheckedChange={(v) => setShowMiniMapByStage((prev) => ({ ...prev, [i]: v }))}
                        />
                      </div>
                      <div className="flex rounded overflow-hidden border border-input">
                        <button
                          className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${(stageVariantByIndex[i] ?? 'fullscreen') === 'fullscreen' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground'}`}
                          onClick={() => setStageVariantByIndex(prev => ({ ...prev, [i]: 'fullscreen' }))}
                        >
                          Full
                        </button>
                        <button
                          className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${stageVariantByIndex[i] === 'board' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground'}`}
                          onClick={() => setStageVariantByIndex(prev => ({ ...prev, [i]: 'board' }))}
                        >
                          Board
                        </button>
                      </div>
                      <Button size="sm" variant="destructive" onClick={() => onClear('stagePresentation')}>
                        CLEAR
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => sendWeatherWithPresentation(s, i)}
                        variant="secondary"
                        title="Envía Clima del SS y luego Presentación"
                      >
                        ⛅+ PRESENTAR
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => takeStagePresentation(s, i)}
                        className="bg-rally-green hover:bg-rally-green/80 text-white"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        PRESENTAR
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => removeStage(i)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent className="px-3 pb-3">
                  <div className="border-t border-border/40 pt-3">
                    <div className="grid grid-cols-6 gap-2">        
                  <div>
                    <Label className="text-[10px] text-muted-foreground uppercase">SS#</Label>
                    <Input
                      type="number"
                      value={s.stageNumber}
                      onChange={(e) => updateStage(i, { stageNumber: +e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-[10px] text-muted-foreground uppercase">Nombre</Label>
                    <Input value={s.stageName} onChange={(e) => updateStage(i, { stageName: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground uppercase">Distancia</Label>
                    <Input value={s.distance} onChange={(e) => updateStage(i, { distance: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground uppercase">Superficie</Label>
                    <select
                      value={s.surface}
                      onChange={(e) => updateStage(i, { surface: e.target.value as any })}
                      className="flex h-10 w-full border border-input bg-background px-2 text-sm"
                    >
                      <option value="gravel">Tierra</option>
                      <option value="asphalt">Asfalto</option>
                      <option value="snow">Nieve</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground uppercase">Salida</Label>
                    <Input
                      value={s.startTime ?? ''}
                      onChange={(e) => updateStage(i, { startTime: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-[10px] text-muted-foreground uppercase">Localidad</Label>
                    <Input
                      value={s.location ?? ''}
                      onChange={(e) => updateStage(i, { location: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-[10px] text-muted-foreground uppercase">Récord</Label>
                    <Input
                      value={s.recordTime ?? ''}
                      placeholder="00:00.0"
                      onChange={(e) => updateStage(i, { recordTime: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-[10px] text-muted-foreground uppercase">Récord por</Label>
                    <Input
                      value={s.recordHolder ?? ''}
                      onChange={(e) => updateStage(i, { recordHolder: e.target.value })}
                    />
                  </div>
                  <div className="col-span-6">
                    <Label className="text-[10px] text-muted-foreground uppercase">Notas técnicas</Label>
                    <Input
                      value={s.notes ?? ''}
                      placeholder="Curvas técnicas, jumps, altitud…"
                      onChange={(e) => updateStage(i, { notes: e.target.value })}
                    />
                  </div>
                </div>

                {mapEditorOpen === i && (
                  <div className="mt-2 p-3 border border-dashed border-border/60 bg-background/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] uppercase text-muted-foreground">
                        Puntos clave del recorrido (KM, etiqueta, tipo)
                      </Label>
                      <Button size="sm" variant="outline" onClick={() => addMapPoint(i)}>
                        <Plus className="w-3 h-3 mr-1" /> Punto
                      </Button>
                    </div>
                    {(s.mapPoints ?? []).length === 0 && (
                      <p className="text-[10px] text-muted-foreground">Sin puntos aún. Agrega splits, saltos, curvas…</p>
                    )}
                    {(s.mapPoints ?? []).map((p, pi) => (
                      <div key={pi} className="grid grid-cols-12 gap-2 items-center">
                        <Input
                          className="col-span-2 h-8 text-xs"
                          type="number"
                          value={p.km}
                          onChange={(e) => updateMapPoint(i, pi, { km: +e.target.value })}
                          placeholder="KM"
                        />
                        <Input
                          className="col-span-6 h-8 text-xs"
                          value={p.label}
                          onChange={(e) => updateMapPoint(i, pi, { label: e.target.value })}
                          placeholder="Etiqueta"
                        />
                        <select
                          value={p.type ?? 'split'}
                          onChange={(e) => updateMapPoint(i, pi, { type: e.target.value as any })}
                          className="col-span-3 h-8 border border-input bg-background text-xs px-2"
                        >
                          <option value="split">Split</option>
                          <option value="jump">Salto</option>
                          <option value="hairpin">Horquilla</option>
                          <option value="water">Agua</option>
                          <option value="finish">Meta</option>
                        </select>
                        <Button size="sm" variant="ghost" className="col-span-1" onClick={() => removeMapPoint(i, pi)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>

        <div className="pt-2 border-t border-border/40">
          <GraphicControl
            label="Stage Presentation (limpia overlay)"
            graphicId="stagePresentation"
            onTake={() => {
              const first = rallyIntro.stages[0];
              if (first) takeStagePresentation(first, 0);
            }}
            onClear={onClear}
            isLive={liveGraphics.has('stagePresentation')}
          />
        </div>
      </div>

      {/* Stage Weather card */}
      <div className="space-y-3 p-4 border border-border bg-card">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold tracking-wider text-primary uppercase">
            Clima del Tramo
          </h3>
          <span className="text-xs text-muted-foreground font-rajdhani">
            Pantalla full-screen del SS — enviable junto a la presentación
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">SS#</Label>
            <Input type="number" value={stageWeather.stageNumber} onChange={(e) => setStageWeather({ stageNumber: +e.target.value })} />
          </div>
          <div className="col-span-2">
            <Label className="text-xs text-muted-foreground">Nombre del SS</Label>
            <Input value={stageWeather.stageName} onChange={(e) => setStageWeather({ stageName: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Condición</Label>
            <select
              value={stageWeather.condition}
              onChange={(e) => setStageWeather({ condition: e.target.value as any })}
              className="flex h-10 w-full border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="sunny">☀️ Soleado</option>
              <option value="cloudy">☁️ Nublado</option>
              <option value="rainy">🌧️ Lluvia</option>
              <option value="snowy">🌨️ Nieve</option>
              <option value="foggy">🌫️ Niebla</option>
            </select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Temperatura °C</Label>
            <Input type="number" value={stageWeather.temperature} onChange={(e) => setStageWeather({ temperature: +e.target.value })} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Viento</Label>
            <Input value={stageWeather.windSpeed} onChange={(e) => setStageWeather({ windSpeed: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Humedad</Label>
            <Input value={stageWeather.humidity ?? ''} onChange={(e) => setStageWeather({ humidity: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Precipitación</Label>
            <Input value={stageWeather.precipitation ?? ''} onChange={(e) => setStageWeather({ precipitation: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Visibilidad</Label>
            <Input value={stageWeather.visibility ?? ''} onChange={(e) => setStageWeather({ visibility: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Estado de pista</Label>
            <Input value={stageWeather.trackCondition ?? ''} onChange={(e) => setStageWeather({ trackCondition: e.target.value })} />
          </div>
          <div className="col-span-3">
            <Label className="text-xs text-muted-foreground">Pronóstico corto</Label>
            <Textarea
              rows={2}
              value={stageWeather.shortForecast ?? ''}
              onChange={(e) => setStageWeather({ shortForecast: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Pronóstico por hora (máx 4)</Label>
          {(stageWeather.forecast ?? []).map((f, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <Input
                className="col-span-3 h-8 text-xs"
                value={f.time}
                onChange={(e) => {
                  const arr = [...(stageWeather.forecast ?? [])];
                  arr[i] = { ...arr[i], time: e.target.value };
                  setStageWeather({ forecast: arr });
                }}
              />
              <select
                value={f.condition}
                onChange={(e) => {
                  const arr = [...(stageWeather.forecast ?? [])];
                  arr[i] = { ...arr[i], condition: e.target.value as any };
                  setStageWeather({ forecast: arr });
                }}
                className="col-span-5 h-8 border border-input bg-background text-xs px-2"
              >
                <option value="sunny">☀️</option>
                <option value="cloudy">☁️</option>
                <option value="rainy">🌧️</option>
                <option value="snowy">🌨️</option>
                <option value="foggy">🌫️</option>
              </select>
              <Input
                className="col-span-3 h-8 text-xs"
                type="number"
                value={f.temperature}
                onChange={(e) => {
                  const arr = [...(stageWeather.forecast ?? [])];
                  arr[i] = { ...arr[i], temperature: +e.target.value };
                  setStageWeather({ forecast: arr });
                }}
              />
              <Button
                size="sm"
                variant="ghost"
                className="col-span-1"
                onClick={() => setStageWeather({ forecast: (stageWeather.forecast ?? []).filter((_, x) => x !== i) })}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
          {(stageWeather.forecast?.length ?? 0) < 4 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setStageWeather({
                  forecast: [...(stageWeather.forecast ?? []), { time: '00:00', condition: 'sunny', temperature: 20 }],
                })
              }
            >
              <Plus className="w-3 h-3 mr-1" /> Slot de pronóstico
            </Button>
          )}
        </div>

        <GraphicControl
          label={`Clima · SS${stageWeather.stageNumber} ${stageWeather.stageName}`}
          graphicId="stageWeather"
          onTake={() => onTake('stageWeather', { ...stageWeather, logoUrl: rallyIntro.logoUrl, eventName: rallyIntro.eventName })}
          onClear={onClear}
          isLive={liveGraphics.has('stageWeather')}
        />
      </div>
    </div>
  );
};

export default IntroTab;
