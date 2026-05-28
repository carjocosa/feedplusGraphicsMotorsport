import { useRallyStore } from '@/store/rallyStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import GraphicControl from './GraphicControl';
import type { GraphicType } from '@/types/rally';
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react';

interface Props {
  onTake: (id: GraphicType, data: any) => void;
  onClear: (id: GraphicType) => void;
  liveGraphics: Set<string>;
}

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const BrandingTab = ({ onTake, onClear, liveGraphics }: Props) => {
  const {
    event,
    setEvent,
    sponsors,
    setSponsors,
    countdown,
    setCountdown,
    rallyIntro,
    setRallyIntro,
  } = useRallyStore();

  const addSponsor = () => setSponsors([...sponsors, { name: 'New Sponsor' }]);
  const removeSponsor = (i: number) => setSponsors(sponsors.filter((_, idx) => idx !== i));

  const handleRallyLogo = async (file: File) => {
    const dataUrl = await fileToDataUrl(file);
    setRallyIntro({ logoUrl: dataUrl });
    // Sync to scorebug payload too
    setEvent({ logoUrl: dataUrl });
  };

  const handleSponsorLogo = async (i: number, file: File) => {
    const dataUrl = await fileToDataUrl(file);
    const updated = [...sponsors];
    updated[i] = { ...updated[i], logoUrl: dataUrl };
    setSponsors(updated);
  };

  return (
    <div className="space-y-6">
      {/* Rally placa */}
      <div className="space-y-3 p-4 border border-border bg-card">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold tracking-wider text-primary uppercase">
            Logo / Placa del Rally
          </h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Se muestra en la pantalla de inicio, en cada presentación de SS, en el parte meteorológico
          y en el Scorebug. PNG con fondo transparente recomendado.
        </p>

        <div className="flex items-center gap-4">
          <div
            className="flex items-center justify-center border border-border bg-background/40"
            style={{ width: 160, height: 90 }}
          >
            {rallyIntro.logoUrl ? (
              <img
                src={rallyIntro.logoUrl}
                alt="Rally logo"
                style={{ maxHeight: 80, maxWidth: 150, objectFit: 'contain' }}
              />
            ) : (
              <span className="text-[10px] text-muted-foreground">Sin logo</span>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <Label className="text-xs text-muted-foreground">Subir imagen (PNG/SVG/JPG)</Label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleRallyLogo(e.target.files[0])}
              className="text-xs"
            />
            <Label className="text-xs text-muted-foreground">o pegá una URL</Label>
            <Input
              placeholder="https://…/logo.png"
              value={rallyIntro.logoUrl ?? ''}
              onChange={(e) => {
                setRallyIntro({ logoUrl: e.target.value });
                setEvent({ logoUrl: e.target.value });
              }}
            />
            {rallyIntro.logoUrl && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setRallyIntro({ logoUrl: undefined });
                  setEvent({ logoUrl: undefined });
                }}
              >
                <Trash2 className="w-3 h-3 mr-1" /> Quitar logo
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Scorebug */}
      <div className="space-y-3 p-4 border border-border bg-card">
        <h3 className="text-sm font-bold tracking-wider text-primary uppercase">Scorebug</h3>
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-xs text-muted-foreground">Event Name</Label><Input value={event.eventName} onChange={e => setEvent({ eventName: e.target.value })} /></div>
          <div><Label className="text-xs text-muted-foreground">Stage #</Label><Input type="number" value={event.stageNumber} onChange={e => setEvent({ stageNumber: +e.target.value })} /></div>
          <div><Label className="text-xs text-muted-foreground">Stage Name</Label><Input value={event.stageName} onChange={e => setEvent({ stageName: e.target.value })} /></div>
        </div>
        <p className="text-[10px] text-muted-foreground">
          El logo del rally cargado arriba aparecerá automáticamente junto al nombre.
        </p>
        <GraphicControl
          label="Scorebug"
          graphicId="scorebug"
          onTake={() => onTake('scorebug', { ...event, logoUrl: rallyIntro.logoUrl })}
          onClear={onClear}
          isLive={liveGraphics.has('scorebug')}
        />
      </div>

      {/* Stinger */}
      <div className="space-y-3 p-4 border border-border bg-card">
        <h3 className="text-sm font-bold tracking-wider text-primary uppercase">Transition (Stinger)</h3>
        <p className="text-xs text-muted-foreground">Quick wipe transition with event branding</p>
        <GraphicControl label="Stinger" graphicId="stinger" onTake={() => onTake('stinger', {})} onClear={onClear} isLive={liveGraphics.has('stinger')} />
      </div>

      {/* Sponsor Crawl */}
      <div className="space-y-3 p-4 border border-border bg-card">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold tracking-wider text-primary uppercase">
            Sponsor Crawl (logos)
          </h3>
          <Button size="sm" variant="outline" onClick={addSponsor}>+ Sponsor</Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Subí el logo de cada auspiciante. Si falta, se muestra un cartel tipográfico con el nombre.
          Los logos se renderizan en blanco para que combinen sobre el crawler oscuro.
        </p>

        <div className="space-y-2">
          {sponsors.map((s, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center p-2 border border-border/50 bg-background/30">
              <div
                className="col-span-2 flex items-center justify-center bg-secondary/40 border border-border/40"
                style={{ height: 48 }}
              >
                {s.logoUrl ? (
                  <img
                    src={s.logoUrl}
                    alt={s.name}
                    style={{ maxHeight: 40, maxWidth: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <span className="text-[10px] text-muted-foreground">sin logo</span>
                )}
              </div>
              <Input
                className="col-span-3 h-8 text-xs"
                placeholder="Nombre"
                value={s.name}
                onChange={(e) => {
                  const updated = [...sponsors];
                  updated[i] = { ...updated[i], name: e.target.value };
                  setSponsors(updated);
                }}
              />
              <Input
                className="col-span-4 h-8 text-xs"
                placeholder="URL del logo (opcional)"
                value={s.logoUrl ?? ''}
                onChange={(e) => {
                  const updated = [...sponsors];
                  updated[i] = { ...updated[i], logoUrl: e.target.value };
                  setSponsors(updated);
                }}
              />
              <label className="col-span-2 cursor-pointer">
                <span className="flex items-center justify-center gap-1 h-8 text-[10px] uppercase border border-input hover:bg-accent/30">
                  <Upload className="w-3 h-3" /> Subir
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleSponsorLogo(i, e.target.files[0])}
                />
              </label>
              <button
                onClick={() => removeSponsor(i)}
                className="col-span-1 h-8 text-xs bg-destructive text-destructive-foreground hover:opacity-80"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <GraphicControl
          label="Sponsor Crawl"
          graphicId="sponsorCrawl"
          onTake={() => onTake('sponsorCrawl', sponsors)}
          onClear={onClear}
          isLive={liveGraphics.has('sponsorCrawl')}
        />
      </div>

      {/* Countdown */}
      <div className="space-y-3 p-4 border border-border bg-card">
        <h3 className="text-sm font-bold tracking-wider text-primary uppercase">Countdown Timer</h3>
        <p className="text-xs text-muted-foreground">
          Pone la hora exacta de comienzo. El countdown calcula automáticamente el tiempo restante contra el reloj del sistema.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-xs text-muted-foreground">Label</Label><Input value={countdown.label} onChange={e => setCountdown({ label: e.target.value })} /></div>
          <div>
            <Label className="text-xs text-muted-foreground">Hora de comienzo</Label>
            <Input
              type="time"
              value={countdown.startTime ?? ''}
              onChange={e => {
                const st = e.target.value;
                if (!st) return;
                const [h, m] = st.split(':').map(Number);
                const now = new Date();
                const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
                if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1);
                setCountdown({ startTime: st, targetTime: target.getTime() });
              }}
            />
          </div>
        </div>
        <GraphicControl label="Countdown" graphicId="countdown" onTake={() => onTake('countdown', countdown)} onClear={onClear} isLive={liveGraphics.has('countdown')} />
      </div>
    </div>
  );
};

export default BrandingTab;
