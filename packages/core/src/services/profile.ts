import type { AppSupabaseClient } from '../supabase/types';
import { mapProfileRow, type Profile } from '../domain/profile';

export async function getById(
  client: AppSupabaseClient,
  id: string,
): Promise<Profile | null> {
  const { data, error } = await client
    .from('profile')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapProfileRow(data) : null;
}

export async function updateDisplayName(
  client: AppSupabaseClient,
  id: string,
  displayName: string,
): Promise<Profile> {
  const trimmed = displayName.trim();
  const { data, error } = await client
    .from('profile')
    .update({ display_name: trimmed.length === 0 ? null : trimmed })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return mapProfileRow(data);
}
