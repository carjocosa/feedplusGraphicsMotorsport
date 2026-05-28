import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { GraphicsSettings, GpxRouteData } from '@/types/rally';
import { useRallyStore } from '@/store/rallyStore';
import { gpxToSvgPath, computeGpxBounds } from '@/lib/gpxParser';
import { layoutStyle } from '@/lib/graphicsStyle';
import { label } from '@/lib/i18n';

interface Props {
  settings: GraphicsSettings;
  onMouseDown?: (e: React.MouseEvent) => void;
  data?: Record<string, unknown>;
}

const MAP_W = 440;
const MAP_H = 280;

const StageMap = ({ settings, onMouseDown, data }: Props) => {
  const rallyIntro = useRallyStore(s => s.rallyIntro);
  const storeGpx = rallyIntro.stages.find(s => s.gpxData)?.gpxData;
  const gpxData = (data?.gpxData as GpxRouteData | undefined) ?? storeGpx;

  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const animRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const DURATION = (settings.routeAnimDuration ?? 8) * 1000;

  const animate = useCallback((ts: number) => {
    if (!startRef.current) startRef.current = ts;
    const p = Math.min((ts - startRef.current) / DURATION, 1);
    setProgress(p);
    if (p < 1) {
      animRef.current = requestAnimationFrame(animate);
    } else {
      setIsPlaying(false);
      startRef.current = 0;
    }
  }, []);

  const startAnim = () => {
    setProgress(0);
    setIsPlaying(true);
    startRef.current = 0;
    animRef.current = requestAnimationFrame(animate);
  };

  const stopAnim = () => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setIsPlaying(false);
    setProgress(0);
    startRef.current = 0;
  };

  useEffect(() => {
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  return (
    <div style={layoutStyle(settings, 'stageMap')} onMouseDown={onMouseDown}>
      <motion.div
        className="font-rajdhani"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.4 }}
      >
      {gpxData && gpxData.points.length > 1 ? (
        <GpxView
          gpxData={gpxData}
          settings={settings}
          progress={progress}
          isPlaying={isPlaying}
          onPlay={startAnim}
          onStop={stopAnim}
        />
      ) : (
        <SvgFallback settings={settings} />
      )}
      </motion.div>
    </div>
  );
};

function GpxView({ gpxData, settings, progress, isPlaying, onPlay, onStop }: {
  gpxData: GpxRouteData;
  settings: GraphicsSettings;
  progress: number;
  isPlaying: boolean;
  onPlay: () => void;
  onStop: () => void;
}) {
  const _l = (k: string) => label(k, settings.language, settings.customLabels);
  const padding = 24;
  const fullPath = gpxToSvgPath(gpxData.points, MAP_W, MAP_H, padding);
  const bounds = computeGpxBounds(gpxData.points);

  const ptCount = Math.floor(progress * gpxData.points.length);
  const visible = gpxData.points.slice(0, ptCount);
  const partialPath = visible.length > 1
    ? gpxToSvgPath(visible, MAP_W, MAP_H, padding, bounds)
    : '';

  const curPt = gpxData.points[ptCount - 1];
  const curPos = curPt ? posFromBounds(curPt, bounds, MAP_W, MAP_H, padding) : null;

  const elePoints = gpxData.points.filter(p => p.ele !== undefined);
  const hasEle = elePoints.length > 1;

  return (
    <div className="w-[480px]" style={{ background: `${settings.secondaryColor}dd` }}>
      <div className="h-[36px] flex items-center justify-between px-4" style={{ background: settings.primaryColor }}>
        <span className="text-white text-[16px] font-bold tracking-widest">{gpxData.name}</span>
        <div className="flex items-center gap-3">
          {gpxData.totalDistance != null && (
            <span className="text-white/70 text-[11px] font-mono">{(gpxData.totalDistance / 1000).toFixed(1)} km</span>
          )}
          <button
            onClick={isPlaying ? onStop : onPlay}
            className="px-2 py-0.5 text-[10px] bg-white/20 hover:bg-white/30 text-white rounded transition-colors"
          >
            {isPlaying ? '■' : '▶'}
          </button>
        </div>
      </div>

      <div className="p-3">
        <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="w-full">
          <defs>
            <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={settings.accentColor} stopOpacity="0.4" />
              <stop offset="100%" stopColor={settings.primaryColor} stopOpacity="1" />
            </linearGradient>
          </defs>

          <path d={fullPath} fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.2" />

          {partialPath && (
            <path d={partialPath} fill="none" stroke="url(#rg)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          )}

          {gpxData.points.length > 0 && (() => {
            const f = gpxData.points[0];
            const p = posFromBounds(f, bounds, MAP_W, MAP_H, padding);
            return (
              <g>
                <circle cx={p.x} cy={p.y} r="6" fill={settings.accentColor} />
                <text x={p.x + 10} y={p.y + 4} fill="white" fontSize="11" fontFamily="Rajdhani" opacity="0.8">{_l('START')}</text>
              </g>
            );
          })()}

          {gpxData.points.length > 1 && (() => {
            const l = gpxData.points[gpxData.points.length - 1];
            const p = posFromBounds(l, bounds, MAP_W, MAP_H, padding);
            return (
              <g>
                <circle cx={p.x} cy={p.y} r="6" fill={settings.primaryColor} />
                <text x={p.x - 35} y={p.y + 4} fill="white" fontSize="11" fontFamily="Rajdhani" opacity="0.8">{_l('FINISH')}</text>
              </g>
            );
          })()}

          {curPos && (
            <g>
              <circle cx={curPos.x} cy={curPos.y} r="8" fill={settings.accentColor} opacity="0.3">
                <animate attributeName="r" values="6;10;6" dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0.1;0.4" dur="1.5s" repeatCount="indefinite" />
              </circle>
              <circle cx={curPos.x} cy={curPos.y} r="4" fill={settings.accentColor} />
            </g>
          )}
        </svg>

        {hasEle && (
          <div className="mt-2">
            <svg viewBox={`0 0 ${MAP_W - 24} 50`} className="w-full">
              {(() => {
                const eles = elePoints.map(p => p.ele!);
                const minEle = Math.min(...eles);
                const maxEle = Math.max(...eles);
                const eleRange = maxEle - minEle || 1;
                const cw = MAP_W - 24;
                const ch = 50;
                const step = cw / (elePoints.length - 1);

                const path = elePoints.map((p, i) => {
                  const x = i * step;
                  const y = ch - ((p.ele! - minEle) / eleRange) * (ch - 4) - 2;
                  return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
                }).join(' ');

                const area = path + ` L ${cw} ${ch} L 0 ${ch} Z`;

                return (
                  <g>
                    <path d={area} fill={settings.primaryColor} opacity="0.2" />
                    <path d={path} fill="none" stroke={settings.accentColor} strokeWidth="1.5" />
                    <text x="2" y="10" fill="white" fontSize="8" fontFamily="Rajdhani" opacity="0.6">{Math.round(maxEle)}m</text>
                    <text x="2" y={ch - 2} fill="white" fontSize="8" fontFamily="Rajdhani" opacity="0.6">{Math.round(minEle)}m</text>
                  </g>
                );
              })()}
            </svg>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-4 py-2 border-t border-white/10">
        <span className="text-[10px] text-white/50 font-mono">{gpxData.points.length} pts</span>
        {gpxData.elevationGain != null && (
          <span className="text-[10px] text-white/50 font-mono">
            ▲ {gpxData.elevationGain}m ▼ {gpxData.elevationLoss}m
          </span>
        )}
        {progress > 0 && (
          <span className="text-[10px] text-accent font-mono">{Math.round(progress * 100)}%</span>
        )}
      </div>
    </div>
  );
}

function SvgFallback({ settings }: { settings: GraphicsSettings }) {
  const _l = (k: string) => label(k, settings.language, settings.customLabels);
  return (
    <div className="w-[440px]" style={{ background: `${settings.secondaryColor}dd` }}>
      <div className="h-[36px] flex items-center px-4" style={{ background: settings.primaryColor }}>
        <span className="text-white text-[16px] font-bold tracking-widest">{_l('STAGE MAP')}</span>
      </div>
      <div className="p-4">
        <svg viewBox="0 0 380 200" className="w-full">
          <path d="M 20 180 C 60 160, 80 100, 120 80 S 200 30, 240 60 S 300 120, 340 40 L 370 20" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" />
          <circle cx="20" cy="180" r="6" fill={settings.accentColor} />
          <text x="30" y="196" fill="white" fontSize="11" fontFamily="Rajdhani" opacity="0.7">{_l('START')}</text>
          <circle cx="120" cy="80" r="5" fill={settings.primaryColor} />
          <text x="130" y="76" fill="white" fontSize="10" fontFamily="Rajdhani" opacity="0.6">Jump</text>
          <circle cx="240" cy="60" r="5" fill={settings.primaryColor} />
          <text x="250" y="56" fill="white" fontSize="10" fontFamily="Rajdhani" opacity="0.6">Hairpin</text>
          <circle cx="370" cy="20" r="6" fill={settings.accentColor} />
          <text x="340" y="14" fill="white" fontSize="11" fontFamily="Rajdhani" opacity="0.7">{_l('FINISH')}</text>
          <circle r="4" fill={settings.accentColor}>
            <animateMotion dur="6s" repeatCount="indefinite" path="M 20 180 C 60 160, 80 100, 120 80 S 200 30, 240 60 S 300 120, 340 40 L 370 20" />
          </circle>
        </svg>
      </div>
    </div>
  );
}

function posFromBounds(
  pt: { lat: number; lon: number },
  bounds: ReturnType<typeof computeGpxBounds>,
  width: number, height: number, padding: number
) {
  const latRange = bounds.maxLat - bounds.minLat || 0.001;
  const lonRange = bounds.maxLon - bounds.minLon || 0.001;
  const uw = width - padding * 2;
  const uh = height - padding * 2;
  return {
    x: padding + ((pt.lon - bounds.minLon) / lonRange) * uw,
    y: padding + (1 - (pt.lat - bounds.minLat) / latRange) * uh,
  };
}

export default StageMap;
