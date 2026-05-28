import { motion } from 'framer-motion';
import type { EventData, GraphicsSettings } from '@/types/rally';
import { useEffect, useState } from 'react';
import { animationDuration, cornerRadius, fontStack, scaled, withOpacity, layoutStyle } from '@/lib/graphicsStyle';

interface Props {
  data: EventData;
  settings: GraphicsSettings;
  onMouseDown?: (e: React.MouseEvent) => void;
}

const Scorebug = ({ data, settings, onMouseDown }: Props) => {
  const [clock, setClock] = useState('00:00:00');
  const dur = animationDuration(settings);
  const radius = cornerRadius(settings);

  useEffect(() => {
    const interval = setInterval(() => {
      setClock(new Date().toLocaleTimeString('en-GB'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={layoutStyle(settings, 'scorebug')} onMouseDown={onMouseDown}>
      <motion.div
        style={{ fontFamily: fontStack(settings), opacity: settings.panelOpacity }}
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: settings.panelOpacity, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        transition={{ duration: dur, ease: [0.16, 1, 0.3, 1] }}
      >
      <div className="flex items-stretch" style={{ borderRadius: radius, overflow: 'hidden' }}>
        <div className="flex items-center gap-2 px-4" style={{ background: settings.primaryColor, height: scaled(settings, 44) }}>
          {data.logoUrl && (
            <img
              src={data.logoUrl}
              alt="logo"
              style={{ height: scaled(settings, 30), width: 'auto', objectFit: 'contain' }}
            />
          )}
          <span style={{ color: settings.textColor, fontSize: scaled(settings, 18) }} className="font-bold tracking-widest uppercase">
            {data.eventName}
          </span>
        </div>
        <div className="flex items-center px-4" style={{ background: settings.secondaryColor, height: scaled(settings, 44) }}>
          <span style={{ color: settings.accentColor, fontSize: scaled(settings, 16) }} className="font-bold">
            SS{data.stageNumber}
          </span>
          <span style={{ color: withOpacity(settings.textColor, 0.7), fontSize: scaled(settings, 14) }} className="ml-2 font-medium">
            {data.stageName}
          </span>
        </div>
        <div className="flex items-center px-4" style={{ background: `${settings.secondaryColor}cc`, height: scaled(settings, 44) }}>
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse-live mr-2" />
          <span style={{ color: settings.textColor, fontSize: scaled(settings, 18) }} className="font-bold tabular-nums">
            {clock}
          </span>
        </div>
      </div>
      </motion.div>
    </div>
  );
};

export default Scorebug;
