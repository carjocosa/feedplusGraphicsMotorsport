import { useState, useRef } from 'react';
import { useCircuitStore } from '@/store/circuitStore';
import { Input } from '@/components/ui/input';
import type { CircuitEntry, Category } from '@/types/circuit';

const newEntry = (): CircuitEntry => ({
  id: `c${Date.now()}`,
  carNumber: '',
  driverName: '',
  country: '',
  team: '',
  car: '',
  category: '',
  qualifyingTime: '',
  photoUrl: '',
});

const CAT_COLORS = ['#FF6B00', '#2563EB', '#16A34A', '#A855F7', '#DC2626', '#FACC15', '#EC4899', '#14B8A6'];

function resizeImage(file: File, maxW: number, maxH: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = Math.min(maxW / img.width, maxH / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('no ctx')); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = () => reject(new Error('img load failed'));
    img.src = URL.createObjectURL(file);
  });
}

const CircuitEntriesTab = () => {
  const { entries, setEntries, addEntry, updateEntry, removeEntry, categories, setCategories, addCategory, updateCategory, removeCategory } = useCircuitStore();
  const [csvText, setCsvText] = useState('');
  const [showCatEditor, setShowCatEditor] = useState(false);
  const [catName, setCatName] = useState('');
  const [catColor, setCatColor] = useState('#FF6B00');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

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

  const handlePhoto = async (entryId: string, file: File) => {
    try {
      const dataUrl = await resizeImage(file, 120, 120);
      updateEntry(entryId, { photoUrl: dataUrl });
    } catch { /* ignore */ }
  };

  const addCat = () => {
    if (!catName.trim()) return;
    if (editingCatId) {
      updateCategory(editingCatId, { name: catName.trim(), color: catColor });
      setEditingCatId(null);
    } else {
      addCategory({ id: `cat-${Date.now()}`, name: catName.trim(), color: catColor });
    }
    setCatName('');
    setCatColor('#FF6B00');
  };

  const editCat = (c: Category) => {
    setCatName(c.name);
    setCatColor(c.color);
    setEditingCatId(c.id);
    setShowCatEditor(true);
  };

  return (
    <div className="space-y-4">
      {/* Categories editor */}
      <div className="p-4 border border-border bg-card space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold tracking-wider text-primary uppercase">Categorías</h3>
          <button
            onClick={() => { setShowCatEditor(!showCatEditor); setEditingCatId(null); setCatName(''); setCatColor('#FF6B00'); }}
            className="px-3 py-1.5 text-xs font-bold uppercase bg-primary text-primary-foreground hover:opacity-80"
          >
            {showCatEditor ? 'Cerrar' : '+ Categoría'}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map(c => (
            <div
              key={c.id}
              className="flex items-center gap-2 px-2.5 py-1 rounded-sm text-xs font-semibold"
              style={{ background: `${c.color}18`, color: c.color, border: `1px solid ${c.color}44` }}
            >
              <span>{c.name}</span>
              <button onClick={() => editCat(c)} className="opacity-60 hover:opacity-100" title="Editar">✎</button>
              <button onClick={() => removeCategory(c.id)} className="opacity-60 hover:opacity-100" title="Eliminar">✕</button>
            </div>
          ))}
        </div>

        {showCatEditor && (
          <div className="flex items-center gap-2 pt-1">
            <Input
              className="h-7 text-xs w-40"
              value={catName}
              onChange={e => setCatName(e.target.value)}
              placeholder="Nombre de categoría"
            />
            <div className="flex gap-1">
              {CAT_COLORS.map(clr => (
                <button
                  key={clr}
                  onClick={() => setCatColor(clr)}
                  className="w-6 h-6 rounded-sm border border-border"
                  style={{
                    background: clr,
                    outline: catColor === clr ? '2px solid white' : 'none',
                    outlineOffset: 1,
                  }}
                />
              ))}
            </div>
            <button
              onClick={addCat}
              className="px-3 py-1.5 text-xs font-bold uppercase bg-secondary text-secondary-foreground hover:opacity-80"
            >
              {editingCatId ? 'Actualizar' : 'Agregar'}
            </button>
          </div>
        )}
      </div>

      {/* Entries */}
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

        <div className="grid grid-cols-[40px_40px_1fr_50px_1fr_1fr_90px_70px_80px_30px] gap-1 text-[10px] uppercase tracking-wider text-muted-foreground px-1">
          <span></span><span>Nº</span><span>Piloto</span><span>País</span><span>Equipo</span><span>Chasis</span><span>Categoría</span><span>Quali</span><span></span>
        </div>

        <div className="max-h-[500px] overflow-y-auto space-y-1">
          {entries.map((e, i) => (
            <div key={e.id} className="grid grid-cols-[40px_40px_1fr_50px_1fr_1fr_90px_70px_80px_30px] gap-1 items-center">
              <div className="relative">
                {e.photoUrl ? (
                  <img
                    src={e.photoUrl}
                    alt=""
                    className="w-8 h-8 rounded-sm object-cover cursor-pointer"
                    onClick={() => fileInputs.current[e.id]?.click()}
                  />
                ) : (
                  <button
                    onClick={() => fileInputs.current[e.id]?.click()}
                    className="w-8 h-8 rounded-sm border border-dashed border-muted-foreground text-[9px] text-muted-foreground hover:border-primary hover:text-primary"
                  >
                    Foto
                  </button>
                )}
                <input
                  ref={el => { fileInputs.current[e.id] = el; }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={ev => {
                    const f = ev.target.files?.[0];
                    if (f) handlePhoto(e.id, f);
                  }}
                />
              </div>
              <Input className="h-7 text-xs" value={e.carNumber} onChange={ev => updateEntry(e.id, { carNumber: ev.target.value })} />
              <Input className="h-7 text-xs" value={e.driverName} onChange={ev => updateEntry(e.id, { driverName: ev.target.value })} />
              <Input className="h-7 text-xs" value={e.country} onChange={ev => updateEntry(e.id, { country: ev.target.value })} placeholder="🇦🇷" />
              <Input className="h-7 text-xs" value={e.team} onChange={ev => updateEntry(e.id, { team: ev.target.value })} />
              <Input className="h-7 text-xs" value={e.car} onChange={ev => updateEntry(e.id, { car: ev.target.value })} />
              <select
                value={e.category ?? ''}
                onChange={ev => updateEntry(e.id, { category: ev.target.value })}
                className="h-7 text-[10px] border border-input bg-background px-1 rounded"
              >
                <option value="">—</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
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
          <label className="text-xs text-muted-foreground">Importar CSV (nº, piloto, país, equipo, chasis, categoría, quali)</label>
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
