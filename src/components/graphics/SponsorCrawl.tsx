import { motion } from 'framer-motion';
import type { Sponsor, GraphicsSettings } from '@/types/rally';
import { withOpacity, layoutStyle } from '@/lib/graphicsStyle';

interface Props {
  data: Sponsor[];
  settings: GraphicsSettings;
  onMouseDown?: (e: React.MouseEvent) => void;
}

const SponsorCrawl = ({ data, settings, onMouseDown }: Props) => {
  // Duplicate for seamless loop
  const sponsors = [...data, ...data];
  const logoHeight = 56;

  return (
    <div style={layoutStyle(settings, 'sponsorCrawl')} onMouseDown={onMouseDown}>
      <motion.div
        className="font-rajdhani overflow-hidden"
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        exit={{ y: 80 }}
        transition={{ duration: 0.3 }}
      >
      <div
        className="flex items-center"
        style={{
          height: 80,
          background: `linear-gradient(180deg, ${withOpacity(settings.secondaryColor, 0.95)}, ${settings.secondaryColor})`,
          borderTop: `3px solid ${settings.primaryColor}`,
        }}
      >
        {/* Sticky "PARTNERS" plate */}
        <div
          className="flex items-center justify-center h-full px-5 shrink-0"
          style={{
            background: settings.primaryColor,
            color: settings.textColor,
            clipPath: `polygon(0 0, 100% 0, calc(100% - 16px) 100%, 0 100%)`,
            paddingRight: 30,
            minWidth: 220,
          }}
        >
          <span className="font-bold tracking-[0.4em] uppercase text-[16px]">
            ★ PARTNERS
          </span>
        </div>

        <div className="animate-sponsor-scroll flex items-center whitespace-nowrap pl-6">
          {sponsors.map((s, i) => (
            <div
              key={i}
              className="mx-8 flex items-center justify-center"
              style={{ height: logoHeight }}
            >
              {s.logoUrl ? (
                <img
                  src={s.logoUrl}
                  alt={s.name}
                  style={{
                    height: logoHeight,
                    width: 'auto',
                    objectFit: 'contain',
                    filter: 'brightness(0) invert(1)', // turn into clean white silhouette
                    opacity: 0.95,
                  }}
                />
              ) : (
                // Typographic placeholder so missing logos still look broadcast-grade
                <div
                  className="flex items-center justify-center px-4 font-bold tracking-[0.25em] uppercase"
                  style={{
                    height: logoHeight,
                    border: `2px solid ${withOpacity(settings.accentColor, 0.7)}`,
                    color: settings.accentColor,
                    fontSize: 18,
                    minWidth: 140,
                  }}
                >
                  {s.name}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
    </div>
  );
};

export default SponsorCrawl;
