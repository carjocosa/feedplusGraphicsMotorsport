import { motion } from 'framer-motion';
import type { GraphicsSettings, GpxRouteData } from '@/types/rally';
import { useRallyStore } from '@/store/rallyStore';
import { layoutStyle } from '@/lib/graphicsStyle';
import { label } from '@/lib/i18n';

interface Props {
  settings: GraphicsSettings;
  onMouseDown?: (e: React.MouseEvent) => void;
  data?: Record<string, unknown>;
}

const W = 460;
const H = 160;
const PAD = 36;

const ElevationProfile = ({ settings, onMouseDown, data }: Props) => {
  const rallyIntro = useRallyStore(s => s.rallyIntro);
  const storeGpx = rallyIntro.stages.find(s => s.gpxData)?.gpxData;
  const gpxData = (data?.gpxData as GpxRouteData | undefined) ?? storeGpx;
  const hasData = gpxData && gpxData.points.filter(p => p.ele !== undefined).length > 1;

  return (
    <div style={layoutStyle(settings, 'elevationProfile')} onMouseDown={onMouseDown}>
      <motion.div
        className="font-rajdhani"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.4 }}
      >
      {hasData ? (
        <RealElevation gpxData={gpxData!} settings={settings} />
      ) : (
        <Placeholder settings={settings} />
      )}
      </motion.div>
    </div>
  );
};

function RealElevation({ gpxData, settings }: { gpxData: GpxRouteData; settings: GraphicsSettings }) {
  const _l = (k: string) => label(k, settings.language, settings.customLabels);
  const elePoints = gpxData.points.filter((p): p is typeof p & { ele: number } => p.ele !== undefined);
  const eles = elePoints.map(p => p.ele);
  const minEle = Math.min(...eles);
  const maxEle = Math.max(...eles);
  const eleRange = maxEle - minEle || 1;
  const cw = W - PAD * 2;
  const ch = H - PAD * 2;

  const pathD = elePoints.map((p, i) => {
    const x = PAD + (i / (elePoints.length - 1)) * cw;
    const y = PAD + ch - ((p.ele - minEle) / eleRange) * ch;
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');

  const areaD = pathD + ` L ${W - PAD} ${H} L ${PAD} ${H} Z`;

  const gridY = (frac: number) => PAD + ch * (1 - frac);
  const eleAt = (frac: number) => Math.round(minEle + eleRange * frac);

  const distKm = gpxData.totalDistance != null ? (gpxData.totalDistance / 1000) : null;

  return (
    <div className="w-[500px]" style={{ background: `${settings.secondaryColor}dd` }}>
      <div className="h-[36px] flex items-center justify-between px-4" style={{ background: settings.primaryColor }}>
        <span className="text-white text-[16px] font-bold tracking-widest">{_l('ELEVATION PROFILE')}</span>
        <span className="text-white/60 text-[11px] font-mono">{gpxData.name}</span>
      </div>
      <div className="p-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          {[0, 0.25, 0.5, 0.75, 1].map(frac => (
            <line key={frac} x1={PAD} y1={gridY(frac)} x2={W - PAD} y2={gridY(frac)} stroke="white" strokeOpacity="0.08" />
          ))}

          <path d={areaD} fill={`${settings.primaryColor}33`} />
          <path d={pathD} fill="none" stroke={settings.primaryColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {[0, 0.25, 0.5, 0.75, 1].map(frac => (
            <text key={frac} x="4" y={gridY(frac) + 3} fill="white" fontSize="9" fontFamily="Rajdhani" opacity="0.5">
              {eleAt(frac)}m
            </text>
          ))}

          {distKm != null && (
            <>
              <text x={PAD} y={H - 4} fill="white" fontSize="9" fontFamily="Rajdhani" opacity="0.5">0 km</text>
              <text x={W - PAD - 24} y={H - 4} fill="white" fontSize="9" fontFamily="Rajdhani" opacity="0.5">{distKm.toFixed(1)} km</text>
            </>
          )}

          <circle cx={PAD} cy={PAD + ch - ((elePoints[0].ele - minEle) / eleRange) * ch} r="4" fill={settings.accentColor} />
          <circle cx={W - PAD} cy={PAD + ch - ((elePoints[elePoints.length - 1].ele - minEle) / eleRange) * ch} r="4" fill={settings.primaryColor} />
        </svg>
      </div>

      <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 text-[10px] font-mono text-white/50">
        <span>{elePoints.length} {_l('sample points')}</span>
        <span>▲ {gpxData.elevationGain ?? 0}m ▼ {gpxData.elevationLoss ?? 0}m</span>
        <span>{Math.round(eleRange)}m {_l('range')}</span>
      </div>
    </div>
  );
}

function Placeholder({ settings }: { settings: GraphicsSettings }) {
  const _l = (k: string) => label(k, settings.language, settings.customLabels);
  return (
    <div className="w-[460px]" style={{ background: `${settings.secondaryColor}dd` }}>
      <div className="h-[36px] flex items-center px-4" style={{ background: settings.primaryColor }}>
        <span className="text-white text-[16px] font-bold tracking-widest">{_l('ELEVATION PROFILE')}</span>
      </div>
      <div className="p-4">
        <svg viewBox={`0 0 400 120`} className="w-full">
          {[0, 30, 60, 90].map(y => (
            <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="white" strokeOpacity="0.1" />
          ))}
          <path
            d="M 0 100 L 30 85 60 70 90 55 120 60 150 40 180 25 210 30 240 45 270 35 300 20 330 30 360 50 390 60 400 65 400 120 0 120 Z"
            fill={`${settings.primaryColor}44`}
            stroke={settings.primaryColor}
            strokeWidth="2"
          />
          <text x="5" y="115" fill="white" fontSize="10" fontFamily="Rajdhani" opacity="0.5">0 km</text>
          <text x="185" y="115" fill="white" fontSize="10" fontFamily="Rajdhani" opacity="0.5">12 km</text>
          <text x="370" y="115" fill="white" fontSize="10" fontFamily="Rajdhani" opacity="0.5">24 km</text>
          <text x="5" y="25" fill="white" fontSize="10" fontFamily="Rajdhani" opacity="0.4">1400m</text>
          <text x="5" y="65" fill="white" fontSize="10" fontFamily="Rajdhani" opacity="0.4">1100m</text>
        </svg>
      </div>
    </div>
  );
}

export default ElevationProfile;
