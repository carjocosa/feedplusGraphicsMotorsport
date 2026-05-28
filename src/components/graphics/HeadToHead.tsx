import { motion } from 'framer-motion';
import type { HeadToHeadData, GraphicsSettings } from '@/types/rally';
import { layoutStyle } from '@/lib/graphicsStyle';
import { label } from '@/lib/i18n';
import { fadeUp, slideLeft, slideRight, scaleIn } from '@/lib/animations';

interface Props {
  data: HeadToHeadData;
  settings: GraphicsSettings;
  onMouseDown?: (e: React.MouseEvent) => void;
}

const HeadToHead = ({ data, settings, onMouseDown }: Props) => {
  const _l = (k: string) => label(k, settings.language, settings.customLabels);
  const maxTime = 30;
  const diffNum = parseFloat(data.diff) || 0;
  const barWidth = Math.min((diffNum / maxTime) * 100, 95);
  const dur = 0.45;

  return (
    <div style={layoutStyle(settings, 'headToHead')} onMouseDown={onMouseDown}>
      <motion.div
        className="font-rajdhani w-[700px]"
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
      <motion.div variants={fadeUp(dur)} initial="hidden" animate="visible" className="h-[44px] flex items-center justify-center px-6" style={{ background: settings.primaryColor }}>
        <span className="text-white text-[22px] font-bold tracking-widest">{_l('HEAD TO HEAD')}</span>
      </motion.div>

      <div className="flex flex-col" style={{ background: `${settings.secondaryColor}ee` }}>
        <motion.div
          variants={slideLeft(dur)}
          initial="hidden"
          animate="visible"
          className="flex items-center h-[56px] px-5 border-b"
          style={{ borderColor: `${settings.primaryColor}44` }}
        >
          <span className="w-[50px] text-[20px] font-bold" style={{ color: settings.accentColor }}>#{data.driver1.carNumber}</span>
          <span className="text-[18px] mr-2">{data.driver1.country}</span>
          <span className="flex-1 text-white text-[22px] font-bold tracking-wide">{data.driver1.name}</span>
          <span className="text-white text-[24px] font-bold tabular-nums">{data.driver1.time}</span>
          {data.leader === 1 && (
            <motion.span variants={scaleIn(0.3)} initial="hidden" animate="visible" className="ml-3 px-2 py-0.5 text-[14px] font-bold" style={{ background: settings.accentColor, color: settings.secondaryColor }}>
              {_l('FASTEST')}
            </motion.span>
          )}
        </motion.div>

        <div className="h-[36px] flex items-center px-5">
          <div className="flex-1 h-[8px] relative" style={{ background: `${settings.primaryColor}44` }}>
            <motion.div
              className="absolute top-0 left-1/2 h-full"
              initial={{ width: 0 }}
              animate={{ width: `${barWidth}%` }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
              style={{
                background: settings.primaryColor,
                [data.leader === 1 ? 'right' : 'left']: '50%',
                [data.leader === 1 ? 'left' : 'right']: 'auto',
                transform: data.leader === 2 ? 'none' : 'translateX(-100%)',
              }}
            />
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-0.5 text-[16px] font-bold"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              style={{ background: settings.primaryColor, color: '#fff' }}
            >
              {data.diff}s
            </motion.div>
          </div>
        </div>

        <motion.div
          variants={slideRight(dur)}
          initial="hidden"
          animate="visible"
          className="flex items-center h-[56px] px-5"
        >
          <span className="w-[50px] text-[20px] font-bold" style={{ color: settings.accentColor }}>#{data.driver2.carNumber}</span>
          <span className="text-[18px] mr-2">{data.driver2.country}</span>
          <span className="flex-1 text-white text-[22px] font-bold tracking-wide">{data.driver2.name}</span>
          <span className="text-white text-[24px] font-bold tabular-nums">{data.driver2.time}</span>
          {data.leader === 2 && (
            <motion.span variants={scaleIn(0.3)} initial="hidden" animate="visible" className="ml-3 px-2 py-0.5 text-[14px] font-bold" style={{ background: settings.accentColor, color: settings.secondaryColor }}>
              {_l('FASTEST')}
            </motion.span>
          )}
        </motion.div>
      </div>
    </motion.div>
    </div>
  );
};

export default HeadToHead;
