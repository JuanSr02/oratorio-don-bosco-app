import type { House, Child, AttendanceRecord } from './types';

interface QueuedOperation {
  id: string;
  type: 'SAVE_HOUSE' | 'DELETE_HOUSE' | 'SAVE_CHILD' | 'DELETE_CHILD' | 'SAVE_ATTENDANCE';
  payload: any;
}

export function queueOfflineOperation(type: QueuedOperation['type'], payload: any) {
  if (typeof window === 'undefined') return;
  const queue: QueuedOperation[] = JSON.parse(localStorage.getItem('offline_queue') || '[]');
  queue.push({ id: Date.now().toString(), type, payload });
  localStorage.setItem('offline_queue', JSON.stringify(queue));
}

export async function syncOfflineQueue(db: any) {
  if (typeof window === 'undefined' || !navigator.onLine) return;
  const queue: QueuedOperation[] = JSON.parse(localStorage.getItem('offline_queue') || '[]');
  if (queue.length === 0) return;

  if (process.env.NODE_ENV !== 'production') {
    console.log('📡 Internet recuperado! Sincronizando operaciones atrasadas:', queue.length);
  }
  const remaining = [];

  for (const op of queue) {
    try {
      if (op.type === 'SAVE_HOUSE') await db.supabaseSaveHouse(op.payload);
      if (op.type === 'DELETE_HOUSE') await db.supabaseDeleteHouse(op.payload);
      if (op.type === 'SAVE_CHILD') await db.supabaseSaveChild(op.payload);
      if (op.type === 'DELETE_CHILD') await db.supabaseDeleteChild(op.payload);
      if (op.type === 'SAVE_ATTENDANCE') await db.supabaseSaveAttendance(op.payload);
      if (process.env.NODE_ENV !== 'production') {
        console.log('✅ Sincronización exitosa resuelta:', op.type);
      }
    } catch (e: unknown) {
      const err = e as { message?: string }
      if (process.env.NODE_ENV !== 'production') {
        console.error('❌ Error enviando de fondo:', op, e);
      }
      if (err?.message === 'Failed to fetch' || !navigator.onLine) {
        remaining.push(op); // Todavía sin red
      }
    }
  }

  localStorage.setItem('offline_queue', JSON.stringify(remaining));
}

// ── SISTEMA DE CACHÉ LOCAL INMEDIATO ──

export function setLocalCache(key: string, data: any) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`cache_${key}`, JSON.stringify(data));
}

export function getLocalCache(key: string, fallback: any = null) {
  if (typeof window === 'undefined') return fallback;
  const item = localStorage.getItem(`cache_${key}`);
  if (!item) return fallback;
  try { return JSON.parse(item); } catch { return fallback; }
}

export function updateLocalCacheArray(key: string, item: any, isDelete = false, idField = 'id') {
  if (typeof window === 'undefined') return;
  const cache = getLocalCache(key, []);
  if (!Array.isArray(cache)) return;

  const idToMatch = typeof item === 'object' ? item[idField] : item;
  const index = cache.findIndex(x => x[idField] === idToMatch);
  
  if (isDelete) {
    if (index >= 0) cache.splice(index, 1);
  } else {
    if (index >= 0) cache[index] = item;
    else cache.push(item);
  }
  setLocalCache(key, cache);
}
