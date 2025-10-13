// js/supabase.js
import { createClient } from "https://esm.sh/@supabase/supabase-js";

// --- SUPABASE CONFIG ---
const SUPABASE_URL = "https://kacdakznodzivyyoulvz.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthY2Rha3pub2R6aXZ5eW91bHZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NDk1MDMsImV4cCI6MjA3NTMyNTUwM30.BJJyQgJJV9vc6CRdKFf2PAlwjogh6jEuqOvcqBYrmzk";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

//
// ─── AUTH FUNCTIONS ───────────────────────────────────────────────
//

/**
 * Sign up a new vendor.
 * Automatically creates a vendor record linked to their Auth UID.
 */
export async function signUp(email, password, name) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }, // store vendor name in auth metadata
    },
  });
  if (error) throw error;

  if (data.user) {
    await supabase.from("vendors").insert([
      { id: data.user.id, email, name },
    ]);
  }
}

/**
 * Sign in an existing vendor.
 */
export async function signIn(email, password) {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
}

/**
 * Sign out current vendor.
 */
export async function signOut() {
  await supabase.auth.signOut();
}

/**
 * Get the currently logged-in vendor (user) if session is active.
 */
export async function getCurrentUser() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user || null;
}

//
// ─── CUSTOMER CRUD FUNCTIONS ─────────────────────────────────────
//

/**
 * Fetch all customers belonging to the logged-in vendor.
 */
export async function getCustomers() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not logged in");

  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("vendor_id", user.id)
    .order("id", { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Add a new customer (optional meter_name supported).
 */
export async function addCustomer(name, phone, meter_id, meter_name = null) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not logged in");

  const { error } = await supabase
    .from("customers")
    .insert([
      { name, phone, meter_id, meter_name, vendor_id: user.id },
    ]);
  if (error) throw error;
}

/**
 * Update an existing customer record.
 */
export async function updateCustomer(id, name, phone, meter_id, meter_name = null) {
  const { error } = await supabase
    .from("customers")
    .update({ name, phone, meter_id, meter_name })
    .eq("id", id);

  if (error) throw error;
}

/**
 * Delete a customer by ID.
 */
export async function deleteCustomer(id) {
  const { error } = await supabase
    .from("customers")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
