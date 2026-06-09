import { supabase } from '@/integrations/supabase/client';

const ROOM_KEY = 'rs-room';
const LOCAL_KEY = 'feedplus-room';

type RoomDataCallback = (data: Record<string, unknown>) => void;

let subscribeRoomId: string | null = null;
const listeners = new Set<RoomDataCallback>();

// ── Room ID ──

export function getRoomId(): string {
  const fromUrl = new URLSearchParams(window.location.search).get('room');
  if (fromUrl) {
    localStorage.setItem(ROOM_KEY, fromUrl);
    return fromUrl;
  }
  const stored = localStorage.getItem(ROOM_KEY);
  if (stored) return stored;
  const generated = Math.random().toString(36).slice(2, 10);
  localStorage.setItem(ROOM_KEY, generated);
  return generated;
}

// ── Local persistence (fallback) ──

function localKey(roomId: string): string {
  return `${LOCAL_KEY}-${roomId}`;
}

function loadLocal(roomId: string): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(localKey(roomId));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveLocal(roomId: string, data: Record<string, unknown>) {
  try { localStorage.setItem(localKey(roomId), JSON.stringify(data)); } catch { /* quota */ }
}

// ── Supabase persistence ──

async function fetchRemote(roomId: string): Promise<Record<string, unknown> | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('room_data')
      .select('data')
      .eq('id', roomId)
      .single();
    if (error || !data) return null;
    return data.data as Record<string, unknown> ?? null;
  } catch {
    return null;
  }
}

async function saveRemote(roomId: string, data: Record<string, unknown>) {
  if (!supabase) return;
  try {
    const ts = Date.now();
    await supabase.from('room_data').upsert(
      { id: roomId, data, updated_at: ts },
      { onConflict: 'id' },
    );
  } catch { /* ignore */ }
}

// ── Public API ──

export async function loadRoom(roomId?: string): Promise<Record<string, unknown>> {
  const id = roomId ?? getRoomId();
  const remote = await fetchRemote(id);
  if (remote) {
    saveLocal(id, remote);
    return remote;
  }
  const local = loadLocal(id);
  if (local) return local;
  return {};
}

export function saveRoom(
  data: Record<string, unknown>,
  roomId?: string,
) {
  const id = roomId ?? getRoomId();
  saveLocal(id, data);
  if (supabase) {
    saveRemote(id, data);
  }
}

export function subscribeRoom(
  callback: RoomDataCallback,
  roomId?: string,
): () => void {
  const id = roomId ?? getRoomId();
  listeners.add(callback);

  if (!subscribeRoomId && supabase) {
    subscribeRoomId = id;
    supabase
      .channel('room-data-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_data',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          const remoteData = (payload.new as any)?.data as Record<string, unknown> | null;
          if (!remoteData) return;
          listeners.forEach((fn) => fn(remoteData));
        },
      )
      .subscribe();
  }

  return () => {
    listeners.delete(callback);
  };
}

export function clearRoom(roomId?: string) {
  const id = roomId ?? getRoomId();
  localStorage.removeItem(localKey(id));
  saveRemote(id, {});
}
