import { motion } from 'framer-motion';
import type { GraphicsSettings } from '@/types/rally';
import type { FinalResultsData } from '@/types/circuit';
import { animationDuration, cornerRadius, fontStack, scaled, withOpacity, layoutStyle } from '@/lib/graphicsStyle';

interface Props {
  data: FinalResultsData;
  settings: GraphicsSettings;
  onMouseDown?: (e: React.MouseEvent) => void;
}

const FinalResults = ({ data, settings, onMouseDown }: Props) => {
  const dur = animationDuration(settings);
  const radius = cornerRadius(settings);

  return (
    <div style={layoutStyle(settings, 'finalResults')} onMouseDown={onMouseDown}>
      <motion.div
        style={{
          fontFamily: fontStack(settings),
          opacity: settings.panelOpacity,
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: settings.panelOpacity, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: dur }}
      >
      {/* Header */}
      <div
        className="flex flex-col items-center justify-center px-6 py-3"
        style={{ background: settings.primaryColor, borderRadius: radius }}
      >
        <span
          className="text-[12px] uppercase tracking-[0.3em]"
          style={{ color: withOpacity(settings.textColor, 0.7) }}
        >
          {data.series} · {data.totalLaps} LAPS
        </span>
        <span
          className="font-bold tracking-widest uppercase"
          style={{ color: settings.textColor, fontSize: scaled(settings, 26) }}
        >
          {data.raceName} — FINAL RESULTS
        </span>
      </div>

      <div
        className="grid items-center px-3 py-1 text-[11px] uppercase tracking-wider font-bold mt-1"
        style={{
          gridTemplateColumns: '40px 50px 1fr 60px 130px 110px',
          background: withOpacity(settings.secondaryColor, 0.85),
          color: withOpacity(settings.textColor, 0.55),
        }}
      >
        <span>POS</span>
        <span>#</span>
        <span>PILOTO / EQUIPO</span>
        <span className="text-right">LAPS</span>
        <span className="text-right">TIME</span>
        <span className="text-right">BEST LAP</span>
      </div>

      {data.results.slice(0, 15).map((r, i) => (
        <motion.div
          key={r.carNumber}
          className="grid items-center px-3"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.025 }}
          style={{
            gridTemplateColumns: '40px 50px 1fr 60px 130px 110px',
            background: i % 2 === 0
              ? withOpacity(settings.secondaryColor, 0.92)
              : withOpacity(settings.secondaryColor, 0.78),
            borderLeft: `3px solid ${i < 3 ? settings.accentColor : 'transparent'}`,
            height: scaled(settings, 38),
            fontSize: scaled(settings, 16),
          }}
        >
          <span
            className="font-bold"
            style={{ color: i < 3 ? settings.accentColor : settings.textColor }}
          >
            {r.status === 'dnf' ? 'DNF' : r.status === 'dsq' ? 'DSQ' : r.position}
          </span>
          <span className="font-bold" style={{ color: settings.accentColor }}>
            #{r.carNumber}
          </span>
          <div className="flex items-center gap-2 truncate">
            <span className="font-semibold truncate" style={{ color: settings.textColor }}>
              {r.driverName}
            </span>
            <span
              className="text-[11px] uppercase tracking-wider truncate"
              style={{ color: withOpacity(settings.textColor, 0.5) }}
            >
              {r.team}
            </span>
          </div>
          <span
            className="text-right font-mono tabular-nums"
            style={{ color: withOpacity(settings.textColor, 0.7) }}
          >
            {r.laps}
          </span>
          <span
            className="text-right font-mono tabular-nums font-bold"
            style={{ color: i === 0 ? settings.accentColor : settings.textColor }}
          >
            {r.totalTime}
          </span>
          <span
            className="text-right font-mono tabular-nums"
            style={{ color: withOpacity(settings.textColor, 0.75) }}
          >
            {r.bestLap}
          </span>
        </motion.div>
      ))}
    </motion.div>
    </div>
  );
};

export default FinalResults;
