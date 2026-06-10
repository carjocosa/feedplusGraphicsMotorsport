import type { GraphicsSettings } from '@/types/rally';
import type { CircuitIntroData } from '@/types/circuit';
import { mergeColors, layoutStyle, fontStack, scaled } from '@/lib/graphicsStyle';

interface Props {
  data: CircuitIntroData;
  settings: GraphicsSettings;
}

const CircuitIntro = ({ data, settings }: Props) => {
  const style = layoutStyle(settings, 'circuitIntro');
  const s = mergeColors(settings, 'circuitIntro');
  const font = fontStack(settings);

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
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          src={data.videoUrl}
        />
      ) : data.imageUrl ? (
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${data.imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />
      ) : null}

      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.5) 40%, rgba(10,10,10,0.7) 70%, rgba(10,10,10,0.95) 100%)',
      }} />

      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        background: s.accentColor,
      }} />

      <div style={{
        position: 'relative',
        zIndex: 1,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: `0 ${scaled(settings, 80)}px`,
      }}>
        <div style={{
          fontSize: scaled(settings, 16),
          fontWeight: 700,
          color: s.accentColor,
          letterSpacing: '0.35em',
          textTransform: 'uppercase',
          marginBottom: scaled(settings, 8),
        }}>
          {data.series}
        </div>

        {data.round && (
          <div style={{
            fontSize: scaled(settings, 22),
            fontWeight: 500,
            color: s.textColor,
            opacity: 0.5,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: scaled(settings, 20),
          }}>
            {data.round}
          </div>
        )}

        <div style={{
          width: scaled(settings, 80),
          height: 3,
          background: s.accentColor,
          marginBottom: scaled(settings, 32),
        }} />

        <div style={{
          fontSize: scaled(settings, 96),
          fontWeight: 800,
          color: s.textColor,
          lineHeight: 0.92,
          textTransform: 'uppercase',
          letterSpacing: '-0.02em',
          maxWidth: '80%',
        }}>
          {data.eventName || data.circuit}
        </div>

        {data.circuit && data.eventName && (
          <div style={{
            fontSize: scaled(settings, 32),
            fontWeight: 400,
            color: s.textColor,
            opacity: 0.4,
            marginTop: scaled(settings, 16),
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}>
            {data.circuit}
          </div>
        )}
      </div>

      {data.trackMapUrl && (
        <div style={{
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
        }}>
          <img
            src={data.trackMapUrl}
            alt="trazado"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </div>
      )}

      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: scaled(settings, 40),
        padding: `${scaled(settings, 24)}px ${scaled(settings, 80)}px`,
        borderTop: `1px solid ${s.textColor}15`,
      }}>
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
      </div>
    </div>
  );
};

export default CircuitIntro;
