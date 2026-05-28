import { motion } from 'framer-motion';
import type { GraphicsSettings } from '@/types/rally';

interface Props {
  settings: GraphicsSettings;
  onComplete?: () => void;
}

const Stinger = ({ settings, onComplete }: Props) => {
  return (
    <motion.div
      className="absolute inset-0 z-50 pointer-events-none"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onAnimationComplete={onComplete}
    >
      {/* Main wipe bar */}
      <div
        className="absolute inset-0 animate-stinger"
        style={{ background: settings.primaryColor }}
      />
      {/* Secondary bar (offset) */}
      <div
        className="absolute inset-0 animate-stinger"
        style={{
          background: settings.secondaryColor,
          animationDelay: '0.06s',
        }}
      />
      {/* Accent line */}
      <div
        className="absolute top-1/2 left-0 right-0 h-[4px] animate-stinger"
        style={{
          background: settings.accentColor,
          animationDelay: '0.1s',
        }}
      />
    </motion.div>
  );
};

export default Stinger;
