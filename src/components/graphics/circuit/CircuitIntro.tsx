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
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      fontFamily: font,
    }}>
      {data.imageUrl && (
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${data.imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.25,
        }} />
      )}

      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: scaled(settings, 12),
        textAlign: 'center',
        padding: scaled(settings, 48),
        maxWidth: '80%',
      }}>
        <span style={{
          fontSize: scaled(settings, 18),
          fontWeight: 600,
          color: s.accentColor,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}>
          {data.series}
        </span>

        <span style={{
          fontSize: scaled(settings, 72),
          fontWeight: 700,
          color: s.textColor,
          lineHeight: 1,
          textTransform: 'uppercase',
        }}>
          {data.eventName || data.circuit}
        </span>

        {data.round && (
          <span style={{
            fontSize: scaled(settings, 36),
            fontWeight: 600,
            color: s.textColor,
            opacity: 0.7,
            textTransform: 'uppercase',
          }}>
            {data.round}
          </span>
        )}

        <div style={{
          display: 'flex',
          gap: scaled(settings, 32),
          marginTop: scaled(settings, 16),
        }}>
          {data.place && (
            <span style={{
              fontSize: scaled(settings, 22),
              color: s.textColor,
              opacity: 0.5,
            }}>
              {data.place}
            </span>
          )}
          {data.date && (
            <span style={{
              fontSize: scaled(settings, 22),
              color: s.textColor,
              opacity: 0.5,
            }}>
              {data.date}
            </span>
          )}
          {data.session && (
            <span style={{
              fontSize: scaled(settings, 22),
          color: s.accentColor,
              opacity: 0.7,
            }}>
              {data.session}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CircuitIntro;
