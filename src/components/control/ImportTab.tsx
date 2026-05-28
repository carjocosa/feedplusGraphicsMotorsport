import { useState } from 'react';
import { useRallyStore } from '@/store/rallyStore';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Download, Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Entry, RallyIntroData, StageInfo, StageWeatherData, Sponsor } from '@/types/rally';

const ImportTab = () => {
  const { entries, rallyIntro, stageWeather, sponsors, importBundle } = useRallyStore();
  const [csvText, setCsvText] = useState('');
  const [jsonText, setJsonText] = useState('');
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  // ----- ENTRIES CSV -----
  const importEntriesCSV = () => {
    try {
      const lines = csvText.trim().split('\n').filter((l) => l.trim());
      const data: Entry[] = lines.map((line, i) => {
        const p = line.split(',').map((s) => s.trim());
        return {
          id: `imp-${Date.now()}-${i}`,
          carNumber: p[0] || '',
          driverName: p[1] || '',
          coDriverName: p[2] || '',
          driverCountry: p[3] || '',
          coDriverCountry: p[4] || '',
          team: p[5] || '',
          car: p[6] || '',
          category: p[7] || '',
        };
      });
      importBundle({ entries: data });
      setCsvText('');
      setFeedback({ ok: true, msg: `Importados ${data.length} inscritos.` });
    } catch (e) {
      setFeedback({ ok: false, msg: 'Error parseando CSV.' });
    }
  };

  // ----- FULL JSON BUNDLE -----
  const importFullJSON = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const bundle: {
        entries?: Entry[];
        rallyIntro?: RallyIntroData;
        stageWeather?: StageWeatherData;
        sponsors?: Sponsor[];
      } = {};
      if (Array.isArray(parsed.entries)) bundle.entries = parsed.entries;
      if (parsed.rallyIntro) bundle.rallyIntro = parsed.rallyIntro;
      if (parsed.stageWeather) bundle.stageWeather = parsed.stageWeather;
      if (Array.isArray(parsed.sponsors)) bundle.sponsors = parsed.sponsors;
      importBundle(bundle);
      setJsonText('');
      setFeedback({ ok: true, msg: 'Bundle importado correctamente.' });
    } catch (e) {
      setFeedback({ ok: false, msg: 'JSON inválido.' });
    }
  };

  const handleFile = (file: File, onText: (t: string) => void) => {
    const reader = new FileReader();
    reader.onload = () => onText(String(reader.result || ''));
    reader.readAsText(file);
  };

  const exportFullJSON = () => {
    const bundle = { entries, rallyIntro, stageWeather, sponsors, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rally-bundle-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ----- STAGES CSV -----
  const importStagesCSV = (text: string) => {
    try {
      const lines = text.trim().split('\n').filter((l) => l.trim());
      const stages: StageInfo[] = lines.map((line, i) => {
        const p = line.split(',').map((s) => s.trim());
        return {
          stageNumber: +p[0] || i + 1,
          stageName: p[1] || `SS${i + 1}`,
          distance: p[2] || '0.00 km',
          surface: ((p[3] as any) || 'gravel') as StageInfo['surface'],
          startTime: p[4] || undefined,
          location: p[5] || undefined,
          notes: p[6] || undefined,
        };
      });
      importBundle({ rallyIntro: { ...rallyIntro, stages, totalStages: stages.length } });
      setFeedback({ ok: true, msg: `Importados ${stages.length} especiales.` });
    } catch {
      setFeedback({ ok: false, msg: 'Error parseando CSV de SS.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 border border-border bg-card space-y-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold tracking-wider text-primary uppercase">
            Importar Datos de Carrera
          </h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Importá toda la información de la carrera de una sola vez (inscritos, intro, especiales, clima, sponsors).
          Después puedes autocompletar formularios desde la base usando los selectores en cada panel.
        </p>
        {feedback && (
          <div
            className={`flex items-center gap-2 text-xs px-3 py-2 ${
              feedback.ok ? 'bg-rally-green/20 text-rally-green' : 'bg-destructive/20 text-destructive'
            }`}
          >
            {feedback.ok ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
            {feedback.msg}
          </div>
        )}
      </div>

      {/* Full bundle */}
      <div className="p-4 border border-border bg-card space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
            Bundle JSON completo (recomendado)
          </h4>
          <Button size="sm" variant="outline" onClick={exportFullJSON}>
            <Download className="w-3 h-3 mr-1" /> Exportar bundle actual
          </Button>
        </div>
        <Label className="text-[10px] text-muted-foreground uppercase">
          Pegá un JSON con claves opcionales: entries, rallyIntro, stageWeather, sponsors
        </Label>
        <input
          type="file"
          accept=".json,application/json"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0], setJsonText)}
          className="text-xs"
        />
        <textarea
          className="w-full h-40 border border-input bg-background px-2 py-1 text-xs font-mono"
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          placeholder='{ "entries": [...], "rallyIntro": {...}, "stageWeather": {...}, "sponsors": [...] }'
        />
        <Button onClick={importFullJSON} disabled={!jsonText.trim()}>
          <Upload className="w-3 h-3 mr-1" /> Importar bundle
        </Button>
      </div>

      {/* Entries CSV */}
      <div className="p-4 border border-border bg-card space-y-3">
        <h4 className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
          Inscritos · CSV rápido
        </h4>
        <Label className="text-[10px] text-muted-foreground uppercase">
          Formato: carNumber, piloto, copiloto, banderaPiloto, banderaCopi, equipo, auto, categoría
        </Label>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0], setCsvText)}
          className="text-xs"
        />
        <textarea
          className="w-full h-28 border border-input bg-background px-2 py-1 text-xs font-mono"
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          placeholder="1, Sébastien Ogier, Vincent Landais, 🇫🇷, 🇫🇷, Toyota Gazoo Racing, Toyota GR Yaris Rally1, Rally1"
        />
        <Button onClick={importEntriesCSV} disabled={!csvText.trim()}>
          <Upload className="w-3 h-3 mr-1" /> Importar Inscritos (reemplaza)
        </Button>
      </div>

      {/* Stages CSV */}
      <div className="p-4 border border-border bg-card space-y-3">
        <h4 className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
          Especiales · CSV rápido
        </h4>
        <Label className="text-[10px] text-muted-foreground uppercase">
          Formato: SS#, nombre, distancia, superficie (gravel|asphalt|snow), salida, localidad, notas
        </Label>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(e) =>
            e.target.files?.[0] && handleFile(e.target.files[0], (t) => importStagesCSV(t))
          }
          className="text-xs"
        />
        <p className="text-[10px] text-muted-foreground">
          Tip: los archivos .csv se importan directamente al seleccionarlos.
        </p>
      </div>

      {/* Status */}
      <div className="p-4 border border-border bg-card grid grid-cols-4 gap-3 text-center">
        <div>
          <div className="text-2xl font-bold text-primary">{entries.length}</div>
          <div className="text-[10px] uppercase text-muted-foreground">Inscritos</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-primary">{rallyIntro.stages.length}</div>
          <div className="text-[10px] uppercase text-muted-foreground">Especiales</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-primary">{sponsors.length}</div>
          <div className="text-[10px] uppercase text-muted-foreground">Sponsors</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-primary">{stageWeather.forecast?.length ?? 0}</div>
          <div className="text-[10px] uppercase text-muted-foreground">Slots clima</div>
        </div>
      </div>
    </div>
  );
};

export default ImportTab;
