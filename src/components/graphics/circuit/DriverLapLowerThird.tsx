import { motion } from 'framer-motion';
import type { GraphicsSettings } from '@/types/rally';
import type { DriverLapData } from '@/types/circuit';
import { animationDuration, cornerRadius, fontStack, scaled, withOpacity, layoutStyle } from '@/lib/graphicsStyle';

interface Props {
  data: DriverLapData;
  settings: GraphicsSettings;
  onMouseDown?: (e: React.MouseEvent) => void;
}

const DriverLapLowerThird = ({ data, settings, onMouseDown }: Props) => {
  const skew = settings.shearAngle;
  const dur = animationDuration(settings);
  const radius = cornerRadius(settings);

  return (
    <div style={layoutStyle(settings, 'driverLap')} onMouseDown={onMouseDown}>
      <motion.div
        style={{ fontFamily: fontStack(settings), opacity: settings.panelOpacity }}
        initial={{ x: -800, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -800, opacity: 0 }}
        transition={{ duration: dur, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-stretch"
      >
        {/* Position badge */}
        <div
          className="flex flex-col items-center justify-center font-bold"
          style={{
            background: settings.accentColor,
            color: settings.secondaryColor,
            width: scaled(settings, 110),
            height: scaled(settings, 130),
            clipPath: skew > 0 ? `polygon(0 0, 100% 0, ${100 - skew}% 100%, 0 100%)` : undefined,
            borderRadius: radius,
          }}
        >
          <span className="text-[12px] uppercase tracking-wider opacity-70">POS</span>
          <span style={{ fontSize: scaled(settings, 56), lineHeight: 1 }}>{data.position}</span>
        </div>

        {/* Main info */}
        <div className="flex flex-col -ml-1">
          {/* Name + #car */}
          <div
            className="flex items-center px-8"
            style={{
              background: settings.primaryColor,
              transform: `skewX(-${skew}deg)`,
              marginLeft: skew * 1.5,
              height: scaled(settings, 56),
              minWidth: 560,
              borderRadius: radius,
            }}
          >
            <div style={{ transform: `skewX(${skew}deg)` }} className="flex items-center gap-4">
              <span
                className="font-bold tabular-nums"
                style={{ color: settings.accentColor, fontSize: scaled(settings, 32) }}
              >
                #{data.carNumber}
              </span>
              <span
                className="font-bold tracking-wider uppercase"
                style={{ color: settings.textColor, fontSize: scaled(settings, 30) }}
              >
                {data.country} {data.driverName}
              </span>
            </div>
          </div>

          {/* Team */}
          <div
            className="flex items-center px-8 -mt-px"
            style={{
              background: settings.secondaryColor,
              transform: `skewX(-${skew}deg)`,
              marginLeft: skew * 1.5,
              height: scaled(settings, 36),
              minWidth: 460,
              borderRadius: radius,
            }}
          >
            <span
              style={{
                transform: `skewX(${skew}deg)`,
                color: withOpacity(settings.textColor, 0.85),
                fontSize: scaled(settings, 18),
              }}
              className="uppercase tracking-wider font-medium"
            >
              {data.team}
            </span>
          </div>

          {/* Telemetry strip */}
          <div
            className="flex items-stretch -mt-px"
            style={{
              background: withOpacity(settings.secondaryColor, 0.85),
              transform: `skewX(-${skew}deg)`,
              marginLeft: skew * 1.5,
              minWidth: 540,
              borderRadius: radius,
            }}
          >
            <div style={{ transform: `skewX(${skew}deg)` }} className="flex items-stretch w-full">
              {[
                { label: 'LAP', value: `${data.lap}/${data.totalLaps}` },
                { label: `S${data.sector}`, value: data.sectorTime ?? '—' },
                { label: 'LAST', value: data.lastLap },
                { label: 'BEST', value: data.bestLap },
                { label: 'GAP', value: data.gapToLeader },
              ].map((kv, i) => (
                <div
                  key={kv.label}
                  className="flex flex-col items-start justify-center px-4 py-1"
                  style={{
                    borderRight: i < 4 ? `1px solid ${withOpacity(settings.textColor, 0.15)}` : 'none',
                    minWidth: 90,
                  }}
                >
                  <span
                    className="text-[10px] uppercase tracking-widest font-bold"
                    style={{ color: settings.accentColor }}
                  >
                    {kv.label}
                  </span>
                  <span
                    className="font-bold tabular-nums"
                    style={{ color: settings.textColor, fontSize: scaled(settings, 16) }}
                  >
                    {kv.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DriverLapLowerThird;
