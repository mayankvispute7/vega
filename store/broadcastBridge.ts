// store/broadcastBridge.ts — BroadcastChannel ↔ Zustand sync
'use client';
import type { BroadcastMessage } from '@/lib/types';
import { BROADCAST_CHANNEL } from '@/lib/constants';

let channel: BroadcastChannel | null = null;

export function initBroadcast(
  onStatePatches: (msg: BroadcastMessage) => void
): () => void {
  if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
    return () => {};
  }
  channel = new BroadcastChannel(BROADCAST_CHANNEL);
  const handler = (e: MessageEvent<BroadcastMessage>) => {
    onStatePatches(e.data);
  };
  channel.addEventListener('message', handler);
  return () => {
    channel?.removeEventListener('message', handler);
    channel?.close();
    channel = null;
  };
}

export function broadcastMessage(msg: BroadcastMessage): void {
  channel?.postMessage(msg);
}
