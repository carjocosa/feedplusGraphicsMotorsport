import { motion } from 'framer-motion';
import type { GraphicsSettings } from '@/types/rally';
import type { CircuitIntroData } from '@/types/circuit';
import { mergeColors, layoutStyle, fontStack, scaled } from '@/lib/graphicsStyle';

interface Props {
  data: CircuitIntroData;
  settings: GraphicsSettings;
}

const stagger = {
  animate: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const fadeSlide = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const CircuitIntro = ({ data, settings }: Props) => {
  const style = layoutStyle(settings, 'circuitIntro');
  const s = mergeColors(settings, 'circuitIntro');
  const font = fontStack(settings);
  const a = data.animated;

  return (
    <div style={{
      ...style,
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      fontFamily: font,
    }}>
      {data.videoUrl ? (
        <video autoPlay muted loop playsInline
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          src={data.videoUrl}
        />
      ) : data.imageUrl ? (
        <motion.div
          animate={a ? { scale: [1, 1.04, 1] } : undefined}
          transition={a ? { duration: 8, repeat: Infinity, ease: 'easeInOut' } : undefined}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${data.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      ) : null}

      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.5) 40%, rgba(10,10,10,0.7) 70%, rgba(10,10,10,0.95) 100%)',
      }} />

      <motion.div
        animate={a ? { opacity: [1, 0.5, 1] } : undefined}
        transition={a ? { duration: 4, repeat: Infinity, ease: 'easeInOut' } : undefined}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: s.accentColor,
        }}
      />

      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        style={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: `0 ${scaled(settings, 80)}px`,
        }}
      >
        {data.series && (
          <motion.div variants={fadeSlide} style={{
            fontSize: scaled(settings, 16),
            fontWeight: 700,
            color: s.accentColor,
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            marginBottom: scaled(settings, 8),
          }}>
            {data.series}
          </motion.div>
        )}

        {data.round && (
          <motion.div variants={fadeSlide} style={{
            fontSize: scaled(settings, 22),
            fontWeight: 500,
            color: s.textColor,
            opacity: 0.5,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: scaled(settings, 20),
          }}>
            {data.round}
          </motion.div>
        )}

        <motion.div
          variants={fadeSlide}
          animate={a ? {
            scaleX: [1, 0.4, 1],
            transition: { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1.5 },
          } : undefined}
          style={{
            width: scaled(settings, 80),
            height: 3,
            background: s.accentColor,
            marginBottom: scaled(settings, 32),
            transformOrigin: 'left',
          }}
        />

        <motion.div variants={fadeSlide} style={{
          fontSize: scaled(settings, 96),
          fontWeight: 800,
          color: s.textColor,
          lineHeight: 0.92,
          textTransform: 'uppercase',
          letterSpacing: '-0.02em',
          maxWidth: '80%',
        }}>
          {data.eventName || data.circuit}
        </motion.div>

        {data.circuit && data.eventName && (
          <motion.div variants={fadeSlide} style={{
            fontSize: scaled(settings, 32),
            fontWeight: 400,
            color: s.textColor,
            opacity: 0.4,
            marginTop: scaled(settings, 16),
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}>
            {data.circuit}
          </motion.div>
        )}
      </motion.div>

      {data.trackMapUrl && (
        <motion.div
          initial={a ? { opacity: 0, x: 40 } : undefined}
          animate={a ? { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.5 } } : undefined}
          style={{
            position: 'absolute',
            right: scaled(settings, 60),
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            width: scaled(settings, 320),
            height: scaled(settings, 320),
            borderRadius: 12,
            overflow: 'hidden',
            border: `2px solid ${s.textColor}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)',
            padding: scaled(settings, 16),
          }}
        >
          <motion.img
            src={data.trackMapUrl} alt="trazado"
            animate={a ? {
              scale: [1, 1.03, 1],
              transition: { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 },
            } : undefined}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </motion.div>
      )}

      <motion.div
        initial={a ? { opacity: 0 } : undefined}
        animate={a ? { opacity: 1, transition: { duration: 0.5, delay: 0.8 } } : undefined}
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: scaled(settings, 40),
          padding: `${scaled(settings, 24)}px ${scaled(settings, 80)}px`,
          borderTop: `1px solid ${s.textColor}15`,
        }}
      >
        {[data.place, data.date, data.session].filter(Boolean).map((item, i) => (
          <div key={i} style={{
            fontSize: scaled(settings, 16),
            fontWeight: 500,
            color: s.textColor,
            opacity: 0.5,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}>
            {item}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default CircuitIntro;
