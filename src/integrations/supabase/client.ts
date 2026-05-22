import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://usfibjlyadihyitnvzya.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_kePRSRtR4ocvFoYy5PqTYg_UITT5IXf";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export type BibleVerse = {
  id: string | number;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  translation: string;
  testament: string;
  book_order: number;
  chapter_order: number;
  verse_order: number;
  language: string;
  created_at: string;
};
