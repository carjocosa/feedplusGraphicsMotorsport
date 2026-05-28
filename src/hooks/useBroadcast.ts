import { useEffect, useRef, useCallback } from 'react';
import { BroadcastMessage } from '@/types/rally';
import { supabase } from '@/integrations/supabase/client';

const CHANNEL_NAME = 'rallystream-pro';

// Unique sender ID per tab to avoid echo loops with Supabase Realtime.
const SENDER_ID = Math.random().toString(36).slice(2, 10);

function realtimeChannelName(room: string | null) {
  return room ? `rs-room-${room}` : null;
}

export function useBroadcastSender(room?: string | null) {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const rtRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel(CHANNEL_NAME);
    return () => channelRef.current?.close();
  }, []);

  useEffect(() => {
    const name = realtimeChannelName(room ?? null);
    if (!name) return;
    const ch = supabase.channel(name, { config: { broadcast: { self: false } } });
    ch.subscribe();
    rtRef.current = ch;
    return () => {
      supabase.removeChannel(ch);
      rtRef.current = null;
    };
  }, [room]);

  const send = useCallback((message: BroadcastMessage) => {
    channelRef.current?.postMessage(message);
    if (rtRef.current) {
      rtRef.current.send({
        type: 'broadcast',
        event: 'msg',
        payload: { ...message, __sender: SENDER_ID },
      });
    }
  }, []);

  return send;
}

export function useBroadcastReceiver(
  onMessage: (message: BroadcastMessage) => void,
  room?: string | null,
) {
  const callbackRef = useRef(onMessage);
  callbackRef.current = onMessage;

  useEffect(() => {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (event) => callbackRef.current(event.data);
    return () => channel.close();
  }, []);

  useEffect(() => {
    const name = realtimeChannelName(room ?? null);
    if (!name) return;
    const ch = supabase
      .channel(name, { config: { broadcast: { self: false } } })
      .on('broadcast', { event: 'msg' }, (payload) => {
        const data = payload?.payload as any;
        if (!data) return;
        if (data.__sender === SENDER_ID) return;
        const { __sender, ...msg } = data;
        callbackRef.current(msg as BroadcastMessage);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [room]);
}
