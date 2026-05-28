import { motion } from 'framer-motion';
import type { StageData, GraphicsSettings } from '@/types/rally';
import { cornerRadius, fontStack, scaled, withOpacity, layoutStyle } from '@/lib/graphicsStyle';
import { useAnimDur, staggerContainer, slideLeft, scaleIn } from '@/lib/animations';

interface Props {
  data: StageData;
  settings: GraphicsSettings;
  onMouseDown?: (e: React.MouseEvent) => void;
}

const surfaceLabels: Record<string, string> = {
  gravel: 'TIERRA',
  asphalt: 'ASFALTO',
  snow: 'NIEVE',
};

const StageLowerThird = ({ data, settings, onMouseDown }: Props) => {
  const skew = settings.shearAngle;
  const dur = useAnimDur(settings);
  const radius = cornerRadius(settings);
  const border = settings.borderAccent ? `2px solid ${settings.accentColor}` : 'none';

  return (
    <div style={layoutStyle(settings, 'stageLowerThird')} onMouseDown={onMouseDown}>
      <motion.div
        style={{ fontFamily: fontStack(settings), opacity: settings.panelOpacity }}
        variants={staggerContainer(0)}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
      <div className="flex items-end">
        <motion.div
          className="flex items-center justify-center w-[90px] h-[90px] font-bold"
          variants={scaleIn(dur)}
          style={{
            background: settings.accentColor,
            color: settings.secondaryColor,
            clipPath: `polygon(0 0, 100% 0, ${100 - skew}% 100%, 0 100%)`,
            fontSize: scaled(settings, 30),
            borderRadius: radius,
            border,
          }}
        >
          SS{data.stageNumber}
        </motion.div>

        <div className="flex flex-col -ml-[2px]">
          <motion.div
            className="flex items-center px-10 min-w-[480px]"
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
              SS{data.stageNumber} &mdash; {data.stageName}
            </span>
          </motion.div>

          <motion.div
            className="flex items-center gap-6 px-10 min-w-[380px] -mt-[1px]"
            variants={slideLeft(dur)}
            style={{
              background: settings.secondaryColor,
              transform: `skewX(-${skew}deg)`,
              marginLeft: `${skew * 2}px`,
              height: scaled(settings, 34),
              borderRadius: radius,
            }}
          >
            <span
              style={{ transform: `skewX(${skew}deg)`, color: withOpacity(settings.textColor, 0.9), fontSize: scaled(settings, 18) }}
              className="font-medium tracking-wide flex items-center gap-4"
            >
              <span>{data.distance}</span>
              <span style={{ color: withOpacity(settings.textColor, 0.4) }}>|</span>
              <span>{surfaceLabels[data.surface]}</span>
            </span>
          </motion.div>
        </div>
      </div>
      </motion.div>
    </div>
  );
};

export default StageLowerThird;
