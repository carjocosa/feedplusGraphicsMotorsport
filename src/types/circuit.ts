// Circuit / Karting types — paralelos al rally, sin tocar tipos existentes.

export type DiscipMode = 'rally' | 'circuit';

export interface Category {
  id: string;
  name: string;
  color: string;
}

export type FlagKind =
  | 'green'
  | 'yellow'
  | 'red'
  | 'blue'
  | 'white'
  | 'checkered'
  | 'safetycar'
  | 'vsc';

export interface CircuitEntry {
  id: string;
  carNumber: string;
  driverName: string;
  shortName?: string;
  country: string;
  team: string;
  car: string;
  category?: string;
  qualifyingTime?: string;
  photoUrl?: string;
}

export interface GridSlot {
  position: number;
  carNumber: string;
  driverName: string;
  team: string;
  qualifyingTime?: string;
  gap?: string;
  photoUrl?: string;
  category?: string;
}

export interface CircuitTimingEntry {
  position: number;
  carNumber: string;
  driverName: string;
  team: string;
  lap: number;
  gap: string;
  interval: string;
  lastLap: string;
  bestLap: string;
  totalTime?: string;
  pitStops?: number;
  status?: 'racing' | 'pit' | 'out';
  isPurple?: boolean;
  isPersonalBest?: boolean;
  photoUrl?: string;
}

export interface DriverLapData {
  carNumber: string;
  driverName: string;
  team: string;
  country: string;
  position: number;
  lap: number;
  totalLaps: number;
  sector: 1 | 2 | 3;
  sectorTime?: string;
  lastLap: string;
  bestLap: string;
  gapToLeader: string;
  showTelemetry?: boolean;
}

export interface GuestLowerThirdData {
  name: string;
  role: string;
  subtitle: string;
}

export interface RaceFlagData {
  flag: FlagKind;
  message?: string;
}

export interface PitEvent {
  id: string;
  carNumber: string;
  driverName: string;
  team: string;
  pitTime: string;           // "23.4s"
  positionBefore: number;
  positionAfter: number;
  status: 'in' | 'out';
  lap?: number;
}

export interface PitTrackerData {
  events: PitEvent[];
  title?: string;
}

export interface PodiumEntry {
  position: 1 | 2 | 3;
  carNumber: string;
  driverName: string;
  team: string;
  country: string;
  totalTime: string;
  bestLap?: string;
  photoUrl?: string;
}

export interface PodiumData {
  series: string;
  raceName: string;
  podium: PodiumEntry[];
}

export interface FinalResultEntry {
  position: number;
  carNumber: string;
  driverName: string;
  team: string;
  laps: number;
  totalTime: string;
  bestLap: string;
  status?: 'finished' | 'dnf' | 'dsq';
  photoUrl?: string;
}

export interface FinalResultsData {
  series: string;
  raceName: string;
  totalLaps: number;
  results: FinalResultEntry[];
}

export type SessionKind = 'practice' | 'qualifying' | 'race' | 'sprint' | 'feature';

export interface CircuitIntroData {
  eventName: string;
  series: string;
  round: string;
  circuit: string;
  place?: string;
  date?: string;
  session?: string;
  imageUrl?: string;
  videoUrl?: string;
  logoUrl?: string;
}

export interface CircuitEventData {
  series: string;            // "Karting Nacional"
  round: string;             // "Fecha 4"
  circuit: string;           // "Zárate Karting"
  sessionType: SessionKind;
  totalLaps: number;
  currentLap: number;
  showLap?: boolean;
}

export type CircuitGraphicType =
  | 'startGrid'
  | 'circuitTiming'
  | 'driverLap'
  | 'raceFlag'
  | 'pitTracker'
  | 'podium'
  | 'finalResults'
  | 'circuitScorebug'
  | 'circuitIntro';
