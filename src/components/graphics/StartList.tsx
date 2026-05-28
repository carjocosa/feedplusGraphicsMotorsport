import { motion } from 'framer-motion';
import type { StartListEntry, GraphicsSettings } from '@/types/rally';
import { layoutStyle } from '@/lib/graphicsStyle';
import { label } from '@/lib/i18n';
import { fadeUp } from '@/lib/animations';

interface Props {
  data: StartListEntry[];
  settings: GraphicsSettings;
  onMouseDown?: (e: React.MouseEvent) => void;
}

const StartList = ({ data, settings, onMouseDown }: Props) => {
  return (
    <div style={layoutStyle(settings, 'startList')} onMouseDown={onMouseDown}>
      <motion.div
        className="font-rajdhani w-[520px]"
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -60 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
      <motion.div variants={fadeUp(0.5)} initial="hidden" animate="visible" className="h-[48px] flex items-center px-6" style={{ background: settings.primaryColor }}>
        <span className="text-white text-[22px] font-bold tracking-widest uppercase">{label('START LIST', settings.language, settings.customLabels)}</span>
      </motion.div>

      {data.map((entry, i) => (
        <motion.div
          key={entry.carNumber}
          className="flex items-center h-[44px] px-4 border-b"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          style={{
            background: `${settings.secondaryColor}${i % 2 === 0 ? 'ee' : 'dd'}`,
            borderColor: `${settings.primaryColor}33`,
          }}
        >
          <span className="w-[35px] text-[18px] font-bold text-white/60 text-center">{entry.startOrder}</span>
          <span className="w-[50px] text-[18px] font-bold text-center" style={{ color: settings.accentColor }}>
            #{entry.carNumber}
          </span>
          <span className="flex-1 text-white text-[17px] font-semibold truncate px-2 leading-tight">
            {entry.driverName}
            {entry.coDriverName && (
              <div className="text-white/50 text-[13px]"><span className="mr-1">&#8226;</span>{entry.coDriverName}</div>
            )}
          </span>
          <span className="text-white/80 text-[18px] font-bold tabular-nums">{entry.startTime}</span>
        </motion.div>
      ))}
    </motion.div>
    </div>
  );
};

export default StartList;
