import { motion } from 'framer-motion';
import type { Entry, GraphicsSettings } from '@/types/rally';
import { layoutStyle } from '@/lib/graphicsStyle';
import { label } from '@/lib/i18n';
import { fadeUp } from '@/lib/animations';

interface Props {
  data: Entry[];
  settings: GraphicsSettings;
  title?: string;
  onMouseDown?: (e: React.MouseEvent) => void;
}

const EntriesList = ({ data, settings, title: _title, onMouseDown }: Props) => {
  const title = _title ?? label('ENTRANTS LIST', settings.language, settings.customLabels);
  const width = settings.towerWidth ?? 560;
  const pageSize = settings.displayPageSize ?? 15;
  const pageOffset = settings.displayPageOffset ?? 0;
  const visibleData = data.slice(pageOffset * pageSize, (pageOffset + 1) * pageSize);
  const totalPages = Math.ceil(data.length / pageSize);

  return (
    <div style={layoutStyle(settings, 'entriesList')} onMouseDown={onMouseDown}>
      <motion.div
        className="font-rajdhani"
        style={{ width }}
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -60 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div variants={fadeUp(0.5)} initial="hidden" animate="visible" className="h-[48px] flex items-center px-6" style={{ background: settings.primaryColor }}>
          <span className="text-white text-[22px] font-bold tracking-widest uppercase">{title}</span>
          {data.length > pageSize && (
            <span className="ml-auto text-white/60 text-[14px]">
              {pageOffset + 1}/{totalPages}
            </span>
          )}
        </motion.div>

        <div className="grid grid-cols-[40px_50px_1fr_1fr_80px] gap-2 px-4 py-2 text-[11px] uppercase tracking-wider font-bold" style={{ background: `${settings.secondaryColor}ee`, color: settings.accentColor }}>
          <span className="text-center">{label('Pos', settings.language, settings.customLabels)}</span>
          <span className="text-center">{label('#', settings.language, settings.customLabels)}</span>
          <span>{label('Crew', settings.language, settings.customLabels)}</span>
          <span>{label('Team', settings.language, settings.customLabels)}</span>
          <span className="text-right">{label('Cat', settings.language, settings.customLabels)}</span>
        </div>

        {visibleData.map((entry, i) => {
          const globalPos = pageOffset * pageSize + i + 1;
          return (
            <motion.div
              key={entry.carNumber || i}
              className="grid grid-cols-[40px_50px_1fr_1fr_80px] gap-2 px-4 border-b"
              style={{
                height: 40,
                alignItems: 'center',
                background: `${settings.secondaryColor}${globalPos % 2 === 0 ? 'ee' : 'dd'}`,
                borderColor: `${settings.primaryColor}22`,
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <span className="text-center text-[18px] font-bold" style={{ color: globalPos === 1 ? settings.accentColor : '#fff' }}>
                {globalPos}
              </span>
              <span className="text-center text-[16px] font-bold" style={{ color: settings.accentColor }}>
                #{entry.carNumber}
              </span>
              <span className="text-white text-[16px] font-semibold truncate leading-tight">
                {entry.driverName}
                {entry.coDriverName && (
                  <div className="text-white/50 text-[12px]"><span className="mr-1">&#8226;</span>{entry.coDriverName}</div>
                )}
              </span>
              <span className="text-white/70 text-[14px] truncate">{entry.team}</span>
              <span className="text-right text-[14px] font-bold" style={{ color: settings.accentColor }}>
                {entry.category || '\u2014'}
              </span>
            </motion.div>
          );
        })}

        <div className="h-[32px] flex items-center justify-center px-4" style={{ background: `${settings.primaryColor}44` }}>
          <span className="text-white/60 text-[12px] font-bold tracking-wider">
            {data.length} {label('ENTRIES', settings.language, settings.customLabels).toUpperCase()} {'\u00B7'} {totalPages > 1 ? `${pageOffset + 1}/${totalPages}` : label('ALL', settings.language, settings.customLabels).toUpperCase()}
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default EntriesList;
