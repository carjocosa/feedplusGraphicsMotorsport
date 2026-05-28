import { motion } from 'framer-motion';
import type { WeatherData, GraphicsSettings } from '@/types/rally';
import { layoutStyle } from '@/lib/graphicsStyle';

interface Props {
  data: WeatherData;
  settings: GraphicsSettings;
  onMouseDown?: (e: React.MouseEvent) => void;
}

const weatherIcons: Record<string, string> = {
  sunny: '☀️',
  rainy: '🌧️',
  snowy: '🌨️',
  cloudy: '☁️',
  foggy: '🌫️',
};

const Weather = ({ data, settings, onMouseDown }: Props) => {
  return (
    <div style={layoutStyle(settings, 'weather')} onMouseDown={onMouseDown}>
      <motion.div
        className="font-rajdhani"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.3 }}
      >
      <div className="flex items-center gap-3 px-5 py-2" style={{ background: `${settings.secondaryColor}dd` }}>
        <span className="text-[32px]">{weatherIcons[data.condition]}</span>
        <div className="flex flex-col">
          <span className="text-white text-[28px] font-bold leading-none">{data.temperature}°C</span>
          <span className="text-white/60 text-[14px] font-medium">{data.windSpeed}</span>
        </div>
      </div>
    </motion.div>
    </div>
  );
};

export default Weather;
