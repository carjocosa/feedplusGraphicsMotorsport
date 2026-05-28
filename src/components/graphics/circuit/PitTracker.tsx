import { motion, AnimatePresence } from 'framer-motion';
import type { GraphicsSettings } from '@/types/rally';
import type { PitTrackerData } from '@/types/circuit';
import { animationDuration, cornerRadius, fontStack, scaled, withOpacity, layoutStyle } from '@/lib/graphicsStyle';

interface Props {
  data: PitTrackerData;
  settings: GraphicsSettings;
  onMouseDown?: (e: React.MouseEvent) => void;
}

const PitTracker = ({ data, settings, onMouseDown }: Props) => {
  const dur = animationDuration(settings);
  const radius = cornerRadius(settings);

  return (
    <div style={layoutStyle(settings, 'pitTracker')} onMouseDown={onMouseDown}>
      <motion.div
        style={{
          fontFamily: fontStack(settings),
          opacity: settings.panelOpacity,
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: settings.panelOpacity, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ duration: dur }}
      >
      <div
        className="flex items-center px-5"
        style={{
          background: settings.primaryColor,
          height: scaled(settings, 46),
          borderRadius: radius,
        }}
      >
        <div className="flex items-center gap-2 flex-1">
          <span className="w-2.5 h-2.5 bg-white animate-pulse" />
          <span
            className="font-bold tracking-widest uppercase"
            style={{ color: settings.textColor, fontSize: scaled(settings, 20) }}
          >
            {data.title ?? 'PIT LANE'}
          </span>
        </div>
      </div>

      <div className="mt-1.5 space-y-1">
        <AnimatePresence initial={false}>
          {data.events.slice(0, 6).map((ev) => {
            const delta = ev.positionAfter - ev.positionBefore;
            const arrow = delta > 0 ? '▼' : delta < 0 ? '▲' : '–';
            const arrowColor = delta > 0 ? '#EF4444' : delta < 0 ? '#22C55E' : settings.textColor;
            return (
              <motion.div
                key={ev.id}
                layout
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: dur }}
                className="grid items-center px-3"
                style={{
                  gridTemplateColumns: '50px 1fr 80px 70px',
                  background: withOpacity(settings.secondaryColor, 0.92),
                  borderLeft: `3px solid ${ev.status === 'in' ? settings.accentColor : settings.primaryColor}`,
                  height: scaled(settings, 44),
                  borderRadius: radius,
                }}
              >
                <span
                  className="font-bold"
                  style={{ color: settings.accentColor, fontSize: scaled(settings, 18) }}
                >
                  #{ev.carNumber}
                </span>
                <div className="truncate">
                  <div
                    className="font-semibold truncate"
                    style={{ color: settings.textColor, fontSize: scaled(settings, 15) }}
                  >
                    {ev.driverName}
                  </div>
                  <div
                    className="text-[10px] uppercase tracking-wider truncate"
                    style={{ color: withOpacity(settings.textColor, 0.5) }}
                  >
                    {ev.team} {ev.lap ? `· L${ev.lap}` : ''}
                  </div>
                </div>
                <span
                  className="text-right font-mono tabular-nums font-bold"
                  style={{ color: settings.textColor, fontSize: scaled(settings, 16) }}
                >
                  {ev.pitTime}
                </span>
                <span
                  className="text-right font-bold"
                  style={{ color: arrowColor, fontSize: scaled(settings, 14) }}
                >
                  {ev.status === 'in' ? 'IN PIT' : `${arrow} P${ev.positionAfter}`}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
    </div>
  );
};

export default PitTracker;
