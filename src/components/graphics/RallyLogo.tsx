import type { GraphicsSettings } from '@/types/rally';
import { withOpacity } from '@/lib/graphicsStyle';

interface Props {
  url?: string;
  fallbackText?: string;       // letters used in placeholder
  size?: number;               // pixel height
  settings: GraphicsSettings;
  variant?: 'plate' | 'plain'; // 'plate' adds an accent border placa
  className?: string;
}

/**
 * Renders the rally placa/logo. Falls back to a typographic placa when no
 * logoUrl is provided so headers always carry the rally identity.
 */
const RallyLogo = ({ url, fallbackText = 'RALLY', size = 80, settings, variant = 'plate', className }: Props) => {
  if (url) {
    return (
      <img
        src={url}
        alt="Rally logo"
        className={className}
        style={{
          height: size,
          width: 'auto',
          objectFit: 'contain',
          filter: variant === 'plate' ? `drop-shadow(0 4px 12px ${withOpacity('#000000', 0.5)})` : undefined,
        }}
      />
    );
  }

  // Typographic fallback placa
  const initials = fallbackText
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();

  return (
    <div
      className={className}
      style={{
        height: size,
        minWidth: size,
        padding: `0 ${size * 0.25}px`,
        background: settings.primaryColor,
        border: `${Math.max(2, size * 0.04)}px solid ${settings.accentColor}`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: settings.textColor,
        fontWeight: 800,
        fontSize: size * 0.45,
        letterSpacing: '0.1em',
        lineHeight: 1,
        clipPath: 'polygon(8% 0, 100% 0, 92% 100%, 0 100%)',
      }}
    >
      {initials}
    </div>
  );
};

export default RallyLogo;
