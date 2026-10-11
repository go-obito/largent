# Master Build Prompt: Largent

Read `AGENTS.md` and `design-system.md` completely before writing any code. Follow `AGENTS.md` strictly. Then build the entire Largent app (a single-user personal finance tracker) by completing Steps 01 to 16 of the Feature Build Plan in `AGENTS.md`, in order.

---

## 1. Locked decisions (do not re-ask or change)

- App name: **Largent**
- Platform: Expo + React Native + TypeScript, Expo Router, NativeWind, Zustand, AsyncStorage, Clerk, Expo API routes. No other major libraries without my approval.
- Currency: Ghanaian cedi, ISO code **GHS**, symbol **₵**. One currency only. No multi-currency.
- Budget and report periods: **weekly and monthly** only.
- Bank statement import: **CSV only**, parsed **server-side** through an Expo API route.
- Single user per install. No sharing, roles, teams, or multi-user features. Keep Clerk authentication simple.
- Tabs: Home, Transactions, Budgets, Reports, Profile.
- Profile tab: account info (from Clerk), Sign Out, Clear Local Data (with confirmation).
- Design: clean, calm, trustworthy, blue primary, light theme only, Inter font, as defined in `design-system.md`.
- Out of scope: Stream, Vision Agents, audio/video, AI features, live bank syncing, dark mode, language selection.

---

## 1a. Resolved clarifications (do not ask these again)

- **Step 16 and the folder tree exist.** They are in the latest `AGENTS.md` (Architecture Guidelines section and Step 16: Profile UI). If your copy still shows an empty Architecture section or only Steps 01 to 15, it is outdated; use the latest file I supplied. The Architecture Guidelines section is the exact folder tree and it replaces any other structure.
- **Blue overrides the design images.** Where a supplied design image uses green or any other color, or language-learning content, keep its layout, spacing and structure but take every color, font, radius and shadow from `design-system.md`. Replace language-learning copy with finance copy.
- **You may design missing screens.** For any screen with no supplied design (auth, tabs, home, transactions, add/edit, budgets, reports, CSV import, profile), design it from `design-system.md` plus the step description. Keep layouts simple and conventional. `homepage-theme.png` is the visual reference for the Home screen and the bottom tab bar.
- **Sample data in images is not real data.** Names, amounts and initials in any mockup are placeholders.

---

## 2. How to work

For every step:

1. Re-read the step in `AGENTS.md` and the rules it depends on (design system, architecture, data and security rules).
2. Build the smallest complete, shippable version. No placeholder logic that looks finished but is not.
3. Cover loading, empty, and error states, not just the happy path.
4. Run the TypeScript check and the linter, and fix every error. Confirm the app launches and the step's screen or feature works.
5. Report in at most five lines: what was built, files touched, anything you could not verify. Then continue to the next step.

Stop and ask me, instead of guessing, whenever:

- a step says to ask before implementation,
- a library, package, or service would be added (explain why and wait for approval),
- anything in this prompt conflicts with `AGENTS.md` or `design-system.md`.

Decisions already made (do not ask): weeks start on Monday; default categories are Income: Salary, Freelance, Business, Investment, Other; Expense: Food, Transport, Housing, Utilities, Health, Shopping, Entertainment, Education, Other; signing out does not clear local data.

Still ask before: installing Expo Document Picker (Step 14) or any other new library.

---

## 3. Architecture

Use the folder structure in the Architecture Guidelines section of `AGENTS.md` exactly. Key rules:

- Screens stay thin. Calculations live in `lib/`, state lives in `store/`, shared UI lives in `components/ui/`.
- Tokens live in `theme/` and are mapped into NativeWind; no hardcoded colors, font sizes, or spacing in screens.
- All money formatting goes through `lib/currency.ts`.
- All images are imported through `constants/images.ts`.

---

## 4. Domain model (`types/finance.ts`)

Define and export:

- `TransactionType`: `'income' | 'expense'`
- `Category`: `id`, `name`, `icon` (an `@expo/vector-icons` name), `type`
- `Transaction`: `id`, `type`, `amount` (integer pesewas, never a float), `categoryId`, `date` (ISO string), `note`, `source` (`'manual' | 'csv_import'`), `createdAt`, `updatedAt`
- `BudgetPeriod`: `'weekly' | 'monthly'`
- `Budget`: `id`, `categoryId`, `limit` (integer pesewas), `period`
- `ReportPeriod` and the summary types the Reports screen needs (totals, per-category spending, spending over time)

Money rules:

- Store every amount as an integer in pesewas (1 cedi = 100 pesewas).
- Convert to and from display values only in `lib/currency.ts`.
- `formatMoney` must render ₵ correctly on both iOS and Android. If `Intl` formatting is unreliable on the target runtime, format manually and note it.
- Never use floating point for money math.

---

## 5. State and persistence

- Two Zustand stores (`store/transactions.ts`, `store/budgets.ts`), persisted with `@react-native-async-storage/async-storage`.
- Actions: add, update, delete for both stores.
- Add a persistence `version` to each store so future schema changes can be migrated.
- Seed from the sample data in `data/*` only on first launch, and mark the sample data clearly as development-only and easy to remove.
- Derived values (balance, period totals, budget spending, report data) are computed by pure functions in `lib/`, not stored.
- Validate all input (amount greater than zero, category and date required) before it reaches a store.

---

## 6. Authentication and routing

- Clerk, email-based sign up and sign in, 6-digit verification code, social auth where supported (Steps 04 and 05).
- Unauthenticated users see `/onboarding`; authenticated users go to `/`.
- Keep the existing auth UI untouched when wiring Clerk.
- Never log tokens or user data.

---

## 7. Screens

Build each exactly as specified in its step in `AGENTS.md`, using `design-system.md`:

- **Onboarding, Sign Up, Sign In** (Steps 03 to 05)
- **Home**: Clerk user info, current balance, this period's income and expense totals, budget progress, recent transactions.
- **Transactions**: list grouped by date, tap to edit, delete from the edit screen, empty state, button to add.
- **Add / Edit Transaction**: income/expense toggle, numeric amount, category picker, date, note; same screen for create and edit.
- **Budgets**: list with spent vs limit and progress bar (blue, amber from 80%, red over limit); create, edit, delete; weekly or monthly.
- **Reports**: income vs expenses, net balance, spending by category, spending over time, weekly/monthly selector; View-based charts (ask before adding a chart library).
- **CSV Import**: pick file, upload to the API route, map columns (date, description, amount), preview, skip duplicates of existing transactions, assign categories, save as `csv_import` transactions, show imported and skipped counts.
- **Profile**: account info, Sign Out, Clear Local Data with confirmation.

---

## 8. Server-side CSV import (`app/api/import-csv+api.ts`)

- Accept a CSV upload, parse it on the server, and return structured rows to the app. Do not store the file or its contents anywhere on the server.
- Require an authenticated Clerk session on the request and reject anything else.
- Enforce a maximum file size and row count, and return clear errors for: wrong file type, empty file, unreadable rows, bad dates, bad amounts.
- Convert amounts to integer pesewas in a single, tested helper.
- Never log file contents, rows, or amounts. No secrets in the mobile app; secrets stay in server environment variables.
- Ask me before adding a CSV parsing library.

---

## 9. Analytics (Step 15)

Use the existing PostHog instance in `lib/posthog.ts`. Do not reinitialize it. Identify the user after Clerk auth. Capture only `transaction_added`, `budget_created`, and `csv_import_completed` with the properties in Step 15. Never send amounts, notes, descriptions, or any financial details.

---

## 10. Quality bar (definition of done for the whole app)

- TypeScript strict, no `any` without a written reason, no lint errors.
- No hardcoded hex colors, font sizes, or secrets in the code.
- Every screen has loading, empty, and error states, and respects safe areas.
- Touch targets at least 44x44; text meets the contrast ratios in `design-system.md`.
- Data survives an app restart; Clear Local Data removes it.
- Amounts are always integers internally and always display as ₵ with a sign rule from `design-system.md`.
- Final summary: list every step, what was verified, what was not, and every decision you made that I did not specify.