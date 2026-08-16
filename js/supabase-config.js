/* Supabase connection for the public site.
   Both values below are publishable. The anon key is designed to ship in the
   browser, and row level security on `enquiries` is what actually protects the
   data: anon can insert a row and cannot read one back.

   Fill these in from Supabase dashboard > Project Settings > API.
   While they are left as placeholders the contact form falls back to email. */

export const SUPABASE_URL = "https://YOUR-PROJECT-REF.supabase.co";
export const SUPABASE_ANON_KEY = "YOUR-PUBLISHABLE-ANON-KEY";

export const isConfigured =
  !SUPABASE_URL.includes("YOUR-PROJECT-REF") &&
  !SUPABASE_ANON_KEY.includes("YOUR-PUBLISHABLE");
