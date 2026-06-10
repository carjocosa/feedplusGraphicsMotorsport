import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import GraphicControl from '../GraphicControl';
import type { TransformableGraphic } from '@/types/rally';
import type { LogoBugData } from '@/types/circuit';
import { useToast } from '@/hooks/use-toast';

interface Props {
  onTake: (id: TransformableGraphic, data: LogoBugData) => void;
  onClear: (id: TransformableGraphic) => void;
  liveGraphics: Set<string>;
}

const LogoBugControl = ({ onTake, onClear, liveGraphics }: Props) => {
  const { toast } = useToast();
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [secondaryLogoUrl, setSecondaryLogoUrl] = useState<string | undefined>(undefined);
  const [sponsorUrl, setSponsorUrl] = useState<string | undefined>(undefined);
  const logoRef = useRef<HTMLInputElement>(null);
  const secRef = useRef<HTMLInputElement>(null);
  const spoRef = useRef<HTMLInputElement>(null);

  const read = (file: File, setter: (url: string) => void) => {
    if (file.size > 3 * 1024 * 1024) {
      toast({ title: 'Archivo muy grande', description: 'Máximo 3MB' });
      return;
    }
    const r = new FileReader();
    r.onload = () => setter(r.result as string);
    r.readAsDataURL(file);
  };

  const handleTake = () => {
    if (!logoUrl && !secondaryLogoUrl && !sponsorUrl) {
      toast({ title: 'Sin logos', description: 'Subí al menos un logo para mostrar' });
      return;
    }
    onTake('logoBug', { logoUrl, secondaryLogoUrl, sponsorUrl });
  };

  return (
    <div className="p-4 border border-border bg-card space-y-3">
      <h3 className="text-sm font-bold tracking-wider text-primary uppercase">Logo Bug</h3>
      <p className="text-[10px] text-muted-foreground -mt-2">
        Logos persistentes en pantalla durante la carrera. Si no hay ninguno, no se muestra nada.
      </p>

      <div>
        <Label className="text-xs">Logo principal (evento/series)</Label>
        <input ref={logoRef} type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) read(f, setLogoUrl); }} style={{ display: 'none' }} />
        <div className="flex items-center gap-2 mt-1">
          <Button variant="outline" size="sm" onClick={() => logoRef.current?.click()}>{logoUrl ? 'Cambiar' : 'Subir'}</Button>
          {logoUrl && <Button variant="ghost" size="sm" onClick={() => setLogoUrl(undefined)}>Quitar</Button>}
        </div>
        {logoUrl && <img src={logoUrl} alt="" style={{ height: 28, marginTop: 4 }} />}
      </div>

      <div>
        <Label className="text-xs">Logo secundario (categoría)</Label>
        <input ref={secRef} type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) read(f, setSecondaryLogoUrl); }} style={{ display: 'none' }} />
        <div className="flex items-center gap-2 mt-1">
          <Button variant="outline" size="sm" onClick={() => secRef.current?.click()}>{secondaryLogoUrl ? 'Cambiar' : 'Subir'}</Button>
          {secondaryLogoUrl && <Button variant="ghost" size="sm" onClick={() => setSecondaryLogoUrl(undefined)}>Quitar</Button>}
        </div>
        {secondaryLogoUrl && <img src={secondaryLogoUrl} alt="" style={{ height: 28, marginTop: 4 }} />}
      </div>

      <div>
        <Label className="text-xs">Sponsor</Label>
        <input ref={spoRef} type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) read(f, setSponsorUrl); }} style={{ display: 'none' }} />
        <div className="flex items-center gap-2 mt-1">
          <Button variant="outline" size="sm" onClick={() => spoRef.current?.click()}>{sponsorUrl ? 'Cambiar' : 'Subir'}</Button>
          {sponsorUrl && <Button variant="ghost" size="sm" onClick={() => setSponsorUrl(undefined)}>Quitar</Button>}
        </div>
        {sponsorUrl && <img src={sponsorUrl} alt="" style={{ height: 28, marginTop: 4 }} />}
      </div>

      {logoUrl || secondaryLogoUrl || sponsorUrl ? (
        <div style={{
          background: '#0a0a0a',
          borderRadius: 4,
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          {[logoUrl, secondaryLogoUrl, sponsorUrl].filter(Boolean).map((u, i) => (
            <img key={i} src={u} alt="" style={{ height: i === 2 ? 20 : 26, objectFit: 'contain' }} />
          ))}
        </div>
      ) : null}

      <GraphicControl
        label="Logo Bug"
        graphicId={'logoBug'}
        onTake={handleTake}
        onClear={() => onClear('logoBug')}
        isLive={liveGraphics.has('logoBug')}
      />
    </div>
  );
};

export default LogoBugControl;
