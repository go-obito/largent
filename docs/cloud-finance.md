# Largent cloud finance service

## Architecture

- Clerk remains the identity provider; Supabase Postgres is the durable cloud database.
- The mobile/web client sends its Clerk session JWT to the Supabase Data API as a Bearer token.
- Configure Supabase's third-party authentication integration for Clerk and ensure the JWT subject claim is the Clerk user ID. The SQL migration uses `auth.jwt()->>'sub'` as the owner identity.
- All three tables have RLS policies for SELECT/INSERT/UPDATE/DELETE. A user may read and write only rows whose `user_id` matches their verified Clerk JWT subject.
- Never ship a Supabase secret/service-role key in the app. Only the project URL and publishable key may be public.
- Amounts remain integer pesewas.

## Setup

1. Create or select a Supabase project.
2. In the Supabase dashboard, configure Clerk as a third-party authentication provider using the Clerk instance/JWT configuration described in the Supabase and Clerk docs.
3. Run `supabase/migrations/202610130001_cloud_finance.sql` in Supabase SQL Editor, or apply it with the Supabase CLI.
4. Set these client environment variables in local development and each deployment:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
5. Ensure production web deployment supports the desired Supabase Data API requests from your site origin.

## Current implementation scope

`src/lib/cloud-finance.ts` supplies a typed cloud repository for pulling and upserting transactions, budgets and prioritized needs through Clerk-authenticated requests. It does not automatically migrate pre-existing per-device AsyncStorage records because there can be multiple app installations and no safe server-side way to infer which local data belongs to which account.

## Safe rollout

- Deploy this in a test Supabase project first and test with two different Clerk accounts.
- Create records as account A, verify they are inaccessible to account B, and verify unauthenticated calls are denied.
- Import or reconcile existing local data while signed into the intended account.
- Switch stores to the repository only after the migration and two-account isolation tests pass.

## Important note

This PR introduces the database schema and repository foundation. Wiring every screen's existing write paths into a conflict-safe offline-capable sync workflow and migrating local data safely is a separate rollout step; do not enable cloud-only mode until the Supabase/Clerk setup and isolation tests have been completed.
