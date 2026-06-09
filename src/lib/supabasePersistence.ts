import { supabase } from '@/integrations/supabase/client';
import type { CircuitEntry, Category } from '@/types/circuit';

const STORAGE_KEY = 'feedplus-circuit';

interface CircuitStoreData {
  entries: CircuitEntry[];
  categories: Category[];
}

type SyncCallback = (data: CircuitStoreData) => void;

let lastSaveTs = 0;
let subscribed = false;
const listeners = new Set<SyncCallback>();

function now(): number {
  return Date.now();
}

function loadLocal(): CircuitStoreData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function saveLocal(data: CircuitStoreData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* quota */ }
}

// ── Supabase ──

async function fetchFromSupabase(): Promise<CircuitStoreData | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('circuit_data')
      .select('data')
      .eq('id', 'default')
      .single();
    if (error || !data) return null;
    const parsed = data.data as CircuitStoreData | null;
    if (parsed && Array.isArray(parsed.entries) && Array.isArray(parsed.categories)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

async function saveToSupabase(data: CircuitStoreData): Promise<void> {
  if (!supabase) return;
  const ts = now();
  lastSaveTs = ts;
  try {
    await supabase.from('circuit_data').upsert(
      { id: 'default', data, updated_at: ts },
      { onConflict: 'id' },
    );
  } catch { /* ignore */ }
}

function subscribeToChanges(onData: SyncCallback): () => void {
  if (!supabase) return () => {};
  listeners.add(onData);

  if (!subscribed) {
    subscribed = true;
    supabase
      .channel('circuit-data-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'circuit_data',
          filter: 'id=eq.default',
        },
        (payload) => {
          const ts = now();
          const remoteTs =
            (payload.new as any)?.updated_at ?? 0;
          // Ignore our own saves (within 2s window)
          if (remoteTs > 0 && Math.abs(remoteTs - lastSaveTs) < 2000) return;

          const remoteData = (payload.new as any)?.data as CircuitStoreData | null;
          if (!remoteData || !Array.isArray(remoteData.entries)) return;

          listeners.forEach((fn) => fn(remoteData));
        },
      )
      .subscribe();
  }

  return () => {
    listeners.delete(onData);
  };
}

// ── Public API ──

export async function loadCircuitData(): Promise<CircuitStoreData> {
  // Try Supabase first
  const remote = await fetchFromSupabase();
  if (remote) {
    saveLocal(remote);
    return remote;
  }

  // Fallback to localStorage
  const local = loadLocal();
  if (local) return local;

  // No data at all
  return { entries: [], categories: [] };
}

export function persistCircuitData(
  data: CircuitStoreData,
  preferSupabase: boolean,
) {
  saveLocal(data);
  if (preferSupabase) {
    saveToSupabase(data);
  }
}

export function subscribeCircuitData(
  onData: SyncCallback,
): () => void {
  return subscribeToChanges(onData);
}
