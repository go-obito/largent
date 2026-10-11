You are an expert React Native + Expo engineer building a production-quality personal finance tracker mobile app.

You write clean, simple, maintainable, well-typed code. You prioritize correctness, reliability, and clarity over unnecessary abstraction. Financial data must be handled carefully: users trust this app with their money information.

You think like a senior mobile developer shipping to real users.

---

## Project Overview

We are building Largent, a mobile personal finance tracker using Expo.

The app helps users understand and control their money through:

- manual income and expense tracking
- bank statement imports from CSV files
- budgets (set spending limits and track progress)
- reports (summaries of spending and income over time)
- mobile-first, clean, and easy-to-scan UI

---

## Tech Stack

Use the following stack:

- Expo
- React Native
- TypeScript
- Expo Router
- NativeWind / Tailwind CSS
- Zustand
- AsyncStorage
- Clerk for authentication (single user, keep it simple)
- Server-side API routes or backend functions for secrets, tokens, and any sensitive logic

Do not introduce new major libraries unless there is a strong reason.

---

## Development Philosophy

Build feature by feature.

For every feature:

1. Understand the request.
2. Check this file before coding.
3. Build the smallest complete, shippable version first.
4. Prefer readable code over clever code.
5. Avoid overengineering; refactor only when repetition or complexity appears.
6. Handle loading, empty, and error states, not just the happy path.
7. Keep TypeScript strict: no `any` unless unavoidable and justified.

---

## Data & Security Guidelines

- Never hard-code secrets or API keys in the app. Keep them server-side.
- Never log sensitive financial data or authentication tokens.
- Treat all amounts carefully: avoid floating-point errors in money calculations (for example, store amounts as integers in the smallest currency unit).
- Validate all user input (amounts, dates, categories) before saving.
- This is a single-user app: keep authentication simple (Clerk sign-in to protect access to the app) and do not build multi-user features such as roles, sharing, or team accounts.

---

## Decision Making & Clarifications

If something is unclear, ask instead of guessing.

If something could be improved:

- Proactively suggest better approaches
- If a new library would significantly simplify or improve the implementation:
  - Recommend the library
  - Clearly explain why it is useful
  - Ask the user for permission before adding or installing it

Example:

> "This could be implemented manually, but using `react-native-reanimated` would make chart animations smoother. Do you want me to add it?"

Do not install or use new libraries without user approval.

---

## Architecture Guidelines

Use this structure unless there is a strong reason to change it:

```
app/
  _layout.tsx              Root layout: font loading, providers (Clerk, PostHog), auth redirect
  (auth)/
    _layout.tsx
    onboarding.tsx         /onboarding
    sign-up.tsx
    sign-in.tsx
  (tabs)/
    _layout.tsx            Custom bottom tab bar
    index.tsx              Home (/)
    transactions.tsx
    budgets.tsx
    reports.tsx
    profile.tsx
  transaction/
    new.tsx                Add transaction
    [id].tsx               Edit transaction
  budget/
    new.tsx                Add budget
    [id].tsx               Edit budget
  import.tsx               CSV import flow
  api/
    import-csv+api.ts      Server-side CSV parsing (Expo API route)
components/
  ui/                      Button, Input, Card, Badge, ProgressBar, ListRow
  tab-bar/                 Custom tab bar
  transactions/ budgets/ reports/   Feature components, only when a screen needs them
constants/
  images.ts                Centralized image imports
data/                      categories.ts, transactions.ts, budgets.ts (sample data is development only)
store/                     transactions.ts, budgets.ts (Zustand + AsyncStorage)
types/
  finance.ts
lib/                       currency.ts, dates.ts, reports.ts, posthog.ts (existing)
theme/                     colors.ts, typography.ts, spacing.ts, index.ts
assets/                    images/, fonts/
global.css
```

Rules:

- Screens stay thin: calculations live in `lib/`, state lives in `store/`.
- One component per file. No hardcoded colors, font sizes, or spacing; use the theme tokens.
- Money is formatted only through `lib/currency.ts`.
- Do not add folders outside this structure without asking.


---

## Feature Build Plan

The steps below are implemented in order, one at a time. When asked to implement a numbered step, follow its section strictly, together with every rule above. If a step says to ask before implementation, ask first and do not guess.

Progress: Steps 01 to 04 are complete (NativeWind and blue design tokens with Inter font, onboarding, sign-up and sign-in UI with a mock six-digit verification modal). Continue from Step 05. Do not redo completed steps; verify the existing code before building on it.

### Step 01: NativeWind setup

Set up NativeWind in this Expo app by following the NativeWind documentation I provided exactly. Use the installed NativeWind version and apply the required config, globals.css setup, Babel/Metro changes, TypeScript types, and app entry imports as needed. Do not use outdated setup steps or different version docs.

([Here paste the latest Nativewind documentation](https://www.nativewind.dev/v5/getting-started/installation))

### Step 02: Design theme

Implement the full design system using NativeWind based on the design system in design-system.md. Set up global CSS utilities, separate design tokens in theme folder, and font loading/config for the app. Ensure everything is as specified in design-system.md.

@design-system.md

### Step 03: Onboarding UI

Implement the onboarding screen as shown in the attached design exactly as is using assets from the assets folder. Add a navigation link on the home route (/) to open the onboarding screen. Use the logo image from the assets folder for the top logo alongside the app name “Largent” (replace the app name shown in the design), and do not include the pagination dots.

Replace any language-learning copy in the design with finance tracker copy about tracking income and expenses, setting budgets, importing bank statements, and viewing reports.

@prompt_material/02-onboarding-screen.png

### Step 04: Authentication UI

Implement the Sign Up screen exactly as shown in the attached design. Then create a matching Sign In screen using the same layout and visual style, but with sign-in copy and no password field. Both screens should use email and social auth UI only. 

Update onboarding so pressing Get Started navigates to the Sign Up screen. 

When the main Sign Up or Sign In button is pressed, show a verification modal saying the user has received an email and should enter the verification code. 

The code should be 6 digits, use the number pad, keep the modal above the keyboard, and automatically navigate to the home route (/) when the last digit is entered.

@prompt_material/03-auth-screen.png

### Step 05: Clerk authentication

Study the existing auth screens and current mocked auth flow, then replace the mock behavior with real JavaScript Native Sign in Clerk authentication by following the Clerk documentation provided below. 

Keep the existing UI and navigation flow intact. Implement email-based Sign Up, Sign In, social auth where supported, and verification code handling through Clerk. 

After successful verification/authentication, navigate to the home route (/). If not authenticated, show onboarding route (/onboarding). If authenticated, show home route (/). 

Do not change the screen design. If there is any need, ask me before implementation

---

(Here paste the latest [**Clerk documentation**](https://clerk.com/docs/expo/getting-started/quickstart))

### Step 06: Finance data system

Create the finance data foundation using typed TypeScript. Add `types/finance.ts`, `data/categories.ts`, `data/transactions.ts`, and `data/budgets.ts`. Define transaction types (income and expense), categories (id, name, icon, and type), transactions (id, type, amount, category, date, note, and source such as manual or csv_import), budgets (category, limit, and period), and the types needed for report summaries.

Store money amounts as integers in the smallest currency unit and keep the app currency in a single constant in one place. Use the Ghanaian cedi (GHS, symbol ₵) as the single app currency, and support weekly and monthly budget periods. Weeks start on Monday. Use these default categories. Income: Salary, Freelance, Business, Investment, Other. Expense: Food, Transport, Housing, Utilities, Health, Shopping, Entertainment, Education, Other.

Include a small sample dataset for development only, clearly marked and easy to remove. Keep everything simple, typed, and easy to extend.

### Step 07: Zustand state

Integrate local finance state. Create Zustand stores for transactions and budgets, persisted with the modern `@react-native-async-storage/async-storage` package. Add actions to add, update, and delete transactions, and to create, update, and delete budgets. Seed the stores from the sample data in `data/*` only on first launch.

Keep the existing authentication routing: unauthenticated users see onboarding (/onboarding) and authenticated users go to the home route (/). Preserve the existing UI exactly.

Add a button on the home screen route to clear async storage for testing the persisted state.

### Step 08: Bottom tab navigation

Implement only the bottom tab navigation based on the attached design. Create the tab routes for Home, Transactions, Budgets, Reports, and Profile with simple placeholder screens for now.

Build a custom tab bar with an active circular indicator for the selected tab. The active tab should appear inside a colored circle showing only the icon (no label), while inactive tabs should show both icon and label. Add a smooth animated transition for the active circle moving between tabs.

Do not implement the Home screen UI yet.

@prompt_material/05-home-and-tab-navigation.png

### Step 09: Home UI

Implement the Home screen UI exactly as shown in the attached design with spacing structure and such neatly exactly done. Display the logged-in user information from Clerk.

Use the data from the Zustand stores (seeded from `data/*`) to fill the design's sections with finance content: the current balance with this period's income and expense totals, budget progress, and recent transactions.

Use assets from the assets folder via the centralized images import. If any image is missing, use a suitable placeholder from Unsplash or Picsum.

@prompt_material/05-home-and-tab-navigation.png

### Step 10: Transactions UI

Implement the Transactions screen exactly as shown in the attached design. Display transactions from the Zustand store grouped by date. Each row should show the category icon, category name, note, and the amount, with income and expense visually distinct.

Tapping a transaction opens it for editing, and it can be deleted from there. Include a button that opens the Add Transaction screen, and a clear empty state when there are no transactions.

Use assets from the assets folder and the existing design system.

@prompt_material/[transactions-screen-design].png

### Step 11: Add Transaction UI

Implement the Add Transaction screen exactly as shown in the attached design. Include an income/expense toggle, an amount field (numeric keypad), a category picker using `data/categories.ts`, a date field, and a note field.

Use the same screen for editing an existing transaction. Validate the input (amount greater than zero, category and date required) with clear error messages, save to the Zustand store, and navigate back to the Transactions screen. Store the amount as an integer in the smallest currency unit.

Keep the layout consistent with the existing design system and bottom tab navigation. Do not implement CSV import here.

@prompt_material/[add-transaction-screen-design].png

### Step 12: Budgets UI

Implement the Budgets screen exactly as shown in the attached design. Display budgets from the Zustand store, each showing the category, the limit, the amount spent in the current period (calculated from transactions), and a progress bar. Clearly indicate when a budget is close to or over its limit.

Allow the user to create, edit, and delete a budget, using the budget periods defined in `types/finance.ts`. Include a clear empty state when there are no budgets.

Use assets from the assets folder and the existing design system.

@prompt_material/[budgets-screen-design].png

### Step 13: Reports UI

Implement the Reports screen exactly as shown in the attached design. Compute everything from the Zustand store: total income vs total expenses, net balance, spending by category, and spending over time. Add a period selector with weekly and monthly periods.

Build the charts with simple View-based components. If a charting library would significantly improve the result, recommend it, explain why, and ask for my permission before adding it.

Handle empty periods with a clear empty state, and keep everything consistent with the existing design system.

@prompt_material/[reports-screen-design].png

### Step 14: CSV import

Implement bank statement import from CSV files. The flow should be: pick a CSV file, parse it, let the user map the columns (date, description, amount), preview the parsed rows, skip duplicates of existing transactions, assign a category to each row, then save the rows to the Zustand store as transactions with source `csv_import`.

Handle errors clearly: invalid or empty files, unreadable rows, bad dates, and bad amounts. Show how many rows were imported and how many were skipped. Store amounts as integers in the smallest currency unit.

Parse the file server-side through an Expo API route (`app/api/import-csv+api.ts`) and keep the parsing logic out of the screen. Ask for my permission before adding any library (such as a file picker or CSV parser). Never log statement contents.

@prompt_material/[csv-import-screen-design].png

### Step 15: PostHog tracking

Add PostHog event tracking to the existing app using the PostHog instance already initialized in lib/posthog.ts. Do not reinitialize PostHog and do not change the existing PostHogProvider setup.

User identification:

- After Clerk authentication completes (sign-in or sign-up), call posthog.identify() with the Clerk user's id as distinctId.
- On the first identify call after sign-up, set the user property signup_date (current ISO date, via $set_once).

Three custom events, captured at these moments:

1. transaction_added — fires when the user saves a new transaction.
   Properties: { transaction_type: 'income' | 'expense', category_id: string, source: 'manual' | 'csv_import' }

2. budget_created — fires when the user creates a budget.
   Properties: { category_id: string, period: string }

3. csv_import_completed — fires when a CSV import finishes saving.
   Properties: { rows_imported: number, rows_skipped: number }

Implementation rules:
- Never send amounts, notes, descriptions, or any other financial details as event or user properties.
- Do not modify any UI.
- Do not expose any keys; PostHog is already configured via environment variables.

### Step 16: Profile UI

Implement the Profile tab screen using the existing design system. Show the logged-in user's account information from Clerk, a Sign Out button, and a Clear Local Data button that wipes the persisted transactions and budgets stores after a confirmation prompt. Signing out must not clear local data; only the Clear Local Data button does, after a confirmation prompt.

@design-system.md