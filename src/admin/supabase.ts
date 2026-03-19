import { createClient } from "@supabase/supabase-js";
import type { SupabaseUser, ActivityRow, InsertRow } from "./types.js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function signIn(email: string, password: string): Promise<SupabaseUser> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return {
    id: data.user.id,
    email: data.user.email,
  };
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function getSession(): Promise<SupabaseUser | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) return null;
  return {
    id: data.session.user.id,
    email: data.session.user.email,
  };
}

export async function listActivities(): Promise<ActivityRow[]> {
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .order("sort_date", { ascending: true });
  if (error) throw new Error(error.message);
  return data as ActivityRow[];
}

export async function insertActivities(rows: InsertRow[]): Promise<void> {
  const { error } = await supabase.from("activities").insert(rows);
  if (error) throw new Error(error.message);
}

export async function updateActivity(id: string, row: Partial<InsertRow>): Promise<void> {
  const { error } = await supabase.from("activities").update(row).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteActivityById(id: string): Promise<void> {
  const { error } = await supabase.from("activities").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteActivitiesByGroupId(groupId: string): Promise<void> {
  const { error } = await supabase.from("activities").delete().eq("group_id", groupId);
  if (error) throw new Error(error.message);
}
