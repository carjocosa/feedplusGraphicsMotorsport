import { motion } from 'framer-motion';
import type { GraphicsSettings } from '@/types/rally';
import { layoutStyle, scaled, fontStack, withOpacity, cornerRadius } from '@/lib/graphicsStyle';

export interface VsEntry {
  name: string;
  country: string;
  team: string;
  car: string;
  carNumber: string;
}

interface Props {
  left: VsEntry;
  right: VsEntry;
  settings: GraphicsSettings;
  onMouseDown?: (e: React.MouseEvent) => void;
}

const VsLowerThird = ({ left, right, settings, onMouseDown }: Props) => {
  const skew = settings.shearAngle;
  const radius = cornerRadius(settings);
  const opacity = settings.panelOpacity;
  const dur = settings.animationSpeed === 'instant' ? 0.12 : settings.animationSpeed === 'fast' ? 0.3 : settings.animationSpeed === 'normal' ? 0.45 : 0.7;
  const borderColor = settings.borderAccent ? settings.accentColor : 'transparent';

  return (
    <div style={layoutStyle(settings, 'vsLowerThird')} onMouseDown={onMouseDown}>
      <motion.div
        style={{ fontFamily: fontStack(settings), opacity }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: dur, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center">
          {/* Left side */}
          <div className="flex flex-col items-end">
            <div
              className="flex items-center justify-end px-6"
              style={{
                background: settings.primaryColor,
                transform: `skewX(-${skew}deg)`,
                height: scaled(settings, 50),
                borderRadius: radius,
                border: borderColor !== 'transparent' ? `2px solid ${borderColor}` : 'none',
                minWidth: scaled(settings, 280),
              }}
            >
              <span
                style={{ transform: `skewX(${skew}deg)`, color: settings.textColor, fontSize: scaled(settings, 26) }}
                className="font-bold tracking-wider uppercase text-right"
              >
                {left.name}
              </span>
            </div>
            <div
              className="flex items-center justify-end px-6 -mt-[1px]"
              style={{
                background: withOpacity(settings.secondaryColor, opacity),
                transform: `skewX(-${skew}deg)`,
                height: scaled(settings, 32),
                borderRadius: radius,
                minWidth: scaled(settings, 240),
              }}
            >
              <span style={{ transform: `skewX(${skew}deg)`, color: withOpacity(settings.textColor, 0.8), fontSize: scaled(settings, 18) }} className="font-medium tracking-wide">
                {left.country} <span className="text-white/40 mx-1">·</span> {left.team}
              </span>
            </div>
            <div
              className="flex items-center justify-end px-6 -mt-[1px]"
              style={{
                background: withOpacity(settings.secondaryColor, opacity * 0.8),
                transform: `skewX(-${skew}deg)`,
                height: scaled(settings, 26),
                borderRadius: radius,
                minWidth: scaled(settings, 200),
              }}
            >
              <span style={{ transform: `skewX(${skew}deg)`, color: withOpacity(settings.textColor, 0.6), fontSize: scaled(settings, 14) }} className="font-medium tracking-wide">
                #{left.carNumber} · {left.car}
              </span>
            </div>
          </div>

          {/* VS badge */}
          <div
            className="flex items-center justify-center mx-3 font-bold"
            style={{
              background: settings.accentColor,
              color: settings.secondaryColor,
              width: scaled(settings, 56),
              height: scaled(settings, 56),
              borderRadius: radius,
              border: borderColor !== 'transparent' ? `2px solid ${borderColor}` : 'none',
              transform: `skewX(-${skew}deg)`,
            }}
          >
            <span style={{ transform: `skewX(${skew}deg)` }}>VS</span>
          </div>

          {/* Right side */}
          <div className="flex flex-col items-start">
            <div
              className="flex items-center px-6"
              style={{
                background: settings.primaryColor,
                transform: `skewX(${skew}deg)`,
                height: scaled(settings, 50),
                borderRadius: radius,
                border: borderColor !== 'transparent' ? `2px solid ${borderColor}` : 'none',
                minWidth: scaled(settings, 280),
              }}
            >
              <span
                style={{ transform: `skewX(-${skew}deg)`, color: settings.textColor, fontSize: scaled(settings, 26) }}
                className="font-bold tracking-wider uppercase"
              >
                {right.name}
              </span>
            </div>
            <div
              className="flex items-center px-6 -mt-[1px]"
              style={{
                background: withOpacity(settings.secondaryColor, opacity),
                transform: `skewX(${skew}deg)`,
                height: scaled(settings, 32),
                borderRadius: radius,
                minWidth: scaled(settings, 240),
              }}
            >
              <span style={{ transform: `skewX(-${skew}deg)`, color: withOpacity(settings.textColor, 0.8), fontSize: scaled(settings, 18) }} className="font-medium tracking-wide">
                {right.country} <span className="text-white/40 mx-1">·</span> {right.team}
              </span>
            </div>
            <div
              className="flex items-center px-6 -mt-[1px]"
              style={{
                background: withOpacity(settings.secondaryColor, opacity * 0.8),
                transform: `skewX(${skew}deg)`,
                height: scaled(settings, 26),
                borderRadius: radius,
                minWidth: scaled(settings, 200),
              }}
            >
              <span style={{ transform: `skewX(-${skew}deg)`, color: withOpacity(settings.textColor, 0.6), fontSize: scaled(settings, 14) }} className="font-medium tracking-wide">
                #{right.carNumber} · {right.car}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VsLowerThird;
