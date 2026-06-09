import { motion } from 'framer-motion';
import type { GraphicsSettings } from '@/types/rally';
import type { GridSlot } from '@/types/circuit';
import { animationDuration, cornerRadius, fontStack, scaled, withOpacity, layoutStyle } from '@/lib/graphicsStyle';

interface Props {
  data: GridSlot[];
  settings: GraphicsSettings;
  title?: string;
  onMouseDown?: (e: React.MouseEvent) => void;
}

const StartGrid = ({ data, settings, title = 'PARRILLA DE SALIDA', onMouseDown }: Props) => {
  const dur = animationDuration(settings);
  const radius = cornerRadius(settings);
  const skew = settings.shearAngle;

  const rows: GridSlot[][] = [];
  for (let i = 0; i < data.length; i += 2) rows.push(data.slice(i, i + 2));

  return (
    <div style={layoutStyle(settings, 'startGrid')} onMouseDown={onMouseDown}>
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
      <div
        className="flex items-center justify-between px-6"
        style={{
          background: settings.primaryColor,
          height: scaled(settings, 56),
          borderRadius: radius,
        }}
      >
        <span
          className="font-bold tracking-widest uppercase"
          style={{ color: settings.textColor, fontSize: scaled(settings, 24) }}
        >
          {title}
        </span>
        <div className="flex">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="w-3 h-3"
              style={{
                background: i % 2 === 0 ? settings.textColor : settings.secondaryColor,
              }}
            />
          ))}
        </div>
      </div>

      <div className="mt-2 space-y-1.5">
        {rows.map((pair, rowIdx) => (
          <div key={rowIdx} className="flex gap-3" style={{ marginLeft: rowIdx % 2 === 1 ? 60 : 0 }}>
            {pair.map((slot, idx) => (
              <motion.div
                key={slot.position}
                className="flex items-center flex-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (rowIdx * 2 + idx) * 0.04 }}
                style={{
                  background: withOpacity(settings.secondaryColor, 0.95),
                  borderLeft: `4px solid ${slot.position === 1 ? settings.accentColor : settings.primaryColor}`,
                  borderRadius: radius,
                  height: scaled(settings, 56),
                  paddingRight: 12,
                }}
              >
                <span
                  className="flex items-center justify-center font-bold"
                  style={{
                    width: scaled(settings, 56),
                    height: '100%',
                    background: slot.position === 1 ? settings.accentColor : 'transparent',
                    color: slot.position === 1 ? settings.secondaryColor : settings.accentColor,
                    fontSize: scaled(settings, 28),
                    clipPath: skew > 0 ? `polygon(0 0, 100% 0, ${100 - skew}% 100%, 0 100%)` : undefined,
                  }}
                >
                  P{slot.position}
                </span>
                {slot.photoUrl && (
                  <img
                    src={slot.photoUrl}
                    alt=""
                    className="rounded-full ml-2 object-cover border-2"
                    style={{
                      width: scaled(settings, 38),
                      height: scaled(settings, 38),
                      borderColor: slot.position === 1 ? settings.accentColor : withOpacity(settings.textColor, 0.2),
                    }}
                  />
                )}
                <span
                  className="font-bold ml-2"
                  style={{ color: settings.accentColor, fontSize: scaled(settings, 18) }}
                >
                  #{slot.carNumber}
                </span>
                <span
                  className="font-semibold ml-2 truncate flex-1"
                  style={{ color: settings.textColor, fontSize: scaled(settings, 16) }}
                >
                  {slot.driverName}
                </span>
                <span
                  className="font-mono tabular-nums"
                  style={{ color: withOpacity(settings.textColor, 0.75), fontSize: scaled(settings, 14) }}
                >
                  {slot.qualifyingTime ?? slot.gap ?? ''}
                </span>
              </motion.div>
            ))}
          </div>
        ))}
      </div>
    </motion.div>
    </div>
  );
};

export default StartGrid;
