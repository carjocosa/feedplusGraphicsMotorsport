// Circuit / Karting types — paralelos al rally, sin tocar tipos existentes.

export type DiscipMode = 'rally' | 'circuit';

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
  shortName?: string;        // ej: "OGI"
  country: string;           // emoji bandera
  team: string;
  car: string;               // chasis / motor / vehículo
  category?: string;
  qualifyingTime?: string;   // "1:23.456"
}

export interface GridSlot {
  position: number;
  carNumber: string;
  driverName: string;
  team: string;
  qualifyingTime?: string;
  gap?: string;              // delta vs pole "+0.124"
}

export interface CircuitTimingEntry {
  position: number;
  carNumber: string;
  driverName: string;
  team: string;
  lap: number;
  gap: string;               // "LEADER" | "+0.832" | "+1L"
  interval: string;          // gap al de adelante
  lastLap: string;
  bestLap: string;
  pitStops?: number;
  status?: 'racing' | 'pit' | 'out';
  isPurple?: boolean;        // mejor vuelta de la sesión
  isPersonalBest?: boolean;
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
  totalTime: string;         // "1:23:45.678" (líder) o "+12.345"
  bestLap: string;
  status?: 'finished' | 'dnf' | 'dsq';
}

export interface FinalResultsData {
  series: string;
  raceName: string;
  totalLaps: number;
  results: FinalResultEntry[];
}

export type SessionKind = 'practice' | 'qualifying' | 'race' | 'sprint' | 'feature';

export interface CircuitEventData {
  series: string;            // "Karting Nacional"
  round: string;             // "Fecha 4"
  circuit: string;           // "Zárate Karting"
  sessionType: SessionKind;
  totalLaps: number;
  currentLap: number;
}

export type CircuitGraphicType =
  | 'startGrid'
  | 'circuitTiming'
  | 'driverLap'
  | 'raceFlag'
  | 'pitTracker'
  | 'podium'
  | 'finalResults'
  | 'circuitScorebug';
