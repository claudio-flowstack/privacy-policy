/**
 * Supabase ↔ localStorage sync layer
 */

import { supabase } from '@/lib/supabase';

const SYNC_KEYS = [
  'flowstack-content-items',
  'flowstack-content-research',
  'flowstack-content-files',
  'flowstack-content-plans',
  'flowstack-coldmail-campaigns',
  'flowstack-coldmail-leads',
  'flowstack-coldmail-templates',
  'flowstack-linkedin-campaigns',
  'flowstack-linkedin-posts',
  'flowstack-linkedin-leads',
  'flowstack-linkedin-templates',
  'flowstack-linkedin-sequences',
  'flowstack-marketing-campaigns',
  'flowstack-marketing-leads',
  'flowstack-hub-notes',
  'flowstack-automation-systems',
  'flowstack-hidden-demos',
  'flowstack-user-templates',
  'flowstack-funnel-boards',
];

/** Push a single localStorage key to Supabase */
async function pushKey(key: string): Promise<void> {
  if (!supabase) return;
  const raw = localStorage.getItem(key);
  if (raw === null) return;

  try {
    const value = JSON.parse(raw);
    await supabase.from('kv_store').upsert(
      { key, value, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    );
    console.log(`[sync] ✅ pushed ${key}`);
  } catch (e) {
    console.warn(`[sync] ❌ push failed for ${key}:`, e);
  }
}

/** Pull all keys from Supabase → localStorage */
export async function pullFromSupabase(): Promise<void> {
  if (!supabase) return;

  try {
    const { data, error } = await supabase
      .from('kv_store')
      .select('key, value')
      .in('key', SYNC_KEYS);

    if (error) {
      console.warn('[sync] ❌ pull error:', error.message);
      return;
    }

    console.log(`[sync] 📥 pulled ${data?.length ?? 0} keys from Supabase`);

    if (data) {
      for (const row of data) {
        const remote = JSON.stringify(row.value);
        if (remote && remote !== 'null') {
          localStorage.setItem(row.key, remote);
          console.log(`[sync] 📥 ${row.key} → localStorage (${remote.length} chars)`);
        }
      }
    }
  } catch (e) {
    console.warn('[sync] ❌ pull failed:', e);
  }
}

/** Push all localStorage keys to Supabase */
export async function pushToSupabase(): Promise<void> {
  if (!supabase) return;

  const rows: { key: string; value: unknown; updated_at: string }[] = [];

  for (const key of SYNC_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        rows.push({
          key,
          value: JSON.parse(raw),
          updated_at: new Date().toISOString(),
        });
      } catch { /* skip invalid JSON */ }
    }
  }

  if (rows.length === 0) {
    console.log('[sync] 📤 nothing to push');
    return;
  }

  try {
    const { error } = await supabase.from('kv_store').upsert(rows, { onConflict: 'key' });
    if (error) {
      console.warn('[sync] ❌ pushAll error:', error.message);
    } else {
      console.log(`[sync] 📤 pushed ${rows.length} keys to Supabase`);
    }
  } catch (e) {
    console.warn('[sync] ❌ pushAll failed:', e);
  }
}

// Debounce helper
let pushTimer: ReturnType<typeof setTimeout> | null = null;

function debouncedPush(key: string) {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushKey(key);
    pushTimer = null;
  }, 1000);
}

export function startSync(): void {
  const originalSetItem = localStorage.setItem.bind(localStorage);
  localStorage.setItem = (key: string, value: string) => {
    originalSetItem(key, value);
    if (SYNC_KEYS.includes(key)) {
      debouncedPush(key);
    }
  };

  window.addEventListener('storage', (e) => {
    if (e.key && SYNC_KEYS.includes(e.key)) {
      debouncedPush(e.key);
    }
  });
}

export async function initSupabaseSync(): Promise<void> {
  if (!supabase) {
    console.warn('[sync] ⚠️ No Supabase config — local-only mode');
    return;
  }
  console.log('[sync] 🚀 Starting Supabase sync...');
  await pullFromSupabase();
  startSync();
  await pushToSupabase();
  console.log('[sync] ✅ Sync complete, app ready');
}
