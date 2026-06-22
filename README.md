# Betterhomes Form A / LSA Supabase Onboarding Portal

## Upload these files to GitHub
- index.html
- client.html
- styles.css
- config.js
- app.js
- client.js
- supabase-schema.sql

## Supabase setup
1. Open Supabase > SQL Editor > New Query.
2. Copy all text from `supabase-schema.sql` and click Run.
3. Go to Storage > New bucket.
4. Create a private bucket called exactly:
   onboarding-documents
5. Deploy this folder to Vercel via GitHub.

## Live pages
- Broker page: /index.html
- Client page: /client.html?id=REQUEST_ID

## Security note
Only the publishable key is used in `config.js`. Do not place the secret/service role key in GitHub or in any browser file. If the secret key was shared or exposed, rotate it in Supabase.
