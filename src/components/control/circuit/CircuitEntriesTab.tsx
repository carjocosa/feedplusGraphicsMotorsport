import { useState } from 'react';
import { useCircuitStore } from '@/store/circuitStore';
import { Input } from '@/components/ui/input';
import type { CircuitEntry } from '@/types/circuit';

const newEntry = (): CircuitEntry => ({
  id: `c${Date.now()}`,
  carNumber: '',
  driverName: '',
  country: '',
  team: '',
  car: '',
  category: '',
  qualifyingTime: '',
});

const CircuitEntriesTab = () => {
  const { entries, setEntries, addEntry, updateEntry, removeEntry } = useCircuitStore();
  const [csvText, setCsvText] = useState('');

  const importCSV = () => {
    const lines = csvText.trim().split('\n').filter(l => l.trim());
    const parsed: CircuitEntry[] = lines.map((line, i) => {
      const p = line.split(',').map(s => s.trim());
      return {
        id: `csv-${Date.now()}-${i}`,
        carNumber: p[0] || '',
        driverName: p[1] || '',
        country: p[2] || '',
        team: p[3] || '',
        car: p[4] || '',
        category: p[5] || '',
        qualifyingTime: p[6] || '',
      };
    });
    setEntries(parsed);
    setCsvText('');
  };

  return (
    <div className="space-y-4">
      <div className="p-4 border border-border bg-card space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold tracking-wider text-primary uppercase">Pilotos / Karts</h3>
          <button
            onClick={() => addEntry(newEntry())}
            className="px-3 py-1.5 text-xs font-bold uppercase bg-primary text-primary-foreground hover:opacity-80"
          >
            + Agregar
          </button>
        </div>

        <div className="grid grid-cols-[40px_50px_1fr_50px_1fr_1fr_70px_90px_30px] gap-1 text-[10px] uppercase tracking-wider text-muted-foreground px-1">
          <span>#</span><span>Nº</span><span>Piloto</span><span>País</span><span>Equipo</span><span>Vehículo</span><span>Cat.</span><span>Quali</span><span></span>
        </div>

        <div className="max-h-[400px] overflow-y-auto space-y-1">
          {entries.map((e, i) => (
            <div key={e.id} className="grid grid-cols-[40px_50px_1fr_50px_1fr_1fr_70px_90px_30px] gap-1 items-center">
              <span className="text-xs text-muted-foreground text-center">{i + 1}</span>
              <Input className="h-7 text-xs" value={e.carNumber} onChange={ev => updateEntry(e.id, { carNumber: ev.target.value })} />
              <Input className="h-7 text-xs" value={e.driverName} onChange={ev => updateEntry(e.id, { driverName: ev.target.value })} />
              <Input className="h-7 text-xs" value={e.country} onChange={ev => updateEntry(e.id, { country: ev.target.value })} placeholder="🇦🇷" />
              <Input className="h-7 text-xs" value={e.team} onChange={ev => updateEntry(e.id, { team: ev.target.value })} />
              <Input className="h-7 text-xs" value={e.car} onChange={ev => updateEntry(e.id, { car: ev.target.value })} />
              <Input className="h-7 text-xs" value={e.category ?? ''} onChange={ev => updateEntry(e.id, { category: ev.target.value })} />
              <Input className="h-7 text-xs font-mono" value={e.qualifyingTime ?? ''} onChange={ev => updateEntry(e.id, { qualifyingTime: ev.target.value })} placeholder="0:48.124" />
              <button
                onClick={() => removeEntry(e.id)}
                className="text-xs text-rally-red hover:opacity-70"
                title="Eliminar"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-2 pt-2 border-t border-border">
          <label className="text-xs text-muted-foreground">Importar CSV (nº, piloto, país, equipo, vehículo, cat, quali)</label>
          <textarea
            className="w-full h-20 border border-input bg-background px-2 py-1 text-xs font-mono"
            value={csvText}
            onChange={e => setCsvText(e.target.value)}
            placeholder="7, Mateo Vázquez, 🇦🇷, TGR Karting, Tony Kart / Vortex, KZ, 0:48.124"
          />
          <button onClick={importCSV} className="px-3 py-1 text-xs bg-secondary text-secondary-foreground hover:bg-secondary/80">
            Importar CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default CircuitEntriesTab;
