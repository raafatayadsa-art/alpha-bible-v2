import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://usfibjlyadihyitnvzya.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_kePRSRtR4ocvFoYy5PqTYg_UITT5IXf";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export type BibleVerse = {
  ID: number;
  book_name: string;
  chapter_number: number;
  verse_number: number;
  verse_text: string;
};
