import type { GraphicsSettings, TransformableGraphic, GraphicTransform, GraphicLayout, GraphicColorOverride } from '@/types/rally';

export const graphicTransform = (s: GraphicsSettings, g: TransformableGraphic): GraphicTransform => {
  return s.transforms?.[g] ?? { x: 0, y: 0, scale: 1 };
};

export const transformStyle = (s: GraphicsSettings, g: TransformableGraphic, origin: string = 'top left') => {
  const t = graphicTransform(s, g);
  return {
    position: 'absolute' as const,
    transform: `translate(${t.x}px, ${t.y}px) scale(${t.scale})`,
    transformOrigin: origin,
  } as const;
};

export const mergeColors = (s: GraphicsSettings, g: TransformableGraphic): GraphicsSettings => {
  const override = s.colorOverrides?.[g];
  if (!override) return s;
  return {
    ...s,
    primaryColor: override.primaryColor ?? s.primaryColor,
    secondaryColor: override.secondaryColor ?? s.secondaryColor,
    accentColor: override.accentColor ?? s.accentColor,
    textColor: override.textColor ?? s.textColor,
  };
};

export const layoutStyle = (s: GraphicsSettings, g: TransformableGraphic): React.CSSProperties => {
  const def = defaultLayoutForGraphic(g);
  const layout = s.layouts?.[g] ?? def;
  return {
    position: 'absolute' as const,
    left: layout.x,
    top: layout.y,
    width: layout.width,
    height: layout.height,
    opacity: layout.opacity,
    transform: `scale(${layout.scale})`,
    transformOrigin: 'top left',
    pointerEvents: layout.visible ? 'auto' : 'none' as const,
  };
};

export const getLayout = (s: GraphicsSettings, g: TransformableGraphic): GraphicLayout => {
  return s.layouts?.[g] ?? defaultLayoutForGraphic(g);
};

export const defaultLayoutForGraphic = (g: TransformableGraphic): GraphicLayout => {
  const defaults: Record<TransformableGraphic, GraphicLayout> = {
    crewLowerThird: { x: 60, y: 800, width: 700, height: 120, opacity: 1, scale: 1, visible: true },
    vsLowerThird: { x: 60, y: 800, width: 1200, height: 120, opacity: 1, scale: 1, visible: true },
    stageLowerThird: { x: 60, y: 800, width: 700, height: 120, opacity: 1, scale: 1, visible: true },
    interviewLowerThird: { x: 60, y: 800, width: 600, height: 100, opacity: 1, scale: 1, visible: true },
    scorebug: { x: 20, y: 20, width: 600, height: 44, opacity: 1, scale: 1, visible: true },
    stageResults: { x: 60, y: 60, width: 640, height: 500, opacity: 1, scale: 1, visible: true },
    overallStandings: { x: 60, y: 60, width: 640, height: 500, opacity: 1, scale: 1, visible: true },
    headToHead: { x: 360, y: 400, width: 1200, height: 200, opacity: 1, scale: 1, visible: true },
    startList: { x: 60, y: 60, width: 640, height: 500, opacity: 1, scale: 1, visible: true },
    entriesList: { x: 60, y: 60, width: 640, height: 500, opacity: 1, scale: 1, visible: true },
    stageMap: { x: 1260, y: 680, width: 400, height: 300, opacity: 1, scale: 1, visible: true },
    elevationProfile: { x: 60, y: 680, width: 600, height: 250, opacity: 1, scale: 1, visible: true },
    weather: { x: 20, y: 80, width: 300, height: 200, opacity: 1, scale: 1, visible: true },
    sponsorCrawl: { x: 0, y: 1020, width: 1920, height: 60, opacity: 1, scale: 1, visible: true },
    countdown: { x: 760, y: 440, width: 400, height: 200, opacity: 1, scale: 1, visible: true },
    rallyIntro: { x: 0, y: 0, width: 1920, height: 1080, opacity: 1, scale: 1, visible: true },
    stagePresentation: { x: 0, y: 0, width: 1920, height: 1080, opacity: 1, scale: 1, visible: true },
    stageWeather: { x: 0, y: 0, width: 1920, height: 1080, opacity: 1, scale: 1, visible: true },
    circuitScorebug: { x: 20, y: 20, width: 600, height: 44, opacity: 1, scale: 1, visible: true },
    startGrid: { x: 60, y: 60, width: 800, height: 600, opacity: 1, scale: 1, visible: true },
    circuitTiming: { x: 1230, y: 60, width: 640, height: 700, opacity: 1, scale: 1, visible: true },
    driverLap: { x: 60, y: 800, width: 700, height: 120, opacity: 1, scale: 1, visible: true },
    raceFlag: { x: 760, y: 20, width: 400, height: 52, opacity: 1, scale: 1, visible: true },
    pitTracker: { x: 60, y: 60, width: 500, height: 400, opacity: 1, scale: 1, visible: true },
    podium: { x: 0, y: 0, width: 1920, height: 1080, opacity: 1, scale: 1, visible: true },
    finalResults: { x: 60, y: 60, width: 800, height: 700, opacity: 1, scale: 1, visible: true },
    guestLowerThird: { x: 60, y: 800, width: 600, height: 100, opacity: 1, scale: 1, visible: true },
  };
  return defaults[g] ?? { x: 0, y: 0, width: 400, height: 300, opacity: 1, scale: 1, visible: true };
};

export const animationDuration = (s: GraphicsSettings) => {
  switch (s.animationSpeed) {
    case 'instant': return 0.12;
    case 'fast': return 0.3;
    case 'normal': return 0.45;
    case 'cinematic': return 0.7;
  }
};

export const cornerRadius = (s: GraphicsSettings) => {
  switch (s.cornerStyle) {
    case 'sharp': return 0;
    case 'subtle': return 4;
    case 'rounded': return 12;
  }
};

export const fontStack = (s: GraphicsSettings) =>
  `'${s.fontDisplay}', 'Rajdhani', sans-serif`;

export const scaled = (s: GraphicsSettings, px: number) =>
  Math.round(px * s.fontSizeScale);

export const withOpacity = (hex: string, opacity: number) => {
  const a = Math.round(Math.max(0, Math.min(1, opacity)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
};
