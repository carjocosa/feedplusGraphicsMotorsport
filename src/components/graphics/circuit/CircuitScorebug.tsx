import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { GraphicsSettings } from '@/types/rally';
import type { CircuitEventData } from '@/types/circuit';
import { animationDuration, fontStack, scaled, withOpacity, layoutStyle } from '@/lib/graphicsStyle';

interface Props {
  data: CircuitEventData & { leader?: string; flag?: string };
  settings: GraphicsSettings;
  onMouseDown?: (e: React.MouseEvent) => void;
}

const SESSION_LABELS: Record<string, string> = {
  practice: 'PRÁCTICA',
  qualifying: 'CLASIFICACIÓN',
  race: 'CARRERA',
  sprint: 'SPRINT',
  feature: 'FEATURE',
};

const fmt = (ms: number) => {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
};

const CircuitScorebug = ({ data, settings, onMouseDown }: Props) => {
  const dur = animationDuration(settings);
  const skew = settings.shearAngle;
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!data.raceTimeRunning || !data.raceTimeStart) return;
    const base = data.raceTimeElapsed ?? 0;
    const tick = () => setElapsed(base + (Date.now() - (data.raceTimeStart ?? Date.now())));
    tick();
    const id = setInterval(tick, 100);
    return () => clearInterval(id);
  }, [data.raceTimeRunning, data.raceTimeStart, data.raceTimeElapsed]);

  return (
    <div style={layoutStyle(settings, 'circuitScorebug')} onMouseDown={onMouseDown}>
      <motion.div
        style={{ fontFamily: fontStack(settings), opacity: settings.panelOpacity }}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: settings.panelOpacity }}
        exit={{ y: -50, opacity: 0 }}
        transition={{ duration: dur }}
      >
      <div className="flex items-stretch">
        <div
          className="flex flex-col justify-center px-5"
          style={{
            background: settings.accentColor,
            color: settings.secondaryColor,
            height: scaled(settings, 60),
            clipPath: skew > 0 ? `polygon(0 0, 100% 0, ${100 - skew}% 100%, 0 100%)` : undefined,
            paddingRight: 24 + skew,
          }}
        >
          <span className="text-[10px] uppercase tracking-widest font-bold opacity-70">
            {data.round}
          </span>
          <span
            className="font-bold tracking-wider uppercase"
            style={{ fontSize: scaled(settings, 18), lineHeight: 1 }}
          >
            {data.series}
          </span>
        </div>

        <div
          className="flex flex-col justify-center px-5 -ml-2"
          style={{
            background: settings.primaryColor,
            color: settings.textColor,
            height: scaled(settings, 60),
            transform: `skewX(-${skew}deg)`,
            marginLeft: -skew,
          }}
        >
          <div style={{ transform: `skewX(${skew}deg)` }}>
            <div className="text-[10px] uppercase tracking-widest font-bold opacity-70">
              {SESSION_LABELS[data.sessionType] ?? data.sessionType.toUpperCase()}
            </div>
            <div
              className="font-bold uppercase tracking-wider"
              style={{ fontSize: scaled(settings, 18), lineHeight: 1 }}
            >
              {data.circuit}
            </div>
          </div>
        </div>

        {(data.showRaceTime && data.raceTimeRunning !== undefined) && (
          <div
            className="flex items-center justify-center px-5 -ml-2"
            style={{
              background: settings.secondaryColor,
              color: settings.textColor,
              height: scaled(settings, 60),
              transform: `skewX(-${skew}deg)`,
              marginLeft: -skew,
              border: `2px solid ${withOpacity(settings.accentColor, 0.3)}`,
            }}
          >
            <div style={{ transform: `skewX(${skew}deg)` }} className="text-center">
              <div
                className="text-[10px] uppercase tracking-widest font-bold"
                style={{ color: withOpacity(settings.textColor, 0.6) }}
              >
                TIEMPO
              </div>
              <div
                className="font-bold tabular-nums"
                style={{ color: settings.accentColor, fontSize: scaled(settings, 20), lineHeight: 1 }}
              >
                {fmt(elapsed)}
              </div>
            </div>
          </div>
        )}

        {(data.showLap !== false) && (
          <div
            className="flex items-center justify-center px-6 -ml-2"
            style={{
              background: settings.secondaryColor,
              color: settings.textColor,
              height: scaled(settings, 60),
              transform: `skewX(-${skew}deg)`,
              marginLeft: -skew,
              border: `2px solid ${settings.accentColor}`,
            }}
          >
            <div style={{ transform: `skewX(${skew}deg)` }} className="text-center">
              <div
                className="text-[10px] uppercase tracking-widest font-bold"
                style={{ color: withOpacity(settings.textColor, 0.6) }}
              >
                VUELTA
              </div>
              <div
                className="font-bold tabular-nums"
                style={{ color: settings.accentColor, fontSize: scaled(settings, 22), lineHeight: 1 }}
              >
                {data.currentLap}/{data.totalLaps}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
    </div>
  );
};

export default CircuitScorebug;
