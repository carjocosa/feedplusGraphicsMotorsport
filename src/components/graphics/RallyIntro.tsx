import { motion } from 'framer-motion';
import type { RallyIntroData, GraphicsSettings } from '@/types/rally';
import { animationDuration, fontStack, scaled, withOpacity, layoutStyle } from '@/lib/graphicsStyle';
import RallyLogo from './RallyLogo';

interface Props {
  data: RallyIntroData;
  settings: GraphicsSettings;
  onMouseDown?: (e: React.MouseEvent) => void;
}

const surfaceIcon = (s: string) => {
  if (s === 'asphalt') return '\uD83D\uDEE3\uFE0F';
  if (s === 'snow') return '\u2744\uFE0F';
  return '\u26F0\uFE0F';
};

const RallyIntro = ({ data, settings, onMouseDown }: Props) => {
  const skew = settings.shearAngle;
  const dur = animationDuration(settings);

  if (data.variant === 'board') {
    return (
      <div style={layoutStyle(settings, 'rallyIntro')} onMouseDown={onMouseDown}>
        <motion.div
          className="absolute inset-0 z-40 flex items-center justify-center"
          style={{ fontFamily: fontStack(settings), background: `${settings.secondaryColor}cc` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: dur }}
        >
          <div className="absolute inset-0 overflow-hidden opacity-15">
            <div
              className="absolute -top-40 -left-40 w-[1200px] h-[300px]"
              style={{
                background: `linear-gradient(90deg, ${settings.primaryColor}, transparent)`,
                transform: `skewY(-${skew}deg)`,
              }}
            />
          </div>

          <motion.div
            className="relative z-10"
            style={{
              width: 780,
              background: settings.secondaryColor,
              borderTop: `6px solid ${settings.primaryColor}`,
              boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px ${settings.primaryColor}22`,
            }}
            initial={{ y: 60, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: dur }}
          >
            <div className="flex items-center gap-4 px-10 pt-8 pb-2">
              <RallyLogo url={data.logoUrl} fallbackText={data.eventName} settings={settings} size={60} />
              <div className="flex-1" />
              {data.edition && (
                <div
                  className="px-4 py-1 font-bold tracking-[0.4em]"
                  style={{ background: settings.accentColor, color: settings.secondaryColor, fontSize: scaled(settings, 14) }}
                >
                  {data.edition.toUpperCase()}
                </div>
              )}
            </div>

            <div className="px-10 py-4">
              <h1
                className="font-bold uppercase leading-[0.95] tracking-tight"
                style={{ color: settings.textColor, fontSize: scaled(settings, 80) }}
              >
                {data.eventName}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="h-[4px] w-[60px]" style={{ background: settings.primaryColor }} />
                <span className="font-medium tracking-[0.25em] uppercase" style={{ color: withOpacity(settings.textColor, 0.7), fontSize: scaled(settings, 18) }}>
                  {data.location} \u00B7 {data.dates}
                </span>
              </div>
              {data.headline && (
                <p className="mt-4 italic font-medium tracking-wide" style={{ color: withOpacity(settings.textColor, 0.65), fontSize: scaled(settings, 18) }}>
                  &ldquo;{data.headline}&rdquo;
                </p>
              )}
            </div>

            <div className="h-[1px] mx-10" style={{ background: `${settings.textColor}22` }} />

            <div className="grid grid-cols-3 gap-4 px-10 py-6">
              {[
                { label: 'ESPECIALES', value: String(data.totalStages) },
                { label: 'DISTANCIA TOTAL', value: data.totalDistance },
                { label: 'SUPERFICIE', value: data.surface },
              ].map((stat, i) => (
                <div key={stat.label} className="px-5 py-4 border-l-[4px]" style={{
                  background: withOpacity('#000000', 0.3),
                  borderColor: i === 0 ? settings.primaryColor : i === 1 ? settings.accentColor : settings.textColor,
                }}>
                  <div className="font-medium tracking-[0.3em] uppercase mb-1" style={{ color: withOpacity(settings.textColor, 0.45), fontSize: scaled(settings, 12) }}>
                    {stat.label}
                  </div>
                  <div className="font-bold uppercase leading-none" style={{ color: settings.textColor, fontSize: scaled(settings, 36) }}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="h-[1px] mx-10" style={{ background: `${settings.textColor}22` }} />

            <div className="px-10 py-6">
              <div className="font-bold tracking-[0.3em] uppercase mb-3" style={{ color: settings.accentColor, fontSize: scaled(settings, 13) }}>
                ITINERARIO \u00B7 ESPECIALES DE VELOCIDAD
              </div>
              <div className="flex flex-wrap gap-1.5">
                {data.stages.map((s) => (
                  <div key={s.stageNumber} className="flex items-center gap-2 px-3 py-1.5" style={{
                    background: withOpacity(settings.primaryColor, 0.15),
                    borderLeft: `2px solid ${settings.primaryColor}`,
                  }}>
                    <span className="font-bold" style={{ color: settings.accentColor, fontSize: scaled(settings, 13) }}>
                      SS{s.stageNumber}
                    </span>
                    <span className="font-medium" style={{ color: settings.textColor, fontSize: scaled(settings, 13) }}>
                      {s.stageName}
                    </span>
                    <span style={{ color: withOpacity(settings.textColor, 0.5), fontSize: scaled(settings, 12) }}>
                      {s.distance} {surfaceIcon(s.surface)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={layoutStyle(settings, 'rallyIntro')} onMouseDown={onMouseDown}>
      <motion.div
        className="absolute inset-0 z-40"
        style={{ fontFamily: fontStack(settings), background: settings.secondaryColor }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: dur }}
      >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 -left-40 w-[1200px] h-[300px]"
          style={{
            background: `linear-gradient(90deg, ${settings.primaryColor}, ${withOpacity(settings.primaryColor, 0)})`,
            transform: `skewY(-${skew}deg)`,
            opacity: 0.85,
          }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-[1200px] h-[200px]"
          style={{
            background: `linear-gradient(270deg, ${settings.accentColor}, ${withOpacity(settings.accentColor, 0)})`,
            transform: `skewY(-${skew}deg)`,
            opacity: 0.45,
          }}
        />
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.06 }}>
          <defs>
            <pattern id="rally-intro-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#rally-intro-grid)" />
        </svg>
      </div>

      <div className="relative z-10 h-full flex flex-col justify-between px-[120px] py-[100px]">
        <motion.div
          initial={{ x: -120, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: dur }}
        >
          <div className="flex items-center gap-6 mb-6">
            <RallyLogo url={data.logoUrl} fallbackText={data.eventName} settings={settings} size={140} />
            {data.edition && (
              <div
                className="inline-block px-4 py-1 font-bold tracking-[0.4em]"
                style={{
                  background: settings.accentColor,
                  color: settings.secondaryColor,
                  fontSize: scaled(settings, 16),
                }}
              >
                {data.edition.toUpperCase()}
              </div>
            )}
          </div>
          <h1
            className="font-bold uppercase leading-[0.95] tracking-tight"
            style={{ color: settings.textColor, fontSize: scaled(settings, 140) }}
          >
            {data.eventName}
          </h1>
          <div className="flex items-center gap-6 mt-4">
            <div
              className="h-[6px] w-[120px]"
              style={{ background: settings.primaryColor }}
            />
            <span
              className="font-medium tracking-[0.3em] uppercase"
              style={{ color: withOpacity(settings.textColor, 0.85), fontSize: scaled(settings, 26) }}
            >
              {data.location} \u00B7 {data.dates}
            </span>
          </div>
          {data.headline && (
            <p
              className="mt-6 italic font-medium tracking-wide"
              style={{ color: withOpacity(settings.textColor, 0.7), fontSize: scaled(settings, 24) }}
            >
              &ldquo;{data.headline}&rdquo;
            </p>
          )}
        </motion.div>

        <motion.div
          className="grid grid-cols-3 gap-8"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35, duration: dur }}
        >
          {[
            { label: 'ESPECIALES', value: String(data.totalStages) },
            { label: 'DISTANCIA TOTAL', value: data.totalDistance },
            { label: 'SUPERFICIE', value: data.surface },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="px-8 py-6 border-l-[6px]"
              style={{
                background: withOpacity(settings.secondaryColor, 0.6),
                borderColor: i === 0 ? settings.primaryColor : i === 1 ? settings.accentColor : settings.textColor,
              }}
            >
              <div
                className="font-medium tracking-[0.3em] uppercase mb-2"
                style={{ color: withOpacity(settings.textColor, 0.5), fontSize: scaled(settings, 18) }}
              >
                {stat.label}
              </div>
              <div
                className="font-bold uppercase leading-none"
                style={{ color: settings.textColor, fontSize: scaled(settings, 80) }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: dur }}
        >
          <div
            className="font-bold tracking-[0.4em] uppercase mb-3"
            style={{ color: settings.accentColor, fontSize: scaled(settings, 18) }}
          >
            ITINERARIO \u00B7 ESPECIALES DE VELOCIDAD
          </div>
          <div className="flex flex-wrap gap-2">
            {data.stages.map((s) => (
              <div
                key={s.stageNumber}
                className="flex items-center gap-2 px-3 py-2"
                style={{
                  background: withOpacity(settings.primaryColor, 0.18),
                  borderLeft: `3px solid ${settings.primaryColor}`,
                }}
              >
                <span
                  className="font-bold"
                  style={{ color: settings.accentColor, fontSize: scaled(settings, 16) }}
                >
                  SS{s.stageNumber}
                </span>
                <span
                  className="font-medium"
                  style={{ color: settings.textColor, fontSize: scaled(settings, 16) }}
                >
                  {s.stageName}
                </span>
                <span
                  style={{ color: withOpacity(settings.textColor, 0.55), fontSize: scaled(settings, 14) }}
                >
                  {s.distance} {surfaceIcon(s.surface)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
    </div>
  );
};

export default RallyIntro;
