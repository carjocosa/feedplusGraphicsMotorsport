import { create } from 'zustand';
import type { CrewData, VsData, StageData, InterviewData, TimingEntry, HeadToHeadData, StartListEntry, WeatherData, EventData, Sponsor, CountdownData, GraphicsSettings, Entry, RallyIntroData, StageInfo, StageWeatherData, TransformableGraphic, GraphicLayoutMap, CrewSlot } from '@/types/rally';
import { defaultLayoutForGraphic } from '@/lib/graphicsStyle';

interface StageResult {
  name: string;
  url: string;
  results: TimingEntry[];
}

/**
 * Parse a time string like "12:34.5" or "1:45:22.3" to seconds.
 */
const parseTimeToSeconds = (t: string): number => {
  if (!t || t === '—' || t === 'LEADER') return 0;
  const parts = t.replace(',', '.').split(':');
  if (parts.length === 3) {
    return +parts[0] * 3600 + +parts[1] * 60 + +parts[2];
  }
  if (parts.length === 2) {
    return +parts[0] * 60 + +parts[1];
  }
  return +t || 0;
};

/**
 * Format seconds back to mm:ss.s or h:mm:ss.s
 */
const formatTime = (secs: number): string => {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs - h * 3600 - m * 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${s.toFixed(1).padStart(5, '0')}`;
  }
  return `${m}:${s.toFixed(1).padStart(4, '0')}`;
};

/**
 * Calculate overall standings by summing times from all stage results.
 */
const computeOverallStandings = (stages: StageResult[]): TimingEntry[] => {
  if (stages.length === 0) return [];

  // Accumulate total seconds per driver
  const totals = new Map<string, { totalSecs: number; driverName: string; coDriverName: string; carNumber: string; stagesCompleted: number }>();

  for (const stage of stages) {
    for (const entry of stage.results) {
      const key = entry.carNumber || entry.driverName;
      if (!key) continue;
      const secs = parseTimeToSeconds(entry.time);
      if (secs === 0) continue;

      const existing = totals.get(key);
      if (existing) {
        existing.totalSecs += secs;
        existing.stagesCompleted += 1;
      } else {
        totals.set(key, {
          totalSecs: secs,
          driverName: entry.driverName,
          coDriverName: entry.coDriverName || '',
          carNumber: entry.carNumber,
          stagesCompleted: 1,
        });
      }
    }
  }

  // Sort by total time
  const sorted = Array.from(totals.values()).sort((a, b) => a.totalSecs - b.totalSecs);

  // Build TimingEntry array with diffs
  const leaderSecs = sorted[0]?.totalSecs ?? 0;
  return sorted.map((entry, i) => ({
    position: i + 1,
    carNumber: entry.carNumber,
    driverName: entry.driverName,
    coDriverName: entry.coDriverName,
    time: formatTime(entry.totalSecs),
    diff: i === 0 ? '' : `+${formatTime(entry.totalSecs - leaderSecs)}`,
  }));
};

interface RallyStore {
  crew: CrewData;
  vsData: VsData;
  crewSlots: CrewSlot[];
  stage: StageData;
  interview: InterviewData;
  stageResults: TimingEntry[];
  overallStandings: TimingEntry[];
  stageResultsByStage: StageResult[];
  headToHead: HeadToHeadData;
  startList: StartListEntry[];
  weather: WeatherData;
  event: EventData;
  sponsors: Sponsor[];
  countdown: CountdownData;
  settings: GraphicsSettings;
  rallyIntro: RallyIntroData;
  stageWeather: StageWeatherData;
  entries: Entry[];
  selectedEntryId: string | null;
  displayPageSize: number;
  displayPageOffset: number;
  towerWidth: number;

  setCrew: (d: Partial<CrewData>) => void;
  setVsLeft: (d: Partial<VsData['left']>) => void;
  setVsRight: (d: Partial<VsData['right']>) => void;
  setCrewSlot: (index: number, slot: CrewSlot) => void;
  addCrewSlot: () => void;
  removeCrewSlot: (index: number) => void;
  setStage: (d: Partial<StageData>) => void;
  setInterview: (d: Partial<InterviewData>) => void;
  setStageResults: (d: TimingEntry[]) => void;
  setOverallStandings: (d: TimingEntry[]) => void;
  setStageResultsByStage: (d: StageResult[]) => void;
  addOrUpdateStageResult: (name: string, url: string, results: TimingEntry[]) => void;
  removeStageResult: (name: string) => void;
  setHeadToHead: (d: Partial<HeadToHeadData>) => void;
  setStartList: (d: StartListEntry[]) => void;
  setWeather: (d: Partial<WeatherData>) => void;
  setEvent: (d: Partial<EventData>) => void;
  setSponsors: (d: Sponsor[]) => void;
  setCountdown: (d: Partial<CountdownData>) => void;
  setSettings: (d: Partial<GraphicsSettings>) => void;
  setRallyIntro: (d: Partial<RallyIntroData>) => void;
  setStages: (s: StageInfo[]) => void;
  addStage: (s: StageInfo) => void;
  updateStage: (index: number, s: Partial<StageInfo>) => void;
  removeStage: (index: number) => void;
  setEntries: (d: Entry[]) => void;
  addEntry: (e: Entry) => void;
  updateEntry: (id: string, e: Partial<Entry>) => void;
  removeEntry: (id: string) => void;
  selectEntry: (id: string | null) => void;
  setStageWeather: (d: Partial<StageWeatherData>) => void;
  importBundle: (b: { entries?: Entry[]; rallyIntro?: RallyIntroData; stageWeather?: StageWeatherData; sponsors?: Sponsor[] }) => void;
  setLayout: (graphic: TransformableGraphic, patch: Partial<GraphicLayoutMap[string]>) => void;
  generateStartListFromEntries: () => void;
  setDisplayPageSize: (n: number) => void;
  setDisplayPageOffset: (n: number) => void;
  setTowerWidth: (n: number) => void;
}

export const useRallyStore = create<RallyStore>((set) => ({
  crew: {
    driverName: 'Sébastien Ogier',
    coDriverName: 'Vincent Landais',
    driverCountry: '🇫🇷',
    coDriverCountry: '🇫🇷',
    team: 'Toyota Gazoo Racing',
    car: 'Toyota GR Yaris Rally1',
    carNumber: '1',
  },
  vsData: {
    left: { name: 'Sébastien Ogier', country: '🇫🇷', team: 'Toyota Gazoo Racing', car: 'Toyota GR Yaris Rally1', carNumber: '1' },
    right: { name: 'Thierry Neuville', country: '🇧🇪', team: 'Hyundai Shell Mobis WRT', car: 'Hyundai i20 N Rally1', carNumber: '11' },
  },
  crewSlots: [
    { entryId: null, data: { driverName: 'Sébastien Ogier', coDriverName: 'Vincent Landais', driverCountry: '🇫🇷', coDriverCountry: '🇫🇷', team: 'Toyota Gazoo Racing', car: 'Toyota GR Yaris Rally1', carNumber: '1' } },
    { entryId: null, data: { driverName: 'Thierry Neuville', coDriverName: 'Martijn Wydaeghe', driverCountry: '🇧🇪', coDriverCountry: '🇧🇪', team: 'Hyundai Shell Mobis WRT', car: 'Hyundai i20 N Rally1', carNumber: '11' } },
  ],
  stage: {
    stageNumber: 4,
    stageName: 'El Cóndor',
    distance: '24.33 km',
    surface: 'gravel' as const,
  },
  interview: {
    name: 'Sébastien Ogier',
    role: 'Piloto - Toyota Gazoo Racing',
  },
  stageResults: [
    { position: 1, carNumber: '1', driverName: 'S. Ogier', coDriverName: 'V. Landais', time: '12:34.5', diff: '' },
    { position: 2, carNumber: '11', driverName: 'T. Neuville', coDriverName: 'M. Wydaeghe', time: '12:37.2', diff: '+2.7' },
    { position: 3, carNumber: '8', driverName: 'O. Tänak', coDriverName: 'M. Järveoja', time: '12:39.8', diff: '+5.3' },
    { position: 4, carNumber: '33', driverName: 'E. Evans', coDriverName: 'S. Martin', time: '12:41.1', diff: '+6.6' },
    { position: 5, carNumber: '69', driverName: 'K. Rovanperä', coDriverName: 'J. Halttunen', time: '12:42.0', diff: '+7.5' },
    { position: 6, carNumber: '16', driverName: 'A. Fourmaux', coDriverName: 'A. Coria', time: '12:44.3', diff: '+9.8' },
    { position: 7, carNumber: '42', driverName: 'C. Breen', coDriverName: 'J. Fulton', time: '12:46.1', diff: '+11.6' },
    { position: 8, carNumber: '18', driverName: 'T. Katsuta', coDriverName: 'A. Johnston', time: '12:48.5', diff: '+14.0' },
    { position: 9, carNumber: '44', driverName: 'G. Greensmith', coDriverName: 'J. Andersson', time: '12:50.2', diff: '+15.7' },
    { position: 10, carNumber: '21', driverName: 'P. Loubet', coDriverName: 'N. Gilsoul', time: '12:52.9', diff: '+18.4' },
  ],
  overallStandings: [
    { position: 1, carNumber: '11', driverName: 'T. Neuville', coDriverName: 'M. Wydaeghe', time: '1:45:22.3', diff: '' },
    { position: 2, carNumber: '1', driverName: 'S. Ogier', coDriverName: 'V. Landais', time: '1:45:28.1', diff: '+5.8' },
    { position: 3, carNumber: '8', driverName: 'O. Tänak', coDriverName: 'M. Järveoja', time: '1:45:45.9', diff: '+23.6' },
    { position: 4, carNumber: '33', driverName: 'E. Evans', coDriverName: 'S. Martin', time: '1:46:01.2', diff: '+38.9' },
    { position: 5, carNumber: '69', driverName: 'K. Rovanperä', coDriverName: 'J. Halttunen', time: '1:46:15.0', diff: '+52.7' },
  ],
  headToHead: {
    driver1: { name: 'S. Ogier', country: '🇫🇷', time: '12:34.5', carNumber: '1' },
    driver2: { name: 'T. Neuville', country: '🇧🇪', time: '12:37.2', carNumber: '11' },
    diff: '2.7',
    leader: 1,
  },
  startList: [
    { startOrder: 1, carNumber: '11', driverName: 'T. Neuville', coDriverName: 'M. Wydaeghe', startTime: '08:01' },
    { startOrder: 2, carNumber: '1', driverName: 'S. Ogier', coDriverName: 'V. Landais', startTime: '08:03' },
    { startOrder: 3, carNumber: '8', driverName: 'O. Tänak', coDriverName: 'M. Järveoja', startTime: '08:05' },
    { startOrder: 4, carNumber: '33', driverName: 'E. Evans', coDriverName: 'S. Martin', startTime: '08:07' },
    { startOrder: 5, carNumber: '69', driverName: 'K. Rovanperä', coDriverName: 'J. Halttunen', startTime: '08:09' },
  ],
  weather: { condition: 'sunny', temperature: 22, windSpeed: '15 km/h' },
  event: { eventName: 'Rally Argentina', stageNumber: 4, stageName: 'El Cóndor' },
  sponsors: [
    { name: 'Total Energies' },
    { name: 'Michelin' },
    { name: 'Red Bull' },
    { name: 'Shell' },
    { name: 'Pirelli' },
  ],
  countdown: { targetTime: Date.now() + 600000, label: 'SS4 START', startTime: new Date(Date.now() + 600000).toTimeString().slice(0, 5) },
  settings: {
    primaryColor: '#1A1A1E',
    secondaryColor: '#0F0F11',
    accentColor: '#FF6B00',
    textColor: '#E8E8F0',
    shearAngle: 0,
    fontDisplay: 'Barlow Condensed',
    fontSizeScale: 0.95,
    panelOpacity: 0.92,
    cornerStyle: 'sharp',
    animationSpeed: 'fast',
    borderAccent: true,
    lowerThirdLayout: 'horizontal',
    towerWidth: 560,
    displayPageSize: 15,
    displayPageOffset: 0,
    language: 'es',
    customLabels: {},
    routeAnimDuration: 8,
    transforms: {
      crewLowerThird: { x: 0, y: 0, scale: 1 },
      stageLowerThird: { x: 0, y: 0, scale: 1 },
      interviewLowerThird: { x: 0, y: 0, scale: 1 },
      vsLowerThird: { x: 0, y: 0, scale: 1 },
      scorebug: { x: 0, y: 0, scale: 1 },
      stageResults: { x: 0, y: 0, scale: 1 },
      overallStandings: { x: 0, y: 0, scale: 1 },
      headToHead: { x: 0, y: 0, scale: 1 },
      startList: { x: 0, y: 0, scale: 1 },
      entriesList: { x: 0, y: 0, scale: 1 },
      stageMap: { x: 0, y: 0, scale: 1 },
      elevationProfile: { x: 0, y: 0, scale: 1 },
      weather: { x: 0, y: 0, scale: 1 },
      sponsorCrawl: { x: 0, y: 0, scale: 1 },
      countdown: { x: 0, y: 0, scale: 1 },
      rallyIntro: { x: 0, y: 0, scale: 1 },
      stagePresentation: { x: 0, y: 0, scale: 1 },
      stageWeather: { x: 0, y: 0, scale: 1 },
      circuitScorebug: { x: 0, y: 0, scale: 1 },
      startGrid: { x: 0, y: 0, scale: 1 },
      circuitTiming: { x: 0, y: 0, scale: 1 },
      driverLap: { x: 0, y: 0, scale: 1 },
      raceFlag: { x: 0, y: 0, scale: 1 },
      pitTracker: { x: 0, y: 0, scale: 1 },
      podium: { x: 0, y: 0, scale: 1 },
      finalResults: { x: 0, y: 0, scale: 1 },
    },
    layouts: {},
  },
  rallyIntro: {
    eventName: 'Rally Argentina',
    edition: '44ª Edición',
    location: 'Córdoba, Argentina',
    dates: '26 — 28 ABRIL 2026',
    totalStages: 12,
    totalDistance: '342.18 km',
    surface: 'Tierra',
    headline: 'EL MUNDIAL VUELVE A LAS SIERRAS',
    stages: [
      { stageNumber: 1, stageName: 'Capilla del Monte', distance: '18.42 km', surface: 'gravel', startTime: '08:30', location: 'Capilla del Monte', notes: 'Inicio rápido en montaña', recordTime: '10:21.4', recordHolder: 'S. Ogier (2024)' },
      { stageNumber: 2, stageName: 'San Marcos', distance: '22.10 km', surface: 'gravel', startTime: '09:45', location: 'San Marcos Sierras', notes: 'Curvas técnicas y baches' },
      { stageNumber: 3, stageName: 'Ascochinga', distance: '15.80 km', surface: 'gravel', startTime: '11:20', location: 'Ascochinga' },
      { stageNumber: 4, stageName: 'El Cóndor', distance: '24.33 km', surface: 'gravel', startTime: '13:10', location: 'Cumbre El Cóndor', notes: 'Especial reina, alta altitud', recordTime: '12:34.5', recordHolder: 'S. Ogier (2024)' },
      { stageNumber: 5, stageName: 'Mina Clavero', distance: '19.65 km', surface: 'gravel', startTime: '15:00', location: 'Mina Clavero' },
      { stageNumber: 6, stageName: 'Giulio Cesare', distance: '20.40 km', surface: 'gravel', startTime: '16:30', location: 'Traslasierra' },
    ],
  },
  stageWeather: {
    stageNumber: 4,
    stageName: 'El Cóndor',
    condition: 'cloudy',
    temperature: 18,
    windSpeed: '22 km/h',
    humidity: '64%',
    precipitation: '0 mm',
    visibility: '10 km',
    trackCondition: 'Seco',
    shortForecast: 'Cielo nublado, sin lluvia las próximas 3h.',
    forecast: [
      { time: '12:00', condition: 'cloudy', temperature: 17 },
      { time: '13:00', condition: 'cloudy', temperature: 18 },
      { time: '14:00', condition: 'rainy', temperature: 16 },
      { time: '15:00', condition: 'rainy', temperature: 15 },
    ],
  },
  entries: [
    { id: 'e1', carNumber: '1', driverName: 'Sébastien Ogier', coDriverName: 'Vincent Landais', driverCountry: '🇫🇷', coDriverCountry: '🇫🇷', team: 'Toyota Gazoo Racing', car: 'Toyota GR Yaris Rally1', category: 'Rally1' },
    { id: 'e2', carNumber: '11', driverName: 'Thierry Neuville', coDriverName: 'Martijn Wydaeghe', driverCountry: '🇧🇪', coDriverCountry: '🇧🇪', team: 'Hyundai Shell Mobis WRT', car: 'Hyundai i20 N Rally1', category: 'Rally1' },
    { id: 'e3', carNumber: '8', driverName: 'Ott Tänak', coDriverName: 'Martin Järveoja', driverCountry: '🇪🇪', coDriverCountry: '🇪🇪', team: 'Hyundai Shell Mobis WRT', car: 'Hyundai i20 N Rally1', category: 'Rally1' },
  ],
  selectedEntryId: 'e1',
  stageResultsByStage: [],
  displayPageSize: 15,
  displayPageOffset: 0,
  towerWidth: 560,

  setCrew: (d) => set((s) => ({ crew: { ...s.crew, ...d } })),
  setVsLeft: (d) => set((s) => ({ vsData: { ...s.vsData, left: { ...s.vsData.left, ...d } } })),
  setVsRight: (d) => set((s) => ({ vsData: { ...s.vsData, right: { ...s.vsData.right, ...d } } })),
  setCrewSlot: (i, slot) => set((s) => ({
    crewSlots: s.crewSlots.map((x, idx) => idx === i ? slot : x),
  })),
  addCrewSlot: () => set((s) => ({
    crewSlots: [...s.crewSlots, { entryId: null, data: { driverName: '', coDriverName: '', driverCountry: '', coDriverCountry: '', team: '', car: '', carNumber: '' } }],
  })),
  removeCrewSlot: (i) => set((s) => ({
    crewSlots: s.crewSlots.filter((_, idx) => idx !== i),
  })),
  setStage: (d) => set((s) => ({ stage: { ...s.stage, ...d } })),
  setInterview: (d) => set((s) => ({ interview: { ...s.interview, ...d } })),
  setStageResultsByStage: (d) => set((s) => ({
    stageResultsByStage: d,
    overallStandings: computeOverallStandings(d),
  })),
  addOrUpdateStageResult: (name, url, results) => set((s) => {
    const existing = s.stageResultsByStage.findIndex(sr => sr.name === name);
    const updated = existing >= 0
      ? s.stageResultsByStage.map((sr, i) => i === existing ? { name, url, results } : sr)
      : [...s.stageResultsByStage, { name, url, results }];
    return {
      stageResultsByStage: updated,
      overallStandings: computeOverallStandings(updated),
    };
  }),
  removeStageResult: (name) => set((s) => {
    const updated = s.stageResultsByStage.filter(sr => sr.name !== name);
    return {
      stageResultsByStage: updated,
      overallStandings: computeOverallStandings(updated),
    };
  }),
  setStageResults: (d) => set({ stageResults: d }),
  setOverallStandings: (d) => set({ overallStandings: d }),
  setHeadToHead: (d) => set((s) => ({ headToHead: { ...s.headToHead, ...d } })),
  setStartList: (d) => set({ startList: d }),
  setWeather: (d) => set((s) => ({ weather: { ...s.weather, ...d } })),
  setEvent: (d) => set((s) => ({ event: { ...s.event, ...d } })),
  setSponsors: (d) => set({ sponsors: d }),
  setCountdown: (d) => set((s) => ({ countdown: { ...s.countdown, ...d } })),
  setSettings: (d) => set((s) => ({ settings: { ...s.settings, ...d } })),
  setRallyIntro: (d) => set((s) => ({ rallyIntro: { ...s.rallyIntro, ...d } })),
  setStages: (st) => set((s) => ({ rallyIntro: { ...s.rallyIntro, stages: st, totalStages: st.length } })),
  addStage: (st) => set((s) => {
    const stages = [...s.rallyIntro.stages, st];
    return { rallyIntro: { ...s.rallyIntro, stages, totalStages: stages.length } };
  }),
  updateStage: (i, st) => set((s) => {
    const stages = s.rallyIntro.stages.map((x, idx) => idx === i ? { ...x, ...st } : x);
    return { rallyIntro: { ...s.rallyIntro, stages } };
  }),
  removeStage: (i) => set((s) => {
    const stages = s.rallyIntro.stages.filter((_, idx) => idx !== i);
    return { rallyIntro: { ...s.rallyIntro, stages, totalStages: stages.length } };
  }),
  setEntries: (d) => set((s) => {
    const startList = d.map((e, i) => ({
      startOrder: i + 1,
      carNumber: e.carNumber,
      driverName: e.driverName.split(' ').map(p => p[0]).slice(0, -1).join('. ') + '. ' + e.driverName.split(' ').slice(-1)[0],
      coDriverName: e.coDriverName.split(' ').map(p => p[0]).slice(0, -1).join('. ') + '. ' + e.coDriverName.split(' ').slice(-1)[0],
      startTime: `${String(8 + Math.floor(i * 2 / 60)).padStart(2, '0')}:${String(i * 2 % 60).padStart(2, '0')}`,
    }));
    return { entries: d, startList };
  }),
  addEntry: (e) => set((s) => {
    const entries = [...s.entries, e];
    const startList = entries.map((entry, i) => ({
      startOrder: i + 1,
      carNumber: entry.carNumber,
      driverName: entry.driverName.split(' ').map(p => p[0]).slice(0, -1).join('. ') + '. ' + entry.driverName.split(' ').slice(-1)[0],
      coDriverName: entry.coDriverName.split(' ').map(p => p[0]).slice(0, -1).join('. ') + '. ' + entry.coDriverName.split(' ').slice(-1)[0],
      startTime: `${String(8 + Math.floor(i * 2 / 60)).padStart(2, '0')}:${String(i * 2 % 60).padStart(2, '0')}`,
    }));
    return { entries, startList };
  }),
  updateEntry: (id, e) => set((s) => {
    const entries = s.entries.map(x => x.id === id ? { ...x, ...e } : x);
    const startList = entries.map((entry, i) => ({
      startOrder: i + 1,
      carNumber: entry.carNumber,
      driverName: entry.driverName.split(' ').map(p => p[0]).slice(0, -1).join('. ') + '. ' + entry.driverName.split(' ').slice(-1)[0],
      coDriverName: entry.coDriverName.split(' ').map(p => p[0]).slice(0, -1).join('. ') + '. ' + entry.coDriverName.split(' ').slice(-1)[0],
      startTime: `${String(8 + Math.floor(i * 2 / 60)).padStart(2, '0')}:${String(i * 2 % 60).padStart(2, '0')}`,
    }));
    return { entries, startList };
  }),
  removeEntry: (id) => set((s) => {
    const entries = s.entries.filter(x => x.id !== id);
    const startList = entries.map((entry, i) => ({
      startOrder: i + 1,
      carNumber: entry.carNumber,
      driverName: entry.driverName.split(' ').map(p => p[0]).slice(0, -1).join('. ') + '. ' + entry.driverName.split(' ').slice(-1)[0],
      coDriverName: entry.coDriverName.split(' ').map(p => p[0]).slice(0, -1).join('. ') + '. ' + entry.coDriverName.split(' ').slice(-1)[0],
      startTime: `${String(8 + Math.floor(i * 2 / 60)).padStart(2, '0')}:${String(i * 2 % 60).padStart(2, '0')}`,
    }));
    return { entries, startList, selectedEntryId: s.selectedEntryId === id ? null : s.selectedEntryId };
  }),
  selectEntry: (id) => set((s) => {
    if (id === null) return { selectedEntryId: null };
    const e = s.entries.find(x => x.id === id);
    if (!e) return { selectedEntryId: id };
    const abbrev = (name: string) => name.split(' ').map(p => p[0]).slice(0, -1).join('. ') + '. ' + name.split(' ').slice(-1)[0];
    return {
      selectedEntryId: id,
      crew: {
        driverName: e.driverName,
        coDriverName: e.coDriverName,
        driverCountry: e.driverCountry,
        coDriverCountry: e.coDriverCountry,
        team: e.team,
        car: e.car,
        carNumber: e.carNumber,
      },
      interview: {
        name: e.driverName,
        role: `Piloto · ${e.team}`,
      },
      headToHead: {
        ...s.headToHead,
        driver1: {
          name: abbrev(e.driverName),
          country: e.driverCountry,
          time: s.headToHead.driver1.time,
          carNumber: e.carNumber,
        },
      },
    };
  }),
  generateStartListFromEntries: () => set((s) => {
    const startList = s.entries.map((e, i) => ({
      startOrder: i + 1,
      carNumber: e.carNumber,
      driverName: e.driverName.split(' ').map(p => p[0]).slice(0, -1).join('. ') + '. ' + e.driverName.split(' ').slice(-1)[0],
      coDriverName: e.coDriverName.split(' ').map(p => p[0]).slice(0, -1).join('. ') + '. ' + e.coDriverName.split(' ').slice(-1)[0],
      startTime: `${String(8 + Math.floor(i * 2 / 60)).padStart(2, '0')}:${String(i * 2 % 60).padStart(2, '0')}`,
    }));
    return { startList };
  }),
  setStageWeather: (d) => set((s) => ({ stageWeather: { ...s.stageWeather, ...d } })),
  importBundle: (b) => set((s) => ({
    entries: b.entries ?? s.entries,
    rallyIntro: b.rallyIntro ?? s.rallyIntro,
    stageWeather: b.stageWeather ?? s.stageWeather,
    sponsors: b.sponsors ?? s.sponsors,
  })),
  setLayout: (graphic, patch) => set((s) => {
    const current = s.settings.layouts?.[graphic] ?? defaultLayoutForGraphic(graphic);
    const layouts: GraphicLayoutMap = { ...s.settings.layouts, [graphic]: { ...current, ...patch } };
    return { settings: { ...s.settings, layouts } };
  }),
  setDisplayPageSize: (n) => set((s) => ({
    displayPageSize: n,
    displayPageOffset: 0,
    settings: { ...s.settings, displayPageSize: n, displayPageOffset: 0 },
  })),
  setDisplayPageOffset: (n) => set((s) => ({
    displayPageOffset: n,
    settings: { ...s.settings, displayPageOffset: n },
  })),
  setTowerWidth: (n) => set((s) => ({
    towerWidth: n,
    settings: { ...s.settings, towerWidth: n },
  })),
}));
