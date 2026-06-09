import { motion } from 'framer-motion';
import type { GuestLowerThirdData } from '@/types/circuit';
import type { GraphicsSettings } from '@/types/rally';
import { cornerRadius, fontStack, scaled, withOpacity, layoutStyle } from '@/lib/graphicsStyle';
import { useAnimDur, staggerContainer, slideLeft } from '@/lib/animations';

interface Props {
  data: GuestLowerThirdData;
  settings: GraphicsSettings;
  onMouseDown?: (e: React.MouseEvent) => void;
}

const GuestLowerThird = ({ data, settings, onMouseDown }: Props) => {
  const skew = settings.shearAngle;
  const dur = useAnimDur(settings);
  const radius = cornerRadius(settings);
  const border = settings.borderAccent ? `2px solid ${settings.accentColor}` : 'none';

  return (
    <div style={layoutStyle(settings, 'guestLowerThird')} onMouseDown={onMouseDown}>
      <motion.div
        style={{ fontFamily: fontStack(settings), opacity: settings.panelOpacity }}
        variants={staggerContainer(0)}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
      <div className="flex flex-col">
        <motion.div
          className="flex items-center px-10 min-w-[400px]"
          variants={slideLeft(dur)}
          style={{
            background: settings.primaryColor,
            transform: `skewX(-${skew}deg)`,
            marginLeft: `${skew * 2}px`,
            height: scaled(settings, 46),
            borderRadius: radius,
            border,
          }}
        >
          <span
            style={{ transform: `skewX(${skew}deg)`, color: settings.textColor, fontSize: scaled(settings, 26) }}
            className="font-bold tracking-wider uppercase"
          >
            {data.name}
          </span>
        </motion.div>
        <motion.div
          className="flex items-center px-10 min-w-[320px] -mt-[1px]"
          variants={slideLeft(dur)}
          style={{
            background: settings.secondaryColor,
            transform: `skewX(-${skew}deg)`,
            marginLeft: `${skew * 2}px`,
            height: scaled(settings, 30),
            borderRadius: radius,
          }}
        >
          <span
            style={{ transform: `skewX(${skew}deg)`, color: withOpacity(settings.textColor, 0.8), fontSize: scaled(settings, 16) }}
            className="font-medium tracking-wide"
          >
            {data.role}
          </span>
          {data.subtitle && (
            <span
              style={{ transform: `skewX(${skew}deg)`, color: settings.accentColor, fontSize: scaled(settings, 13), marginLeft: scaled(settings, 16) }}
              className="font-medium tracking-wider uppercase"
            >
              {data.subtitle}
            </span>
          )}
        </motion.div>
      </div>
      </motion.div>
    </div>
  );
};

export default GuestLowerThird;
