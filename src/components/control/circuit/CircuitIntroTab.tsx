import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GraphicControl from '../GraphicControl';
import { useCircuitStore } from '@/store/circuitStore';
import type { TransformableGraphic } from '@/types/rally';
import type { CircuitIntroData } from '@/types/circuit';
import { useToast } from '@/hooks/use-toast';

interface Props {
  onTake: (id: TransformableGraphic, data: CircuitIntroData) => void;
  onClear: (id: TransformableGraphic) => void;
  liveGraphics: Set<string>;
}

const SESSION_LABELS: Record<string, string> = {
  practice: 'Práctica',
  qualifying: 'Clasificación',
  race: 'Carrera',
  sprint: 'Sprint',
  feature: 'Feature',
};

const CircuitIntroTab = ({ onTake, onClear, liveGraphics }: Props) => {
  const { toast } = useToast();
  const storeEvent = useCircuitStore(s => s.event);
  const setEvent = useCircuitStore(s => s.setEvent);

  const [eventName, setEventName] = useState(storeEvent.circuit || '');
  const [series, setSeries] = useState(storeEvent.series || '');
  const [round, setRound] = useState(storeEvent.round || '');
  const [circuit, setCircuit] = useState(storeEvent.circuit || '');
  const [place, setPlace] = useState('');
  const [date, setDate] = useState('');
  const [session, setSession] = useState(SESSION_LABELS[storeEvent.sessionType] || '');
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined);
  const [trackMapUrl, setTrackMapUrl] = useState<string | undefined>(undefined);
  const imgRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLInputElement>(null);

  const readFile = (file: File, setter: (url: string) => void, maxMB: number) => {
    if (file.size > maxMB * 1024 * 1024) {
      toast({ title: 'Archivo muy grande', description: `Máximo ${maxMB}MB` });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setter(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleTake = () => {
    const data: CircuitIntroData = {
      eventName: eventName || circuit,
      series,
      round,
      circuit,
      place,
      date,
      session,
      imageUrl,
      videoUrl,
      trackMapUrl,
    };
    onTake('circuitIntro', data);
  };

  const onChangeSeries = (v: string) => { setSeries(v); setEvent({ series: v }); };
  const onChangeRound = (v: string) => { setRound(v); setEvent({ round: v }); };
  const onChangeCircuit = (v: string) => { setCircuit(v); setEvent({ circuit: v }); };
  const onChangeSession = (v: string) => { setSession(v); };

  const hasBg = !!(imageUrl || videoUrl);

  return (
    <div className="space-y-4">
      <GraphicControl
        label="Intro Circuito"
        graphic="circuitIntro"
        onTake={handleTake}
        onClear={() => onClear('circuitIntro')}
        isLive={liveGraphics.has('circuitIntro')}
      >
        <div className="space-y-4">
          {/* INFO PRINCIPAL */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Info del evento</h4>
            <div className="space-y-2">
              <div>
                <Label>Nombre del evento <span className="text-slate-400 text-[10px]">(se muestra en grande)</span></Label>
                <Input value={eventName} onChange={e => setEventName(e.target.value)} placeholder="Gran Premio..." />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Serie / Categoría</Label>
                  <Input value={series} onChange={e => onChangeSeries(e.target.value)} placeholder="Karting Nacional" />
                </div>
                <div>
                  <Label>Fecha</Label>
                  <Input value={round} onChange={e => onChangeRound(e.target.value)} placeholder="Fecha 4" />
                </div>
              </div>
            </div>
          </div>

          {/* UBICACION */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Ubicación</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Circuito</Label>
                <Input value={circuit} onChange={e => onChangeCircuit(e.target.value)} placeholder="Zárate Karting" />
              </div>
              <div>
                <Label>Localidad</Label>
                <Input value={place} onChange={e => setPlace(e.target.value)} placeholder="Buenos Aires" />
              </div>
            </div>
          </div>

          {/* SESION */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Sesión</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Tipo de sesión</Label>
                <Input value={session} onChange={e => onChangeSession(e.target.value)} placeholder="Carrera Final" />
              </div>
              <div>
                <Label>Fecha del evento</Label>
                <Input value={date} onChange={e => setDate(e.target.value)} placeholder="15-16 Jun 2026" />
              </div>
            </div>
          </div>

          {/* TRAZADO */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Trazado del circuito {trackMapUrl && <span className="text-green-500 ml-1">✓</span>}
            </h4>
            <p className="text-[10px] text-slate-500 mb-2">Imagen del trazado/pista que se muestra destacada en la intro.</p>
            <input
              ref={mapRef}
              type="file"
              accept="image/*"
              onChange={e => { const f = e.target.files?.[0]; if (f) readFile(f, setTrackMapUrl, 5); }}
              style={{ display: 'none' }}
            />
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => mapRef.current?.click()}>
                {trackMapUrl ? 'Cambiar trazado' : 'Subir trazado'}
              </Button>
              {trackMapUrl && <Button variant="ghost" size="sm" onClick={() => setTrackMapUrl(undefined)}>Quitar</Button>}
            </div>
            {trackMapUrl && (
              <img src={trackMapUrl} alt="trazado"
                style={{ width: '100%', maxHeight: 80, objectFit: 'contain', borderRadius: 4, marginTop: 4 }} />
            )}
          </div>

          {/* BACKGROUND */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Fondo {hasBg && <span className="text-green-500 ml-1">✓</span>}
            </h4>
            <p className="text-[10px] text-slate-500 mb-2">Imagen o video en loop de la pista. Si subís los dos, el video tiene prioridad.</p>
            <div className="space-y-2">
              <div>
                <input
                  ref={imgRef}
                  type="file"
                  accept="image/*"
                  onChange={e => { const f = e.target.files?.[0]; if (f) readFile(f, setImageUrl, 5); }}
                  style={{ display: 'none' }}
                />
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => imgRef.current?.click()}>
                    {imageUrl ? 'Cambiar imagen' : 'Subir imagen'}
                  </Button>
                  {imageUrl && <Button variant="ghost" size="sm" onClick={() => setImageUrl(undefined)}>Quitar</Button>}
                </div>
                {imageUrl && (
                  <img src={imageUrl} alt="" style={{ width: '100%', maxHeight: 60, objectFit: 'cover', borderRadius: 4, marginTop: 4 }} />
                )}
              </div>
              <div>
                <input
                  ref={videoRef}
                  type="file"
                  accept="video/*"
                  onChange={e => { const f = e.target.files?.[0]; if (f) readFile(f, setVideoUrl, 50); }}
                  style={{ display: 'none' }}
                />
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => videoRef.current?.click()}>
                    {videoUrl ? 'Cambiar video' : 'Subir video (loop)'}
                  </Button>
                  {videoUrl && <Button variant="ghost" size="sm" onClick={() => setVideoUrl(undefined)}>Quitar</Button>}
                </div>
                {videoUrl && (
                  <video src={videoUrl} muted autoPlay loop playsInline
                    style={{ width: '100%', maxHeight: 60, objectFit: 'cover', borderRadius: 4, marginTop: 4 }} />
                )}
              </div>
            </div>
          </div>

          {/* PREVIEW */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Vista previa</h4>
            <div style={{
              background: '#0a0a0a',
              borderRadius: 6,
              padding: '16px 20px',
              fontSize: 11,
              fontFamily: 'monospace',
              color: '#ccc',
              lineHeight: 1.6,
            }}>
              <div style={{ color: '#FF6B00', fontWeight: 700, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                {series || 'SERIE'}
              </div>
              <div style={{ color: '#666', fontSize: 10, textTransform: 'uppercase' }}>
                {round || 'FECHA'}
              </div>
              <div style={{ width: 24, height: 2, background: '#FF6B00', margin: '6px 0' }} />
              <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>
                {eventName || circuit || 'NOMBRE DEL EVENTO'}
              </div>
              {circuit && eventName && (
                <div style={{ color: '#666', fontSize: 10, textTransform: 'uppercase' }}>
                  {circuit}
                </div>
              )}
              <div style={{ marginTop: 6, display: 'flex', gap: 12 }}>
                {place && <span style={{ color: '#666' }}>{place}</span>}
                {date && <span style={{ color: '#666' }}>{date}</span>}
                {session && <span style={{ color: '#FF6B00', opacity: 0.7 }}>{session}</span>}
              </div>
            </div>
          </div>
        </div>
      </GraphicControl>
    </div>
  );
};

export default CircuitIntroTab;
