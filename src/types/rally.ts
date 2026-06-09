export interface CrewData {
  driverName: string;
  coDriverName: string;
  driverCountry: string;
  coDriverCountry: string;
  team: string;
  car: string;
  carNumber: string;
}

export interface VsEntry {
  name: string;
  country: string;
  team: string;
  car: string;
  carNumber: string;
}

export interface VsData {
  left: VsEntry;
  right: VsEntry;
}

export interface StageData {
  stageNumber: number;
  stageName: string;
  distance: string;
  surface: 'gravel' | 'asphalt' | 'snow';
}

export interface InterviewData {
  name: string;
  role: string;
}

export interface TimingEntry {
  position: number;
  carNumber: string;
  driverName: string;
  coDriverName: string;
  time: string;
  diff: string;
}

export interface HeadToHeadData {
  driver1: { name: string; country: string; time: string; carNumber: string };
  driver2: { name: string; country: string; time: string; carNumber: string };
  diff: string;
  leader: 1 | 2;
}

export interface StartListEntry {
  startOrder: number;
  carNumber: string;
  driverName: string;
  coDriverName: string;
  startTime: string;
}

export interface WeatherData {
  condition: 'sunny' | 'rainy' | 'snowy' | 'cloudy' | 'foggy';
  temperature: number;
  windSpeed: string;
}

export interface ForecastSlot {
  time: string;       // "08:00"
  condition: WeatherData['condition'];
  temperature: number;
}

export interface StageWeatherData {
  stageNumber: number;
  stageName: string;
  condition: WeatherData['condition'];
  temperature: number;
  windSpeed: string;
  humidity?: string;
  precipitation?: string;
  visibility?: string;
  trackCondition?: string;
  shortForecast?: string;
  forecast?: ForecastSlot[];
  logoUrl?: string;
  eventName?: string;
}

export interface StageMapPoint {
  km: number;
  label: string;
  type?: 'split' | 'jump' | 'hairpin' | 'water' | 'finish';
}

export interface EventData {
  eventName: string;
  stageNumber: number;
  stageName: string;
  logoUrl?: string;
}



export interface RallyIntroData {
  eventName: string;
  edition?: string;
  location: string;
  dates: string;
  totalStages: number;
  totalDistance: string;
  surface: string;
  headline?: string;
  logoUrl?: string;        // dataURL or external URL of the rally placa/logo
  stages: StageInfo[];
  variant?: 'fullscreen' | 'board';
}

export interface StagePresentationData extends StageInfo {
  totalStages: number;
  showMiniMap?: boolean;
  logoUrl?: string;
  eventName?: string;
  variant?: 'fullscreen' | 'board';
}

export interface CountdownData {
  targetTime: number; // timestamp ms, computed from startTime
  label: string;
  startTime?: string; // "HH:MM" format — source time for the countdown
}

export type TransformableGraphic =
  | 'crewLowerThird'
  | 'stageLowerThird'
  | 'interviewLowerThird'
  | 'vsLowerThird'
  | 'scorebug'
  | 'stageResults'
  | 'overallStandings'
  | 'headToHead'
  | 'startList'
  | 'entriesList'
  | 'stageMap'
  | 'elevationProfile'
  | 'weather'
  | 'sponsorCrawl'
  | 'countdown'
  | 'rallyIntro'
  | 'stagePresentation'
  | 'stageWeather'
  | 'circuitScorebug'
  | 'startGrid'
  | 'circuitTiming'
  | 'driverLap'
  | 'raceFlag'
  | 'pitTracker'
  | 'podium'
  | 'finalResults'
  | 'guestLowerThird';

export interface GraphicTransform {
  x: number;
  y: number;
  scale: number;
}

export interface GraphicLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  scale: number;
  visible: boolean;
}

export interface GraphicColorOverride {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  textColor?: string;
}

export type GraphicLayoutMap = Partial<Record<TransformableGraphic, GraphicLayout>>;
export type GraphicColorMap = Partial<Record<TransformableGraphic, GraphicColorOverride>>;

export interface GraphicsSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  shearAngle: number;
  fontDisplay: 'Rajdhani' | 'Oswald' | 'Bebas Neue' | 'Barlow Condensed' | 'Russo One';
  fontSizeScale: number;
  panelOpacity: number;
  cornerStyle: 'sharp' | 'subtle' | 'rounded';
  animationSpeed: 'instant' | 'fast' | 'normal' | 'cinematic';
  borderAccent: boolean;
  transforms: Record<TransformableGraphic, GraphicTransform>;
  layouts?: GraphicLayoutMap;
  colorOverrides?: GraphicColorMap;
  lowerThirdLayout: 'vertical' | 'horizontal';
  towerWidth: number;
  displayPageSize: number;
  displayPageOffset: number;
  language: 'es' | 'en';
  customLabels: Record<string, string>;
  routeAnimDuration: number;
}

export interface GpxTrackPoint {
  lat: number;
  lon: number;
  ele?: number;
  time?: string;
}

export interface GpxRouteData {
  name: string;
  points: GpxTrackPoint[];
  totalDistance?: number;
  elevationGain?: number;
  elevationLoss?: number;
}

export interface StageInfo {
  stageNumber: number;
  stageName: string;
  distance: string;
  surface: 'gravel' | 'asphalt' | 'snow';
  startTime?: string;
  location?: string;
  notes?: string;
  recordTime?: string;
  recordHolder?: string;
  mapPoints?: StageMapPoint[];
  gpxData?: GpxRouteData;
}

export interface Sponsor {
  name: string;
  logoUrl?: string;
}

export interface Entry {
  id: string;
  carNumber: string;
  driverName: string;
  coDriverName: string;
  driverCountry: string;
  coDriverCountry: string;
  team: string;
  car: string;
  category?: string;
}

export interface CrewSelection {
  entryId: string | null;
  data: CrewData;
}

export interface CrewSlot {
  entryId: string | null;
  data: CrewData;
}

export type GraphicType =
  | 'crewLowerThird'
  | 'stageLowerThird'
  | 'interviewLowerThird'
  | 'vsLowerThird'
  | 'stageResults'
  | 'overallStandings'
  | 'headToHead'
  | 'startList'
  | 'entriesList'
  | 'stageMap'
  | 'elevationProfile'
  | 'weather'
  | 'scorebug'
  | 'stinger'
  | 'sponsorCrawl'
  | 'countdown'
  | 'rallyIntro'
  | 'stagePresentation'
  | 'stageWeather';

export interface BroadcastMessage {
  type: 'TAKE' | 'CLEAR' | 'UPDATE_SETTINGS' | 'SET_MODE' | 'UPDATE_LAYOUT' | 'PAGE_CHANGE';
  graphic?: GraphicType | string;
  data?: Record<string, unknown>;
  settings?: GraphicsSettings;
  mode?: 'rally' | 'circuit';
  layout?: { graphic: TransformableGraphic; patch: Partial<GraphicLayout> };
  pageOffset?: number;
}
