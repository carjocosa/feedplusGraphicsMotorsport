import { motion } from 'framer-motion';
import type { TimingEntry, GraphicsSettings } from '@/types/rally';
import { layoutStyle } from '@/lib/graphicsStyle';
import { label } from '@/lib/i18n';
import { fadeUp } from '@/lib/animations';

interface Props {
  data: TimingEntry[];
  settings: GraphicsSettings;
  onMouseDown?: (e: React.MouseEvent) => void;
}

const OverallStandings = ({ data, settings, onMouseDown }: Props) => {
  const width = settings.towerWidth ?? 580;
  const pageSize = settings.displayPageSize ?? 15;
  const pageOffset = settings.displayPageOffset ?? 0;
  const visibleData = data.slice(pageOffset * pageSize, (pageOffset + 1) * pageSize);

  return (
    <div style={layoutStyle(settings, 'overallStandings')} onMouseDown={onMouseDown}>
      <motion.div
        className="font-rajdhani"
        style={{ width }}
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 60 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
      <motion.div variants={fadeUp(0.5)} initial="hidden" animate="visible" className="h-[48px] flex items-center px-6" style={{ background: settings.primaryColor }}>
        <span className="text-white text-[22px] font-bold tracking-widest uppercase">{label('OVERALL STANDINGS', settings.language, settings.customLabels)}</span>
        {data.length > pageSize && (
          <span className="ml-auto text-white/60 text-[14px]">
            {pageOffset + 1}/{Math.ceil(data.length / pageSize)}
          </span>
        )}
      </motion.div>

      {visibleData.map((entry, i) => {
        const globalPos = pageOffset * pageSize + i + 1;
        return (
        <motion.div
          key={entry.carNumber}
          className="flex items-center h-[46px] px-4 border-b"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          style={{
            background: globalPos === 1 ? `${settings.accentColor}22` : `${settings.secondaryColor}${i % 2 === 0 ? 'ee' : 'dd'}`,
            borderColor: `${settings.primaryColor}33`,
          }}
        >
          <span className="w-[40px] text-center text-[22px] font-bold" style={{ color: globalPos === 1 ? settings.accentColor : '#fff' }}>
            {entry.position}
          </span>
          <span className="w-[50px] text-center text-[18px] font-bold" style={{ color: settings.accentColor }}>
            #{entry.carNumber}
          </span>
          <span className="flex-1 text-white text-[18px] font-semibold tracking-wide truncate px-2 leading-tight">
            {entry.driverName}
            {entry.coDriverName && (
              <div className="text-white/50 text-[14px]"><span className="mr-1">&#8226;</span>{entry.coDriverName}</div>
            )}
          </span>
          <span className="w-[120px] text-right text-white text-[18px] font-bold tabular-nums">
            {entry.time}
          </span>
          <span className="w-[90px] text-right text-[16px] font-semibold tabular-nums" style={{ color: globalPos === 1 ? settings.accentColor : '#EF4444' }}>
            {entry.diff || label('LEADER', settings.language, settings.customLabels)}
          </span>
        </motion.div>
        );
      })}
    </motion.div>
    </div>
  );
};

export default OverallStandings;
