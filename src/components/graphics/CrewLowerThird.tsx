import { motion } from 'framer-motion';
import type { CrewData, GraphicsSettings } from '@/types/rally';
import { cornerRadius, fontStack, scaled, withOpacity, layoutStyle } from '@/lib/graphicsStyle';
import { useAnimDur, staggerContainer, slideLeft, slideRight, scaleIn } from '@/lib/animations';

interface Props {
  data: CrewData;
  settings: GraphicsSettings;
  onMouseDown?: (e: React.MouseEvent) => void;
}

const CrewLowerThird = ({ data, settings, onMouseDown }: Props) => {
  const skew = settings.shearAngle;
  const dur = useAnimDur(settings);
  const radius = cornerRadius(settings);
  const opacity = settings.panelOpacity;
  const border = settings.borderAccent ? `2px solid ${settings.accentColor}` : 'none';
  const isHorizontal = settings.lowerThirdLayout === 'horizontal';

  if (isHorizontal) {
    return (
      <div style={layoutStyle(settings, 'crewLowerThird')} onMouseDown={onMouseDown}>
        <motion.div
          style={{ fontFamily: fontStack(settings), opacity }}
          variants={staggerContainer(0)}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <div className="flex items-center">
            <motion.div className="flex flex-col" variants={slideLeft(dur)}>
              <div
                className="flex items-center px-8"
                style={{
                  background: settings.primaryColor,
                  transform: `skewX(-${skew}deg)`,
                  height: scaled(settings, 44),
                  borderRadius: radius,
                  border,
                }}
              >
                <span style={{ transform: `skewX(${skew}deg)`, color: settings.textColor, fontSize: scaled(settings, 24) }} className="font-bold tracking-wider uppercase">
                  {data.driverCountry} {data.driverName}
                </span>
              </div>
              <div
                className="flex items-center px-8 -mt-[1px]"
                style={{
                  background: settings.secondaryColor,
                  transform: `skewX(-${skew}deg)`,
                  height: scaled(settings, 32),
                  borderRadius: radius,
                  border,
                }}
              >
                <span style={{ transform: `skewX(${skew}deg)`, color: withOpacity(settings.textColor, 0.8), fontSize: scaled(settings, 18) }} className="font-medium tracking-wide">
                  {data.coDriverCountry} {data.coDriverName}
                </span>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center justify-center mx-4 font-bold"
              variants={scaleIn(dur)}
              style={{
                background: settings.accentColor,
                color: settings.secondaryColor,
                width: scaled(settings, 70),
                height: scaled(settings, 70),
                fontSize: scaled(settings, 36),
                borderRadius: radius,
                border,
                transform: `skewX(-${skew}deg)`,
              }}
            >
              <span style={{ transform: `skewX(${skew}deg)` }}>{data.carNumber}</span>
            </motion.div>

            <motion.div className="flex flex-col" variants={slideRight(dur)}>
              <div
                className="flex items-center px-8"
                style={{
                  background: settings.secondaryColor,
                  transform: `skewX(-${skew}deg)`,
                  height: scaled(settings, 44),
                  borderRadius: radius,
                  border,
                }}
              >
                <span style={{ transform: `skewX(${skew}deg)`, color: withOpacity(settings.textColor, 0.7), fontSize: scaled(settings, 16) }} className="font-medium tracking-wide uppercase">
                  {data.team}
                </span>
              </div>
              <div
                className="flex items-center px-8 -mt-[1px]"
                style={{
                  background: `${settings.secondaryColor}cc`,
                  transform: `skewX(-${skew}deg)`,
                  height: scaled(settings, 32),
                  borderRadius: radius,
                }}
              >
                <span style={{ transform: `skewX(${skew}deg)`, color: withOpacity(settings.textColor, 0.6), fontSize: scaled(settings, 16) }} className="font-medium tracking-wide uppercase">
                  {data.car}
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Vertical (tower) layout
  return (
    <div style={layoutStyle(settings, 'crewLowerThird')} onMouseDown={onMouseDown}>
      <motion.div
        style={{ fontFamily: fontStack(settings), opacity }}
        variants={staggerContainer(0)}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
      <div className="flex items-end">
        <motion.div
          className="flex items-center justify-center w-[90px] h-[120px] font-bold"
          variants={scaleIn(dur)}
          style={{
            background: settings.accentColor,
            color: settings.secondaryColor,
            clipPath: `polygon(0 0, 100% 0, ${100 - skew}% 100%, 0 100%)`,
            fontSize: scaled(settings, 48),
            borderRadius: radius,
            border,
          }}
        >
          {data.carNumber}
        </motion.div>

        <div className="flex flex-col -ml-[2px]">
          <motion.div
            className="flex items-center px-10 min-w-[520px]"
            variants={slideLeft(dur)}
            style={{
              background: settings.primaryColor,
              transform: `skewX(-${skew}deg)`,
              marginLeft: `${skew * 2}px`,
              height: scaled(settings, 50),
              borderRadius: radius,
              border,
            }}
          >
            <span
              style={{ transform: `skewX(${skew}deg)`, color: settings.textColor, fontSize: scaled(settings, 28) }}
              className="font-bold tracking-wider uppercase"
            >
              {data.driverCountry} {data.driverName}
            </span>
          </motion.div>

          <motion.div
            className="flex items-center px-10 min-w-[460px] -mt-[1px]"
            variants={slideLeft(dur)}
            style={{
              background: settings.secondaryColor,
              transform: `skewX(-${skew}deg)`,
              marginLeft: `${skew * 2}px`,
              height: scaled(settings, 38),
              borderRadius: radius,
              border,
            }}
          >
            <span
              style={{ transform: `skewX(${skew}deg)`, color: withOpacity(settings.textColor, 0.9), fontSize: scaled(settings, 22) }}
              className="font-medium tracking-wide"
            >
              {data.coDriverCountry} {data.coDriverName}
            </span>
          </motion.div>

          <motion.div
            className="flex items-center px-10 min-w-[380px] -mt-[1px]"
            variants={slideLeft(dur)}
            style={{
              background: `${settings.secondaryColor}cc`,
              transform: `skewX(-${skew}deg)`,
              marginLeft: `${skew * 2}px`,
              height: scaled(settings, 28),
              borderRadius: radius,
            }}
          >
            <span
              style={{ transform: `skewX(${skew}deg)`, color: withOpacity(settings.textColor, 0.7), fontSize: scaled(settings, 16) }}
              className="font-medium tracking-wide uppercase"
            >
              {data.team} &middot; {data.car}
            </span>
          </motion.div>
        </div>
      </div>
      </motion.div>
    </div>
  );
};

export default CrewLowerThird;
