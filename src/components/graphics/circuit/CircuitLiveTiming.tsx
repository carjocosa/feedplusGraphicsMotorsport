import { motion } from 'framer-motion';
import type { GraphicsSettings } from '@/types/rally';
import type { CircuitTimingEntry } from '@/types/circuit';
import { animationDuration, cornerRadius, fontStack, scaled, withOpacity, layoutStyle } from '@/lib/graphicsStyle';

export type LiveCol =
  | 'position' | 'carNumber' | 'driverName' | 'team'
  | 'lap' | 'gap' | 'interval' | 'lastLap' | 'bestLap' | 'pitStops';

interface ColDef {
  key: LiveCol;
  label: string;
  width: string; // grid track
  align?: 'left' | 'right' | 'center';
  mono?: boolean;
}

const COL_DEFS: Record<LiveCol, ColDef> = {
  position:   { key: 'position',   label: 'POS',    width: '36px', align: 'center' },
  carNumber:  { key: 'carNumber',  label: '#',      width: '44px' },
  driverName: { key: 'driverName', label: 'PILOTO', width: '1fr' },
  team:       { key: 'team',       label: 'EQUIPO', width: '1fr' },
  lap:        { key: 'lap',        label: 'LAP',    width: '50px', align: 'right' },
  gap:        { key: 'gap',        label: 'GAP',    width: '90px', align: 'right', mono: true },
  interval:   { key: 'interval',   label: 'INT',    width: '90px', align: 'right', mono: true },
  lastLap:    { key: 'lastLap',    label: 'LAST',   width: '90px', align: 'right', mono: true },
  bestLap:    { key: 'bestLap',    label: 'BEST',   width: '90px', align: 'right', mono: true },
  pitStops:   { key: 'pitStops',   label: 'PIT',    width: '60px', align: 'right' },
};

const DEFAULT_COLS: LiveCol[] = ['position', 'carNumber', 'driverName', 'gap', 'lastLap', 'pitStops'];

interface Props {
  data: CircuitTimingEntry[];
  settings: GraphicsSettings;
  title?: string;
  currentLap?: number;
  totalLaps?: number;
  columns?: LiveCol[];
  onMouseDown?: (e: React.MouseEvent) => void;
}

const CircuitLiveTiming = ({ data, settings, title = 'LIVE TIMING', currentLap, totalLaps, columns, onMouseDown }: Props) => {
  const dur = animationDuration(settings);
  const radius = cornerRadius(settings);
  const cols: LiveCol[] = columns && columns.length ? columns : DEFAULT_COLS;
  const gridTemplate = cols.map(c => COL_DEFS[c].width).join(' ');

  return (
    <div style={layoutStyle(settings, 'circuitTiming')} onMouseDown={onMouseDown}>
      <motion.div
        style={{
          fontFamily: fontStack(settings),
          opacity: settings.panelOpacity,
        }}
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: settings.panelOpacity, x: 0 }}
      exit={{ opacity: 0, x: 60 }}
      transition={{ duration: dur, ease: [0.16, 1, 0.3, 1] }}
      onMouseDown={onMouseDown}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5"
        style={{
          background: settings.primaryColor,
          height: scaled(settings, 50),
          borderRadius: radius,
        }}
      >
        <span
          className="font-bold tracking-widest uppercase"
          style={{ color: settings.textColor, fontSize: scaled(settings, 22) }}
        >
          {title}
        </span>
        {currentLap !== undefined && totalLaps !== undefined && (
          <span
            className="font-bold tabular-nums tracking-wider"
            style={{ color: settings.accentColor, fontSize: scaled(settings, 20) }}
          >
            LAP {currentLap}/{totalLaps}
          </span>
        )}
      </div>

      {/* Column headers */}
      <div
        className="grid items-center px-3 py-1 text-[11px] uppercase tracking-wider font-bold"
        style={{
          gridTemplateColumns: gridTemplate,
          background: withOpacity(settings.secondaryColor, 0.85),
          color: withOpacity(settings.textColor, 0.55),
        }}
      >
        {cols.map(c => {
          const def = COL_DEFS[c];
          return (
            <span key={c} className={def.align === 'right' ? 'text-right' : def.align === 'center' ? 'text-center' : ''}>
              {def.label}
            </span>
          );
        })}
      </div>

      {/* Rows */}
      {data.slice(0, 12).map((row, i) => {
        const lapColor = row.isPurple
          ? '#A855F7'
          : row.isPersonalBest
            ? '#22C55E'
            : settings.textColor;
        const isPit = row.status === 'pit';
        return (
          <motion.div
            key={`${row.carNumber}-${i}`}
            className="grid items-center px-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.025 }}
            style={{
              gridTemplateColumns: gridTemplate,
              background: i % 2 === 0
                ? withOpacity(settings.secondaryColor, 0.92)
                : withOpacity(settings.secondaryColor, 0.78),
              borderLeft: `3px solid ${i === 0 ? settings.accentColor : 'transparent'}`,
              height: scaled(settings, 36),
              fontSize: scaled(settings, 16),
              opacity: isPit ? 0.6 : 1,
            }}
          >
            {cols.map((c) => {
              const def = COL_DEFS[c];
              const align = def.align === 'right' ? 'text-right' : def.align === 'center' ? 'text-center' : '';
              const monoCls = def.mono ? 'font-mono tabular-nums' : '';
              if (c === 'position') {
                return (
                  <span key={c} className={`font-bold ${align}`} style={{ color: i === 0 ? settings.accentColor : settings.textColor }}>
                    {row.position}
                  </span>
                );
              }
              if (c === 'carNumber') {
                return <span key={c} className="font-bold" style={{ color: settings.accentColor }}>#{row.carNumber}</span>;
              }
              if (c === 'driverName') {
                return (
                  <div key={c} className="flex items-center gap-2 truncate">
                    <span className="font-semibold truncate" style={{ color: settings.textColor }}>{row.driverName}</span>
                    {!cols.includes('team') && (
                      <span className="text-[10px] uppercase tracking-wider truncate"
                        style={{ color: withOpacity(settings.textColor, 0.45) }}>
                        {row.team}
                      </span>
                    )}
                  </div>
                );
              }
              if (c === 'team') {
                return <span key={c} className="truncate" style={{ color: withOpacity(settings.textColor, 0.7) }}>{row.team}</span>;
              }
              if (c === 'gap') {
                return (
                  <span key={c} className={`${align} ${monoCls} font-semibold`}
                    style={{ color: i === 0 ? settings.accentColor : withOpacity(settings.textColor, 0.85) }}>
                    {row.gap}
                  </span>
                );
              }
              if (c === 'lastLap') {
                return (
                  <span key={c} className={`${align} ${monoCls} font-semibold`} style={{ color: lapColor }}>
                    {row.lastLap}
                  </span>
                );
              }
              if (c === 'pitStops') {
                return (
                  <span key={c} className={`${align} ${monoCls}`}
                    style={{ color: isPit ? settings.accentColor : withOpacity(settings.textColor, 0.6) }}>
                    {isPit ? 'IN PIT' : row.pitStops ?? 0}
                  </span>
                );
              }
              const v = (row as any)[c];
              return (
                <span key={c} className={`${align} ${monoCls}`} style={{ color: withOpacity(settings.textColor, 0.85) }}>
                  {v ?? ''}
                </span>
              );
            })}
          </motion.div>
        );
      })}
    </motion.div>
    </div>
  );
};

export default CircuitLiveTiming;
