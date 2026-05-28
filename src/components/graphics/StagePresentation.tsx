import { motion } from 'framer-motion';
import type { StagePresentationData, GraphicsSettings } from '@/types/rally';
import { animationDuration, fontStack, scaled, withOpacity, layoutStyle } from '@/lib/graphicsStyle';
import RallyLogo from './RallyLogo';

interface Props {
  data: StagePresentationData;
  settings: GraphicsSettings;
  onMouseDown?: (e: React.MouseEvent) => void;
}

const surfaceMeta: Record<string, { icon: string; label: string }> = {
  gravel: { icon: '\u26F0\uFE0F', label: 'TIERRA' },
  asphalt: { icon: '\uD83D\uDEE3\uFE0F', label: 'ASFALTO' },
  snow: { icon: '\u2744\uFE0F', label: 'NIEVE' },
};

const StagePresentation = ({ data, settings, onMouseDown }: Props) => {
  const skew = settings.shearAngle;
  const dur = animationDuration(settings);
  const surface = surfaceMeta[data.surface] ?? surfaceMeta.gravel;

  if (data.variant === 'board') {
    return (
      <div style={layoutStyle(settings, 'stagePresentation')} onMouseDown={onMouseDown}>
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
              width: 860,
              background: settings.secondaryColor,
              borderTop: `6px solid ${settings.primaryColor}`,
              boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px ${settings.primaryColor}22`,
            }}
            initial={{ y: 60, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: dur }}
          >
            <div className="flex items-center gap-4 px-10 pt-8 pb-4">
              <RallyLogo url={data.logoUrl} fallbackText={data.eventName ?? 'RALLY'} settings={settings} size={50} />
              <div className="font-bold tracking-[0.3em] uppercase text-[18px]" style={{ color: withOpacity(settings.textColor, 0.7) }}>
                {data.eventName}
              </div>
              <div className="flex-1" />
              <div className="text-[14px] font-bold tracking-[0.4em] uppercase" style={{ color: settings.accentColor }}>
                ESPECIAL DE VELOCIDAD
              </div>
            </div>

            <div className="h-[1px] mx-10" style={{ background: `${settings.textColor}22` }} />

            <div className="flex px-10 py-8 gap-10">
              <div className="flex flex-col items-center justify-center min-w-[200px]">
                <div className="text-[160px] font-bold leading-none" style={{ color: settings.textColor }}>
                  SS{data.stageNumber}
                </div>
                <div className="text-[22px] font-bold tracking-[0.3em] uppercase" style={{ color: withOpacity(settings.textColor, 0.5) }}>
                  DE {data.totalStages}
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                <h1 className="text-[56px] font-bold uppercase leading-tight" style={{ color: settings.textColor }}>
                  {data.stageName}
                </h1>
                {data.location && (
                  <div className="text-[20px] font-medium tracking-wide uppercase mt-2" style={{ color: withOpacity(settings.textColor, 0.6) }}>
                    {data.location}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-0 mx-10 pb-8 border-t pt-6" style={{ borderColor: `${settings.textColor}22` }}>
              {[
                { label: 'DISTANCIA', value: data.distance },
                { label: 'SUPERFICIE', value: `${surface.label}` },
                { label: 'HORA SALIDA', value: data.startTime ?? '\u2014' },
                { label: 'R\u00C9CORD', value: data.recordTime ?? '\u2014', sub: data.recordHolder },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-[11px] font-bold tracking-[0.3em] uppercase" style={{ color: withOpacity(settings.textColor, 0.4) }}>
                    {s.label}
                  </div>
                  <div className="text-[22px] font-bold uppercase mt-1" style={{ color: settings.textColor }}>
                    {s.value}
                  </div>
                  {s.sub && (
                    <div className="text-[12px] mt-1" style={{ color: withOpacity(settings.textColor, 0.5) }}>
                      {s.sub}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {data.notes && (
              <div className="mx-10 pb-8">
                <div className="px-5 py-3 italic" style={{ background: withOpacity(settings.primaryColor, 0.15), borderLeft: `4px solid ${settings.primaryColor}` }}>
                  <span className="text-[16px]" style={{ color: settings.textColor }}>{data.notes}</span>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={layoutStyle(settings, 'stagePresentation')} onMouseDown={onMouseDown}>
      <motion.div
        className="absolute inset-0 z-40"
        style={{ fontFamily: fontStack(settings), background: settings.secondaryColor }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: dur }}
      >
      <motion.div
        className="absolute top-0 left-0 h-full"
        style={{
          width: '46%',
          background: `linear-gradient(135deg, ${settings.primaryColor}, ${withOpacity(settings.primaryColor, 0.6)})`,
          clipPath: `polygon(0 0, 100% 0, ${100 - skew}% 100%, 0 100%)`,
        }}
        initial={{ x: -800 }}
        animate={{ x: 0 }}
        transition={{ duration: dur, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.div
        className="absolute bottom-[80px] right-0 h-[8px]"
        style={{ background: settings.accentColor, width: '60%', transformOrigin: 'right' }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.4, duration: dur }}
      />

      <motion.div
        className="absolute top-[60px] left-[100px] z-20 flex items-center gap-4"
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: dur }}
      >
        <RallyLogo url={data.logoUrl} fallbackText={data.eventName ?? 'RALLY'} settings={settings} size={70} />
        {data.eventName && (
          <div
            className="font-bold tracking-[0.4em] uppercase"
            style={{ color: settings.textColor, fontSize: scaled(settings, 18) }}
          >
            {data.eventName}
          </div>
        )}
      </motion.div>

      <motion.div
        className="absolute top-[160px] left-[100px] z-10"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: dur }}
      >
        <div
          className="font-bold tracking-[0.5em] uppercase"
          style={{ color: settings.accentColor, fontSize: scaled(settings, 26) }}
        >
          ESPECIAL DE VELOCIDAD
        </div>
        <div className="flex items-end gap-4 mt-2">
          <div
            className="font-bold leading-none"
            style={{ color: settings.textColor, fontSize: scaled(settings, 280) }}
          >
            SS{data.stageNumber}
          </div>
          <div
            className="font-bold uppercase tracking-wider mb-8"
            style={{ color: withOpacity(settings.textColor, 0.7), fontSize: scaled(settings, 36) }}
          >
            DE {data.totalStages}
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute top-[160px] right-[100px] z-10 max-w-[820px]"
        initial={{ x: 80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.35, duration: dur }}
      >
        <h1
          className="font-bold uppercase leading-[0.95] tracking-tight text-right"
          style={{ color: settings.textColor, fontSize: scaled(settings, 110) }}
        >
          {data.stageName}
        </h1>
        {data.location && (
          <div
            className="text-right mt-3 font-medium tracking-[0.25em] uppercase"
            style={{ color: withOpacity(settings.textColor, 0.7), fontSize: scaled(settings, 24) }}
          >
            {data.location}
          </div>
        )}
      </motion.div>

      <motion.div
        className="absolute bottom-[140px] left-[100px] right-[100px] z-10"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: dur }}
      >
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'DISTANCIA', value: data.distance },
            { label: 'SUPERFICIE', value: `${surface.label}` },
            { label: 'HORA SALIDA', value: data.startTime ?? '\u2014' },
            { label: 'R\u00C9CORD', value: data.recordTime ?? '\u2014', sub: data.recordHolder },
          ].map((s) => (
            <div
              key={s.label}
              className="px-5 py-4"
              style={{
                background: withOpacity('#000000', 0.55),
                borderTop: `3px solid ${settings.accentColor}`,
              }}
            >
              <div
                className="font-medium tracking-[0.3em] uppercase"
                style={{ color: withOpacity(settings.textColor, 0.55), fontSize: scaled(settings, 14) }}
              >
                {s.label}
              </div>
              <div
                className="font-bold uppercase mt-1 leading-tight"
                style={{ color: settings.textColor, fontSize: scaled(settings, 34) }}
              >
                {s.value}
              </div>
              {s.sub && (
                <div
                  className="font-medium mt-1"
                  style={{ color: withOpacity(settings.textColor, 0.55), fontSize: scaled(settings, 14) }}
                >
                  {s.sub}
                </div>
              )}
            </div>
          ))}
        </div>

        {data.notes && (
          <div
            className="mt-4 px-5 py-3 italic"
            style={{
              background: withOpacity(settings.primaryColor, 0.2),
              borderLeft: `4px solid ${settings.primaryColor}`,
              color: settings.textColor,
              fontSize: scaled(settings, 20),
            }}
          >
            {data.notes}
          </div>
        )}
      </motion.div>

      {data.showMiniMap && (
        <motion.div
          className="absolute top-[160px] right-[100px] z-20"
          style={{
            width: 420,
            background: withOpacity('#000000', 0.65),
            border: `2px solid ${settings.accentColor}`,
            padding: 16,
          }}
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.55, duration: dur }}
        >
          <div
            className="font-bold tracking-[0.3em] uppercase mb-2"
            style={{ color: settings.accentColor, fontSize: scaled(settings, 14) }}
          >
            RECORRIDO \u00B7 SS{data.stageNumber}
          </div>
          <svg viewBox="0 0 400 160" width="100%" height="160">
            <defs>
              <linearGradient id="route" x1="0" x2="1">
                <stop offset="0%" stopColor={settings.primaryColor} />
                <stop offset="100%" stopColor={settings.accentColor} />
              </linearGradient>
            </defs>
            <path
              d="M10,120 C 60,40 110,140 160,80 S 260,30 310,90 S 380,60 390,40"
              fill="none"
              stroke="url(#route)"
              strokeWidth={4}
              strokeLinecap="round"
            />
            <circle cx={10} cy={120} r={6} fill={settings.accentColor} />
            <text x={18} y={138} fill={settings.textColor} fontSize={11} fontWeight={700}>
              START
            </text>
            <circle cx={390} cy={40} r={6} fill={settings.primaryColor} />
            <text x={350} y={28} fill={settings.textColor} fontSize={11} fontWeight={700}>
              FINISH
            </text>
            {(data.mapPoints ?? []).slice(0, 4).map((p, i) => {
              const x = 30 + i * 90;
              const y = i % 2 === 0 ? 70 : 110;
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r={4} fill={settings.textColor} />
                  <text
                    x={x + 6}
                    y={y - 6}
                    fill={settings.textColor}
                    fontSize={10}
                    fontWeight={600}
                  >
                    KM{p.km} \u00B7 {p.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </motion.div>
      )}
    </motion.div>
    </div>
  );
};

export default StagePresentation;
