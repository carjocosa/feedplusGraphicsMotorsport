import { motion } from 'framer-motion';
import type { CountdownData, GraphicsSettings } from '@/types/rally';
import { useEffect, useState } from 'react';
import { layoutStyle } from '@/lib/graphicsStyle';

interface Props {
  data: CountdownData;
  settings: GraphicsSettings;
  onMouseDown?: (e: React.MouseEvent) => void;
}

const CountdownTimer = ({ data, settings, onMouseDown }: Props) => {
  const [remaining, setRemaining] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, data.targetTime - Date.now());
      const totalSec = Math.floor(diff / 1000);
      setRemaining({
        h: Math.floor(totalSec / 3600),
        m: Math.floor((totalSec % 3600) / 60),
        s: totalSec % 60,
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [data.targetTime]);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div style={layoutStyle(settings, 'countdown')} onMouseDown={onMouseDown}>
      <motion.div
        className="font-rajdhani text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.4 }}
      >
      <div className="px-12 py-8" style={{ background: `${settings.secondaryColor}ee` }}>
        <div className="text-[20px] font-bold tracking-[0.3em] uppercase mb-4" style={{ color: settings.accentColor }}>
          {data.label}
        </div>
        <div className="flex items-center justify-center gap-4">
          {[
            { val: remaining.h, label: 'HRS' },
            { val: remaining.m, label: 'MIN' },
            { val: remaining.s, label: 'SEC' },
          ].map(({ val, label }) => (
            <div key={label} className="flex flex-col items-center">
              <span className="text-[72px] font-bold text-white leading-none tabular-nums" style={{ textShadow: `0 0 20px ${settings.primaryColor}66` }}>
                {pad(val)}
              </span>
              <span className="text-white/50 text-[14px] font-medium tracking-widest">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
    </div>
  );
};

export default CountdownTimer;
