import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { loadCircuitData, persistCircuitData, subscribeCircuitData } from '@/lib/supabasePersistence';
import type {
  CircuitEntry,
  GridSlot,
  CircuitTimingEntry,
  DriverLapData,
  RaceFlagData,
  PitEvent,
  PodiumData,
  FinalResultsData,
  CircuitEventData,
  Category,
} from '@/types/circuit';

interface CircuitStore {
  _hydrated: boolean;
  event: CircuitEventData;
  entries: CircuitEntry[];
  categories: Category[];
  selectedCategory: string | null;
  selectedEntryId: string | null;
  grid: GridSlot[];
  timing: CircuitTimingEntry[];
  driverLap: DriverLapData;
  raceFlag: RaceFlagData;
  pitEvents: PitEvent[];
  podium: PodiumData;
  finalResults: FinalResultsData;

  hydrate: () => Promise<void>;
  setEvent: (d: Partial<CircuitEventData>) => void;
  setEntries: (e: CircuitEntry[]) => void;
  addEntry: (e: CircuitEntry) => void;
  updateEntry: (id: string, e: Partial<CircuitEntry>) => void;
  removeEntry: (id: string) => void;
  setCategories: (c: Category[]) => void;
  addCategory: (c: Category) => void;
  updateCategory: (id: string, c: Partial<Category>) => void;
  removeCategory: (id: string) => void;
  setSelectedCategory: (c: string | null) => void;
  selectEntry: (id: string | null) => void;
  setGrid: (g: GridSlot[]) => void;
  setTiming: (t: CircuitTimingEntry[]) => void;
  setDriverLap: (d: Partial<DriverLapData>) => void;
  setRaceFlag: (d: Partial<RaceFlagData>) => void;
  setPitEvents: (p: PitEvent[]) => void;
  addPitEvent: (p: PitEvent) => void;
  setPodium: (d: Partial<PodiumData>) => void;
  setFinalResults: (d: Partial<FinalResultsData>) => void;
}

function persist(s: Pick<CircuitStore, 'entries' | 'categories'>) {
  persistCircuitData(
    { entries: s.entries, categories: s.categories },
    supabase !== null,
  );
}

const demoEntries: CircuitEntry[] = [
  { id: 'k1', carNumber: '7',  driverName: 'Mateo Vázquez',   shortName: 'VAZ', country: '🇦🇷', team: 'TGR Karting',   car: 'Tony Kart / Vortex', category: 'KZ',  qualifyingTime: '0:48.124' },
  { id: 'k2', carNumber: '12', driverName: 'Lucía Romero',    shortName: 'ROM', country: '🇦🇷', team: 'Croc Promotor',  car: 'CRG / IAME',         category: 'KZ',  qualifyingTime: '0:48.301' },
  { id: 'k3', carNumber: '3',  driverName: 'Iván Castelli',   shortName: 'CAS', country: '🇮🇹', team: 'Birel ART',      car: 'Birel ART / TM',     category: 'KZ',  qualifyingTime: '0:48.412' },
  { id: 'k4', carNumber: '21', driverName: 'Bruno Salvi',     shortName: 'SAL', country: '🇧🇷', team: 'KSB Motorsport', car: 'Kosmic / Vortex',    category: 'KZ',  qualifyingTime: '0:48.488' },
  { id: 'k5', carNumber: '44', driverName: 'Tomás Aguilera',  shortName: 'AGU', country: '🇦🇷', team: 'Praga Racing',   car: 'Praga / IAME',       category: 'KZ',  qualifyingTime: '0:48.512' },
  { id: 'k6', carNumber: '88', driverName: 'Hugo Lambert',    shortName: 'LAM', country: '🇫🇷', team: 'Sodi Racing',    car: 'Sodi / TM',          category: 'Rotax',  qualifyingTime: '0:48.591' },
  { id: 'k7', carNumber: '5',  driverName: 'Yuki Tanabe',     shortName: 'TAN', country: '🇯🇵', team: 'OK Japan',       car: 'OK1 / IAME',         category: 'Rotax',  qualifyingTime: '0:48.677' },
  { id: 'k8', carNumber: '17', driverName: 'Diego Méndez',    shortName: 'MEN', country: '🇲🇽', team: 'Energy Corse',   car: 'Energy / TM',        category: 'Junior',  qualifyingTime: '0:48.733' },
];

const demoCategories: Category[] = [
  { id: 'cat-kz', name: 'KZ', color: '#FF6B00' },
  { id: 'cat-rotax', name: 'Rotax', color: '#2563EB' },
  { id: 'cat-junior', name: 'Junior', color: '#16A34A' },
  { id: 'cat-cadete', name: 'Cadete', color: '#A855F7' },
];

export const useCircuitStore = create<CircuitStore>((set, get) => ({
  _hydrated: false,
  event: {
    series: 'Karting Nacional',
    round: 'Fecha 4',
    circuit: 'Zárate Karting Club',
    sessionType: 'race',
    totalLaps: 22,
    currentLap: 9,
  },
  entries: demoEntries,
  categories: demoCategories,
  selectedCategory: null,
  selectedEntryId: 'k1',
  grid: demoEntries.map((e, i) => ({
    position: i + 1,
    carNumber: e.carNumber,
    driverName: e.driverName,
    team: e.team,
    qualifyingTime: e.qualifyingTime,
    gap: i === 0 ? 'POLE' : `+${(0.177 * i).toFixed(3)}`,
  })),
  timing: [
    { position: 1, carNumber: '7',  driverName: 'M. Vázquez',   team: 'TGR Karting',   lap: 9, gap: 'LEADER',   interval: '—',       lastLap: '0:48.531', bestLap: '0:48.402', pitStops: 0, status: 'racing', isPurple: true },
    { position: 2, carNumber: '12', driverName: 'L. Romero',    team: 'Croc Promotor', lap: 9, gap: '+0.812',   interval: '+0.812',  lastLap: '0:48.602', bestLap: '0:48.510', pitStops: 0, status: 'racing' },
    { position: 3, carNumber: '3',  driverName: 'I. Castelli',  team: 'Birel ART',     lap: 9, gap: '+1.945',   interval: '+1.133',  lastLap: '0:48.711', bestLap: '0:48.580', pitStops: 0, status: 'racing' },
    { position: 4, carNumber: '21', driverName: 'B. Salvi',     team: 'KSB',           lap: 9, gap: '+3.221',   interval: '+1.276',  lastLap: '0:48.844', bestLap: '0:48.620', pitStops: 0, status: 'racing' },
    { position: 5, carNumber: '44', driverName: 'T. Aguilera',  team: 'Praga',         lap: 9, gap: '+4.502',   interval: '+1.281',  lastLap: '0:48.910', bestLap: '0:48.701', pitStops: 0, status: 'racing' },
    { position: 6, carNumber: '88', driverName: 'H. Lambert',   team: 'Sodi',          lap: 9, gap: '+5.880',   interval: '+1.378',  lastLap: '0:49.005', bestLap: '0:48.812', pitStops: 0, status: 'racing' },
    { position: 7, carNumber: '5',  driverName: 'Y. Tanabe',    team: 'OK Japan',      lap: 9, gap: '+7.221',   interval: '+1.341',  lastLap: '0:49.103', bestLap: '0:48.901', pitStops: 1, status: 'pit' },
    { position: 8, carNumber: '17', driverName: 'D. Méndez',    team: 'Energy Corse',  lap: 9, gap: '+8.812',   interval: '+1.591',  lastLap: '0:49.222', bestLap: '0:49.011', pitStops: 0, status: 'racing' },
  ],
  driverLap: {
    carNumber: '7',
    driverName: 'Mateo Vázquez',
    team: 'TGR Karting',
    country: '🇦🇷',
    position: 1,
    lap: 9,
    totalLaps: 22,
    sector: 2,
    sectorTime: '15.482',
    lastLap: '0:48.531',
    bestLap: '0:48.402',
    gapToLeader: 'LEADER',
  },
  raceFlag: { flag: 'green', message: '' },
  pitEvents: [
    { id: 'p1', carNumber: '5',  driverName: 'Y. Tanabe', team: 'OK Japan', pitTime: '23.4s', positionBefore: 5, positionAfter: 7, status: 'out', lap: 8 },
    { id: 'p2', carNumber: '17', driverName: 'D. Méndez', team: 'Energy',   pitTime: '24.1s', positionBefore: 6, positionAfter: 8, status: 'out', lap: 7 },
  ],
  podium: {
    series: 'Karting Nacional',
    raceName: 'Fecha 4 — Zárate',
    podium: [
      { position: 1, carNumber: '7',  driverName: 'M. Vázquez',  team: 'TGR Karting',   country: '🇦🇷', totalTime: '18:42.331', bestLap: '0:48.402' },
      { position: 2, carNumber: '12', driverName: 'L. Romero',   team: 'Croc Promotor', country: '🇦🇷', totalTime: '+1.842',    bestLap: '0:48.510' },
      { position: 3, carNumber: '3',  driverName: 'I. Castelli', team: 'Birel ART',     country: '🇮🇹', totalTime: '+3.105',    bestLap: '0:48.580' },
    ],
  },
  finalResults: {
    series: 'Karting Nacional',
    raceName: 'Fecha 4 — Zárate',
    totalLaps: 22,
    results: [
      { position: 1, carNumber: '7',  driverName: 'M. Vázquez',  team: 'TGR Karting',   laps: 22, totalTime: '18:42.331', bestLap: '0:48.402', status: 'finished' },
      { position: 2, carNumber: '12', driverName: 'L. Romero',   team: 'Croc Promotor', laps: 22, totalTime: '+1.842',    bestLap: '0:48.510', status: 'finished' },
      { position: 3, carNumber: '3',  driverName: 'I. Castelli', team: 'Birel ART',     laps: 22, totalTime: '+3.105',    bestLap: '0:48.580', status: 'finished' },
      { position: 4, carNumber: '21', driverName: 'B. Salvi',    team: 'KSB',           laps: 22, totalTime: '+5.221',    bestLap: '0:48.620', status: 'finished' },
      { position: 5, carNumber: '44', driverName: 'T. Aguilera', team: 'Praga',         laps: 22, totalTime: '+7.844',    bestLap: '0:48.701', status: 'finished' },
      { position: 6, carNumber: '88', driverName: 'H. Lambert',  team: 'Sodi',          laps: 22, totalTime: '+9.103',    bestLap: '0:48.812', status: 'finished' },
      { position: 7, carNumber: '17', driverName: 'D. Méndez',   team: 'Energy',        laps: 22, totalTime: '+12.501',   bestLap: '0:49.011', status: 'finished' },
      { position: 8, carNumber: '5',  driverName: 'Y. Tanabe',   team: 'OK Japan',      laps: 21, totalTime: '+1L',       bestLap: '0:48.901', status: 'finished' },
    ],
  },

  hydrate: async () => {
    if (get()._hydrated) return;
    const data = await loadCircuitData();
    if (data.entries.length || data.categories.length) {
      set({ entries: data.entries, categories: data.categories, _hydrated: true });
    } else {
      set({ _hydrated: true });
    }
    // Subscribe to remote changes
    subscribeCircuitData((remote) => {
      set({ entries: remote.entries, categories: remote.categories });
    });
  },

  setEvent: (d) => set((s) => ({ event: { ...s.event, ...d } })),
  setEntries: (e) => set((s) => {
    persist({ entries: e, categories: s.categories });
    return { entries: e };
  }),
  addEntry: (e) => set((s) => {
    const entries = [...s.entries, e];
    persist({ entries, categories: s.categories });
    return { entries };
  }),
  updateEntry: (id, e) => set((s) => {
    const entries = s.entries.map(x => x.id === id ? { ...x, ...e } : x);
    persist({ entries, categories: s.categories });
    return { entries };
  }),
  removeEntry: (id) => set((s) => {
    const entries = s.entries.filter(x => x.id !== id);
    persist({ entries, categories: s.categories });
    return {
      entries,
      selectedEntryId: s.selectedEntryId === id ? null : s.selectedEntryId,
    };
  }),
  setCategories: (c) => set((s) => {
    persist({ entries: s.entries, categories: c });
    return { categories: c };
  }),
  addCategory: (c) => set((s) => {
    const categories = [...s.categories, c];
    persist({ entries: s.entries, categories });
    return { categories };
  }),
  updateCategory: (id, c) => set((s) => {
    const categories = s.categories.map(x => x.id === id ? { ...x, ...c } : x);
    persist({ entries: s.entries, categories });
    return { categories };
  }),
  removeCategory: (id) => set((s) => {
    const categories = s.categories.filter(x => x.id !== id);
    const entries = s.entries.map(e => e.category === id ? { ...e, category: '' } : e);
    persist({ entries, categories });
    return { categories, entries, selectedCategory: s.selectedCategory === id ? null : s.selectedCategory };
  }),
  setSelectedCategory: (c) => set({ selectedCategory: c }),
  selectEntry: (id) => set((s) => {
    if (id === null) return { selectedEntryId: null };
    const e = s.entries.find(x => x.id === id);
    if (!e) return { selectedEntryId: id };
    return {
      selectedEntryId: id,
      driverLap: {
        ...s.driverLap,
        carNumber: e.carNumber,
        driverName: e.driverName,
        team: e.team,
        country: e.country,
      },
    };
  }),
  setGrid: (g) => set({ grid: g }),
  setTiming: (t) => set({ timing: t }),
  setDriverLap: (d) => set((s) => ({ driverLap: { ...s.driverLap, ...d } })),
  setRaceFlag: (d) => set((s) => ({ raceFlag: { ...s.raceFlag, ...d } })),
  setPitEvents: (p) => set({ pitEvents: p }),
  addPitEvent: (p) => set((s) => ({ pitEvents: [p, ...s.pitEvents].slice(0, 12) })),
  setPodium: (d) => set((s) => ({ podium: { ...s.podium, ...d } })),
  setFinalResults: (d) => set((s) => ({ finalResults: { ...s.finalResults, ...d } })),
}));
