// Public Supabase settings only. Do not add any secret/service-role key here.
const SUPABASE_URL = "https://gshsgytcbpfquzgpryib.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Nd0PlU_Ge2UJ9ZvNMAq2pA_Rwzs7lUR";
window.sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
