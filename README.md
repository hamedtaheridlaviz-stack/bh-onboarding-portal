# Betterhomes Form A / LSA Supabase Onboarding Portal

Mobile-first onboarding portal for creating secure client document requests.

## What is included
- Broker request creator
- Sales Form A / Leasing LSA selector
- English + Arabic covering letter
- Mobile client upload page
- Supabase database + storage connection
- WhatsApp client link button

## Setup
1. Create a free Supabase project.
2. Open SQL Editor and run `supabase-schema.sql`.
3. Go to Storage > New bucket.
4. Create bucket named `onboarding-documents` and keep it private.
5. In Supabase Project Settings > API, copy:
   - Project URL
   - anon public key
6. Rename `config.example.js` to `config.js`.
7. Paste your Supabase details into `config.js`.
8. Upload the folder to GitHub.
9. Deploy to Vercel.

## Important security note
This prototype is made to get the workflow working quickly. Before using it with real Emirates IDs, passports or title deeds, use broker authentication, stricter RLS policies and signed download links.
