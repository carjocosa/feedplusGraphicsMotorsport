import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ChevronDown, Users } from 'lucide-react';

interface BaseEntry {
  id: string;
  carNumber: string;
  driverName: string;
  team: string;
  car?: string;
  category?: string;
  [key: string]: unknown;
}

interface EntryPickerProps<T extends BaseEntry> {
  entries: T[];
  label?: string;
  onPick: (entry: T) => void;
  buttonClassName?: string;
  entryLabel?: string;
  renderEntry?: (entry: T) => React.ReactNode;
}

const EntryPicker = <T extends BaseEntry>({
  entries,
  label = 'Autocompletar desde Inscritos',
  onPick,
  buttonClassName,
  entryLabel = 'inscritos',
  renderEntry,
}: EntryPickerProps<T>) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    if (!q.trim()) return entries.slice(0, 50);
    const needle = q.toLowerCase();
    return entries
      .filter((e) =>
        [e.carNumber, e.driverName, e.team, e.car, e.category, e.coDriverName]
          .filter(Boolean)
          .some((s) => (s as string).toLowerCase().includes(needle))
      )
      .slice(0, 50);
  }, [entries, q]);

  const defaultRender = (entry: T) => (
    <>
      <div className="flex items-center gap-2">
        <span className="px-1.5 py-0.5 bg-primary text-primary-foreground font-bold">
          #{entry.carNumber}
        </span>
        <span className="font-medium">
          {entry.driverCountry || entry.country ? `${entry.driverCountry || entry.country} ` : ''}{entry.driverName}
        </span>
        {entry.coDriverName && (
          <>
            <span className="text-muted-foreground">/</span>
            <span>
              {entry.coDriverCountry ? `${entry.coDriverCountry} ` : ''}{entry.coDriverName}
            </span>
          </>
        )}
      </div>
      <div className="text-[10px] text-muted-foreground mt-0.5">
        {entry.team}{entry.car ? ` · ${entry.car}` : ''}
        {entry.category ? ` · ${entry.category}` : ''}
        {entry.qualifyingTime ? ` · Q ${entry.qualifyingTime}` : ''}
      </div>
    </>
  );

  return (
    <div className="space-y-1">
      {label && <Label className="text-[10px] text-muted-foreground uppercase">{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={buttonClassName ?? 'w-full justify-between h-9 text-xs font-rajdhani'}
          >
            <span className="flex items-center gap-2">
              <Users className="w-3 h-3" />
              {entries.length} {entryLabel} · buscar…
            </span>
            <ChevronDown className="w-3 h-3 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[420px] p-2" align="start">
          <Input
            autoFocus
            placeholder="Buscar por #, piloto, equipo…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-8 text-xs mb-2"
          />
          <div className="max-h-[300px] overflow-y-auto">
            {filtered.length === 0 && (
              <p className="text-xs text-muted-foreground py-3 text-center">Sin resultados.</p>
            )}
            {filtered.map((e) => (
              <button
                key={e.id}
                onClick={() => {
                  onPick(e);
                  setOpen(false);
                  setQ('');
                }}
                className="w-full text-left px-2 py-1.5 hover:bg-accent/40 text-xs border-b border-border/30 last:border-0"
              >
                {renderEntry ? renderEntry(e) : defaultRender(e)}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default EntryPicker;
