// js/supabase.js
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const SUPABASE_URL = 'https://kacdakznodzivyyoulvz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthY2Rha3pub2R6aXZ5eW91bHZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NDk1MDMsImV4cCI6MjA3NTMyNTUwM30.BJJyQgJJV9vc6CRdKFf2PAlwjogh6jEuqOvcqBYrmzk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- FETCH ALL CUSTOMERS ---
export async function getCustomers() {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('id', { ascending: true });

  if (error) throw error;
  return data;
}

// --- ADD CUSTOMER (with optional meter_name) ---
export async function addCustomer(name, phone, meter_id, meter_name = null) {
  const { error } = await supabase
    .from('customers')
    .insert([{ name, phone, meter_id, meter_name }]);
  if (error) throw error;
}

// --- DELETE CUSTOMER ---
export async function deleteCustomer(id) {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// --- UPDATE CUSTOMER (with optional meter_name) ---
export async function updateCustomer(id, name, phone, meter_id, meter_name = null) {
  const { error } = await supabase
    .from('customers')
    .update({ name, phone, meter_id, meter_name })
    .eq('id', id);
  if (error) throw error;
}
