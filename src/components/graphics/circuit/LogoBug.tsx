import type { GraphicsSettings } from '@/types/rally';
import type { LogoBugData } from '@/types/circuit';
import { layoutStyle } from '@/lib/graphicsStyle';

interface Props {
  data: LogoBugData;
  settings: GraphicsSettings;
}

const LogoBug = ({ data, settings }: Props) => {
  const style = layoutStyle(settings, 'logoBug');
  const logos = [data.logoUrl, data.secondaryLogoUrl, data.sponsorUrl].filter(Boolean) as string[];

  if (logos.length === 0) return null;

  return (
    <div style={{
      ...style,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      pointerEvents: 'none',
    }}>
      {logos.map((url, i) => (
        <img
          key={i}
          src={url}
          alt=""
          style={{
            height: i === logos.length - 1 ? 28 : 36,
            width: 'auto',
            maxWidth: 100,
            objectFit: 'contain',
            filter: 'brightness(1) drop-shadow(0 1px 2px rgba(0,0,0,0.4))',
          }}
        />
      ))}
    </div>
  );
};

export default LogoBug;
