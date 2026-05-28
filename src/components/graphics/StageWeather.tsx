import { motion } from 'framer-motion';
import type { StageWeatherData, GraphicsSettings } from '@/types/rally';
import { animationDuration, fontStack, scaled, withOpacity, layoutStyle } from '@/lib/graphicsStyle';
import RallyLogo from './RallyLogo';

interface Props {
  data: StageWeatherData;
  settings: GraphicsSettings;
  onMouseDown?: (e: React.MouseEvent) => void;
}

const icons: Record<string, string> = {
  sunny: '☀️',
  cloudy: '☁️',
  rainy: '🌧️',
  snowy: '🌨️',
  foggy: '🌫️',
};

const labels: Record<string, string> = {
  sunny: 'SOLEADO',
  cloudy: 'NUBLADO',
  rainy: 'LLUVIA',
  snowy: 'NIEVE',
  foggy: 'NIEBLA',
};

const StageWeather = ({ data, settings, onMouseDown }: Props) => {
  const dur = animationDuration(settings);
  const skew = settings.shearAngle;

  return (
    <div style={layoutStyle(settings, 'stageWeather')} onMouseDown={onMouseDown}>
      <motion.div
        className="absolute inset-0 z-40"
        style={{ fontFamily: fontStack(settings), background: settings.secondaryColor }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: dur }}
      >
      {/* Diagonal accent */}
      <motion.div
        className="absolute top-0 left-0 h-full"
        style={{
          width: '38%',
          background: `linear-gradient(135deg, ${settings.primaryColor}, ${withOpacity(settings.primaryColor, 0.55)})`,
          clipPath: `polygon(0 0, 100% 0, ${100 - skew}% 100%, 0 100%)`,
        }}
        initial={{ x: -600 }}
        animate={{ x: 0 }}
        transition={{ duration: dur, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Top-right rally placa */}
      <motion.div
        className="absolute top-[60px] right-[100px] z-20 flex items-center gap-3"
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: dur }}
      >
        {data.eventName && (
          <div
            className="font-bold tracking-[0.4em] uppercase text-right"
            style={{ color: withOpacity(settings.textColor, 0.85), fontSize: scaled(settings, 16) }}
          >
            {data.eventName}
          </div>
        )}
        <RallyLogo url={data.logoUrl} fallbackText={data.eventName ?? 'RALLY'} settings={settings} size={64} />
      </motion.div>

      {/* Header */}
      <motion.div
        className="absolute top-[110px] left-[100px] z-10"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: dur }}
      >
        <div
          className="font-bold tracking-[0.5em] uppercase"
          style={{ color: settings.accentColor, fontSize: scaled(settings, 24) }}
        >
          PARTE METEOROLÓGICO
        </div>
        <div
          className="font-bold mt-2 leading-none"
          style={{ color: settings.textColor, fontSize: scaled(settings, 88) }}
        >
          SS{data.stageNumber} · {data.stageName}
        </div>
      </motion.div>

      {/* Big icon + temperature */}
      <motion.div
        className="absolute top-[280px] left-[100px] z-10 flex items-center gap-10"
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: dur }}
      >
        <div style={{ fontSize: scaled(settings, 240), lineHeight: 1 }}>{icons[data.condition]}</div>
        <div>
          <div
            className="font-bold leading-none"
            style={{ color: settings.textColor, fontSize: scaled(settings, 200) }}
          >
            {data.temperature}°
          </div>
          <div
            className="font-bold tracking-[0.3em] uppercase mt-3"
            style={{ color: settings.accentColor, fontSize: scaled(settings, 32) }}
          >
            {labels[data.condition]}
          </div>
        </div>
      </motion.div>

      {/* Right side metrics */}
      <motion.div
        className="absolute top-[280px] right-[100px] z-10 w-[600px] space-y-3"
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.35, duration: dur }}
      >
        {[
          { label: 'VIENTO', value: data.windSpeed },
          { label: 'HUMEDAD', value: data.humidity ?? '—' },
          { label: 'PRECIPITACIÓN', value: data.precipitation ?? '—' },
          { label: 'VISIBILIDAD', value: data.visibility ?? '—' },
          { label: 'PISTA', value: data.trackCondition ?? '—' },
        ].map((m) => (
          <div
            key={m.label}
            className="flex items-baseline justify-between px-5 py-3"
            style={{
              background: withOpacity('#000000', 0.5),
              borderLeft: `4px solid ${settings.accentColor}`,
            }}
          >
            <span
              className="font-medium tracking-[0.3em] uppercase"
              style={{ color: withOpacity(settings.textColor, 0.6), fontSize: scaled(settings, 18) }}
            >
              {m.label}
            </span>
            <span
              className="font-bold"
              style={{ color: settings.textColor, fontSize: scaled(settings, 32) }}
            >
              {m.value}
            </span>
          </div>
        ))}
      </motion.div>

      {/* Forecast bar */}
      {data.forecast && data.forecast.length > 0 && (
        <motion.div
          className="absolute bottom-[180px] left-[100px] right-[100px] z-10"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: dur }}
        >
          <div
            className="font-bold tracking-[0.4em] uppercase mb-3"
            style={{ color: withOpacity(settings.textColor, 0.6), fontSize: scaled(settings, 18) }}
          >
            PRÓXIMAS HORAS
          </div>
          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${data.forecast.length}, 1fr)` }}>
            {data.forecast.map((f, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center py-4"
                style={{
                  background: withOpacity('#000000', 0.45),
                  borderTop: `3px solid ${settings.primaryColor}`,
                }}
              >
                <div
                  className="font-bold tracking-wider"
                  style={{ color: withOpacity(settings.textColor, 0.7), fontSize: scaled(settings, 22) }}
                >
                  {f.time}
                </div>
                <div style={{ fontSize: scaled(settings, 56), lineHeight: 1 }}>{icons[f.condition]}</div>
                <div
                  className="font-bold"
                  style={{ color: settings.textColor, fontSize: scaled(settings, 30) }}
                >
                  {f.temperature}°
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Short forecast caption */}
      {data.shortForecast && (
        <motion.div
          className="absolute bottom-[80px] left-[100px] right-[100px] z-10 px-5 py-3"
          style={{
            background: withOpacity(settings.primaryColor, 0.25),
            borderLeft: `4px solid ${settings.primaryColor}`,
            color: settings.textColor,
            fontSize: scaled(settings, 22),
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: dur }}
        >
          📡 {data.shortForecast}
        </motion.div>
      )}
    </motion.div>
    </div>
  );
};

export default StageWeather;
