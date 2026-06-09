import { loadRoom, saveRoom, subscribeRoom } from './roomService';
import type { CircuitEntry, Category, CircuitEventData, GridSlot, CircuitTimingEntry, DriverLapData, RaceFlagData, PitEvent, PodiumData, FinalResultsData } from '@/types/circuit';
import type { GraphicsSettings } from '@/types/rally';

export interface CircuitState {
  event?: CircuitEventData;
  entries?: CircuitEntry[];
  categories?: Category[];
  grid?: GridSlot[];
  timing?: CircuitTimingEntry[];
  driverLap?: DriverLapData;
  raceFlag?: RaceFlagData;
  pitEvents?: PitEvent[];
  podium?: PodiumData;
  finalResults?: FinalResultsData;
}

export interface RoomState extends CircuitState {
  graphicsSettings?: GraphicsSettings;
}

type RoomCallback = (data: RoomState) => void;

export async function loadRoomState(): Promise<RoomState> {
  const raw = await loadRoom();
  return raw as RoomState;
}

export function persistRoomState(data: RoomState) {
  saveRoom(data as unknown as Record<string, unknown>);
}

export function subscribeRoomState(callback: RoomCallback): () => void {
  return subscribeRoom((data) => callback(data as RoomState));
}
