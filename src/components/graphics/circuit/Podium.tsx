import { motion } from 'framer-motion';
import type { GraphicsSettings } from '@/types/rally';
import type { PodiumData } from '@/types/circuit';
import { animationDuration, fontStack, scaled, withOpacity, layoutStyle } from '@/lib/graphicsStyle';

interface Props {
  data: PodiumData;
  settings: GraphicsSettings;
  onMouseDown?: (e: React.MouseEvent) => void;
}

const HEIGHTS = { 1: 360, 2: 280, 3: 230 } as const;
const ORDER: (1 | 2 | 3)[] = [2, 1, 3]; // visual left→center→right

const Podium = ({ data, settings, onMouseDown }: Props) => {
  const dur = animationDuration(settings);

  const byPos = Object.fromEntries(data.podium.map((p) => [p.position, p]));

  return (
    <div style={layoutStyle(settings, 'podium')} onMouseDown={onMouseDown}>
      <motion.div
        className="absolute inset-0 flex flex-col"
        style={{ fontFamily: fontStack(settings), opacity: settings.panelOpacity }}
        initial={{ opacity: 0 }}
        animate={{ opacity: settings.panelOpacity }}
        exit={{ opacity: 0 }}
        transition={{ duration: dur }}
      >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${settings.secondaryColor}f5 0%, ${settings.secondaryColor}cc 100%)`,
        }}
      />
      {/* Checkered strip */}
      <div
        className="absolute top-0 left-0 right-0 h-3"
        style={{
          backgroundImage:
            'linear-gradient(45deg, #fff 25%, #000 25%, #000 50%, #fff 50%, #fff 75%, #000 75%)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Header */}
      <div className="relative z-10 text-center pt-16 pb-6">
        <div
          className="font-bold tracking-widest uppercase"
          style={{ color: settings.accentColor, fontSize: scaled(settings, 22) }}
        >
          {data.series}
        </div>
        <div
          className="font-bold tracking-widest uppercase mt-1"
          style={{ color: settings.textColor, fontSize: scaled(settings, 56), lineHeight: 1 }}
        >
          {data.raceName}
        </div>
        <div
          className="mt-3 font-bold tracking-[0.5em] uppercase"
          style={{ color: settings.primaryColor, fontSize: scaled(settings, 18) }}
        >
          PODIUM
        </div>
      </div>

      {/* Podium blocks */}
      <div className="relative z-10 flex-1 flex items-end justify-center gap-6 pb-24 px-20">
        {ORDER.map((pos, idx) => {
          const p = byPos[pos];
          if (!p) return null;
          return (
            <motion.div
              key={pos}
              className="flex flex-col items-center w-[300px]"
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 + idx * 0.18, duration: dur, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className="font-bold tabular-nums"
                style={{
                  color: settings.accentColor,
                  fontSize: scaled(settings, 28),
                  letterSpacing: '0.1em',
                }}
              >
                #{p.carNumber}
              </div>
              <div
                className="font-bold tracking-wide uppercase text-center"
                style={{ color: settings.textColor, fontSize: scaled(settings, 32) }}
              >
                {p.country} {p.driverName}
              </div>
              <div
                className="uppercase tracking-wider text-center"
                style={{ color: withOpacity(settings.textColor, 0.7), fontSize: scaled(settings, 16) }}
              >
                {p.team}
              </div>
              <div
                className="font-mono tabular-nums mt-1"
                style={{ color: settings.accentColor, fontSize: scaled(settings, 20) }}
              >
                {p.totalTime}
              </div>

              <div
                className="w-full mt-4 flex flex-col items-center justify-start pt-6"
                style={{
                  height: HEIGHTS[pos],
                  background:
                    pos === 1
                      ? `linear-gradient(180deg, ${settings.accentColor}, ${settings.accentColor}aa)`
                      : pos === 2
                        ? `linear-gradient(180deg, ${settings.primaryColor}, ${settings.primaryColor}aa)`
                        : `linear-gradient(180deg, ${withOpacity(settings.textColor, 0.5)}, ${withOpacity(settings.textColor, 0.3)})`,
                  borderTop: `4px solid ${settings.textColor}`,
                }}
              >
                <span
                  className="font-bold"
                  style={{
                    color: pos === 1 ? settings.secondaryColor : settings.textColor,
                    fontSize: scaled(settings, 140),
                    lineHeight: 1,
                  }}
                >
                  {pos}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
    </div>
  );
};

export default Podium;
