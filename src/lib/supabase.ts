import { createClient } from "@supabase/supabase-js";

// New Supabase project (Lira Luxe).
// The publishable key is meant to be public (it goes into the browser bundle anyway),
// so it's safe to keep it here. Data is protected by the Row Level Security policies in the database.
const SUPABASE_URL = "https://fffaggysgkpdymalunyn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_3kupLKBvZBBBVCAZH7USQg_Xp3M2eq1";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
