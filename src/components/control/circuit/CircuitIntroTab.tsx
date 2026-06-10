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
  const imgRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const readFile = (file: File, setter: (url: string) => void, maxMB: number) => {
    if (file.size > maxMB * 1024 * 1024) {
      toast({ title: 'File too large', description: `Max ${maxMB}MB` });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setter(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleTake = () => {
    const data: CircuitIntroData = {
      eventName,
      series,
      round,
      circuit,
      place,
      date,
      session,
      imageUrl,
      videoUrl,
    };
    onTake('circuitIntro', data);
  };

  const onChangeSeries = (v: string) => { setSeries(v); setEvent({ series: v }); };
  const onChangeRound = (v: string) => { setRound(v); setEvent({ round: v }); };
  const onChangeCircuit = (v: string) => { setCircuit(v); setEvent({ circuit: v }); };
  const onChangeSession = (v: string) => { setSession(v); }; // session is intro-specific, not in store

  return (
    <div className="space-y-4">
      <GraphicControl
        label="Circuit Intro"
        graphic="circuitIntro"
        onTake={handleTake}
        onClear={() => onClear('circuitIntro')}
        isLive={liveGraphics.has('circuitIntro')}
      >
        <div className="space-y-3">
          <div>
            <Label>Event name</Label>
            <Input value={eventName} onChange={e => setEventName(e.target.value)} placeholder="Gran Premio..." />
          </div>
          <div>
            <Label>Series</Label>
            <Input value={series} onChange={e => onChangeSeries(e.target.value)} placeholder="Karting Nacional" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Round</Label>
              <Input value={round} onChange={e => onChangeRound(e.target.value)} placeholder="Fecha 4" />
            </div>
            <div>
              <Label>Circuit</Label>
              <Input value={circuit} onChange={e => onChangeCircuit(e.target.value)} placeholder="Zárate Karting" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Place</Label>
              <Input value={place} onChange={e => setPlace(e.target.value)} placeholder="Buenos Aires" />
            </div>
            <div>
              <Label>Date</Label>
              <Input value={date} onChange={e => setDate(e.target.value)} placeholder="15-16 Jun 2026" />
            </div>
          </div>
          <div>
            <Label>Session</Label>
            <Input value={session} onChange={e => onChangeSession(e.target.value)} placeholder="Carrera Final" />
          </div>

          <div>
            <Label>Background image</Label>
            <input
              ref={imgRef}
              type="file"
              accept="image/*"
              onChange={e => { const f = e.target.files?.[0]; if (f) readFile(f, setImageUrl, 5); }}
              style={{ display: 'none' }}
            />
            <div className="flex gap-2 mt-1">
              <Button variant="outline" size="sm" onClick={() => imgRef.current?.click()}>
                {imageUrl ? 'Change' : 'Upload image'}
              </Button>
              {imageUrl && (
                <Button variant="outline" size="sm" onClick={() => setImageUrl(undefined)}>
                  Remove
                </Button>
              )}
            </div>
            {imageUrl && (
              <img
                src={imageUrl}
                alt="preview"
                style={{ width: '100%', maxHeight: 80, objectFit: 'cover', borderRadius: 4, marginTop: 4 }}
              />
            )}
          </div>

          <div>
            <Label>Background video (loop)</Label>
            <input
              ref={videoRef}
              type="file"
              accept="video/*"
              onChange={e => { const f = e.target.files?.[0]; if (f) readFile(f, setVideoUrl, 50); }}
              style={{ display: 'none' }}
            />
            <div className="flex gap-2 mt-1">
              <Button variant="outline" size="sm" onClick={() => videoRef.current?.click()}>
                {videoUrl ? 'Change' : 'Upload video'}
              </Button>
              {videoUrl && (
                <Button variant="outline" size="sm" onClick={() => setVideoUrl(undefined)}>
                  Remove
                </Button>
              )}
            </div>
            {videoUrl && (
              <video
                src={videoUrl}
                muted
                autoPlay
                loop
                playsInline
                style={{ width: '100%', maxHeight: 80, objectFit: 'cover', borderRadius: 4, marginTop: 4 }}
              />
            )}
          </div>
        </div>
      </GraphicControl>
    </div>
  );
};

export default CircuitIntroTab;
