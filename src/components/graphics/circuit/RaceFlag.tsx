import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GraphicsSettings } from '@/types/rally';
import type { RaceFlagData, FlagKind } from '@/types/circuit';
import { animationDuration, fontStack, scaled, layoutStyle } from '@/lib/graphicsStyle';

interface Props {
  data: RaceFlagData & { series?: string; round?: string };
  settings: GraphicsSettings;
  onMouseDown?: (e: React.MouseEvent) => void;
}

const FLAG_INFO: Record<FlagKind, { color: string; label: string; sub: string }> = {
  green:      { color: '#16A34A', label: 'GREEN',           sub: 'TRACK CLEAR' },
  yellow:     { color: '#FACC15', label: 'YELLOW',          sub: 'CAUTION' },
  red:        { color: '#DC2626', label: 'RED',             sub: 'SESSION STOPPED' },
  blue:       { color: '#2563EB', label: 'BLUE',            sub: 'GIVE WAY' },
  white:      { color: '#F8FAFC', label: 'WHITE',           sub: 'SLOW VEHICLE' },
  checkered:  { color: '#FFFFFF', label: 'CHECKERED',       sub: 'RACE FINISHED' },
  safetycar:  { color: '#FACC15', label: 'SAFETY CAR',      sub: 'NO OVERTAKING' },
  vsc:        { color: '#FACC15', label: 'VSC',             sub: 'DELTA ENFORCED' },
};

const RaceFlag = ({ data, settings, onMouseDown }: Props) => {
  const dur = animationDuration(settings);
  const info = FLAG_INFO[data.flag];
  const isCheckered = data.flag === 'checkered';
  const msg = data.message?.trim() || info.sub;
  const [showFlag, setShowFlag] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [barPx, setBarPx] = useState(0);

  useEffect(() => {
    setShowFlag(false);
    const timer = setTimeout(() => setShowFlag(true), 900);
    return () => clearTimeout(timer);
  }, [data.flag, data.message]);

  // Measure label width once showFlag triggers
  useEffect(() => {
    if (!showFlag || !containerRef.current || !measureRef.current) return;
    const cw = containerRef.current.offsetWidth;
    const tw = measureRef.current.offsetWidth;
    setBarPx(Math.max(cw * 0.4, tw + 16));
  }, [showFlag]);

  const h = scaled(settings, 48);
  const labelFontSize = scaled(settings, 11);

  return (
    <div style={layoutStyle(settings, 'raceFlag')} onMouseDown={onMouseDown}>
      <motion.div
        ref={containerRef}
        className="overflow-hidden"
        style={{
          fontFamily: fontStack(settings),
          height: h,
          borderRadius: scaled(settings, 6),
          border: `2px solid ${info.color}`,
          background: settings.secondaryColor,
        }}
        initial={{ y: -h - 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -h - 10, opacity: 0 }}
        transition={{ duration: dur, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-stretch h-full">
          {/* Color bar — CSS transition width */}
          <div
            className="flex items-center justify-center shrink-0 overflow-hidden transition-all"
            style={{
              width: showFlag ? (barPx || '40%') : '0px',
              opacity: showFlag ? 1 : 0,
              background: isCheckered
                ? 'repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) 50% / 10px 10px'
                : info.color,
              transitionDuration: `${dur * 0.8}s`,
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <AnimatePresence>
              {showFlag && (
                <motion.span
                  className="font-bold tracking-widest uppercase whitespace-nowrap px-2"
                  style={{
                    color: ['yellow', 'white', 'safetycar', 'vsc'].includes(data.flag) ? '#000' : '#fff',
                    fontSize: labelFontSize,
                    textShadow: isCheckered ? '0 0 4px #000' : 'none',
                  }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: dur * 0.5, delay: dur * 0.3 }}
                >
                  {info.label}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Hidden span to measure label width */}
          <span
            ref={measureRef}
            className="absolute pointer-events-none invisible whitespace-nowrap px-2 font-bold"
            style={{ fontSize: labelFontSize, fontFamily: fontStack(settings), letterSpacing: '0.1em', textTransform: 'uppercase' }}
          >
            {info.label}
          </span>

          {/* Text area */}
          <div className="flex items-center px-3 min-w-0 flex-1">
            <AnimatePresence mode="wait">
              {!showFlag ? (
                <motion.div
                  key="plate"
                  className="flex items-center gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: dur * 0.5 }}
                >
                  <span
                    className="font-bold tracking-widest uppercase"
                    style={{ color: settings.accentColor, fontSize: scaled(settings, 13) }}
                  >
                    {data.series || 'RACE'}
                  </span>
                  {data.round && (
                    <span
                      className="font-medium tracking-wider"
                      style={{ color: settings.textColor, fontSize: scaled(settings, 11), opacity: 0.6 }}
                    >
                      {data.round}
                    </span>
                  )}
                </motion.div>
              ) : (
                <motion.span
                  key="flag"
                  className="font-bold tracking-wider uppercase truncate"
                  style={{ color: settings.textColor, fontSize: scaled(settings, 14) }}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: dur * 0.6 }}
                >
                  {msg}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RaceFlag;
