# Design System: Finance Tracker

Mood: clean, calm, trustworthy, bank-like. Minimal ornament, generous whitespace, one blue brand color, and color used mainly to carry meaning (income, expense, warnings).

Scope: light theme only. Dark mode is not included. Tokens are named by role so a dark palette can be added later without renaming anything.

---

## 1. Colors

### Brand (blue)

| Token | Hex | Use |
|---|---|---|
| primary-50 | #EFF6FF | Tinted backgrounds, selected rows |
| primary-100 | #DBEAFE | Chips, subtle fills |
| primary-200 | #BFDBFE | Borders on tinted surfaces |
| primary-300 | #93C5FD | Disabled primary, decorative |
| primary-400 | #60A5FA | Charts, secondary accents |
| primary-500 | #3B82F6 | Charts, focus ring |
| **primary-600** | **#2563EB** | **Main brand color: buttons, active tab, links** |
| primary-700 | #1D4ED8 | Pressed state |
| primary-800 | #1E40AF | Headings on tinted surfaces |
| primary-900 | #1E3A8A | Deep accents |

### Neutrals (slate)

| Token | Hex | Use |
|---|---|---|
| neutral-50 | #F8FAFC | App background |
| neutral-100 | #F1F5F9 | Input fill, muted surfaces |
| neutral-200 | #E2E8F0 | Borders, dividers, progress track |
| neutral-300 | #CBD5E1 | Disabled borders |
| neutral-400 | #94A3B8 | Placeholder text, inactive icons (non-text) |
| neutral-500 | #64748B | Muted text |
| neutral-600 | #475569 | Secondary text |
| neutral-700 | #334155 | Strong secondary text |
| neutral-800 | #1E293B | Headings (alternative) |
| neutral-900 | #0F172A | Primary text |
| surface | #FFFFFF | Cards, sheets, modals |

### Semantic

| Token | Hex | Tint (background) | Use |
|---|---|---|---|
| income | #15803D | #F0FDF4 | Income amounts, positive change |
| expense | #B91C1C | #FEF2F2 | Expense amounts, errors, destructive actions |
| warning | #B45309 | #FFFBEB | Budget close to limit, cautions |
| info | #1D4ED8 | #EFF6FF | Neutral notices (uses brand blue) |

### Contrast (checked, WCAG AA needs 4.5:1 for normal text)

| Pair | Ratio |
|---|---|
| White on primary-600 | 5.17 |
| neutral-900 on neutral-50 | 17.06 |
| neutral-600 on white | 7.58 |
| neutral-500 on white | 4.76 |
| income on white | 5.02 |
| expense on white | 6.47 |
| warning on white | 5.02 |

Rules: never use neutral-400 for text that carries meaning. Never rely on color alone for income vs expense; always pair it with a sign (see section 6).

---

## 2. Typography

Font family: **Inter** (single family, four weights).

| Token | Weight | Font name to load |
|---|---|---|
| regular | 400 | Inter_400Regular |
| medium | 500 | Inter_500Medium |
| semibold | 600 | Inter_600SemiBold |
| bold | 700 | Inter_700Bold |

Loading: use the Google Fonts package for Inter with `expo-font`'s `useFonts`, keep the splash screen visible until fonts are loaded, and show nothing until then. Per AGENTS.md, ask permission before installing the font package.

### Type scale

| Token | Size / line height | Weight | Use |
|---|---|---|---|
| display | 36 / 44 | bold | Main balance |
| title-1 | 28 / 36 | bold | Screen titles |
| title-2 | 22 / 28 | semibold | Section titles |
| title-3 | 18 / 24 | semibold | Card titles |
| body | 16 / 24 | regular | Default text |
| body-medium | 16 / 24 | medium | Row titles, labels |
| caption | 14 / 20 | regular | Secondary info, dates |
| small | 12 / 16 | medium | Badges, tab labels, helper text |

Numbers: all money amounts use tabular figures so columns align (`fontVariant: ['tabular-nums']`). Letter spacing is default; no all-caps except `small` badges.

---

## 3. Spacing & Layout

4-point base scale: 4, 8, 12, 16, 20, 24, 32, 40, 48.

- Screen horizontal padding: 20
- Space between sections: 24
- Space between cards in a list: 12
- Card inner padding: 16
- Minimum touch target: 44 x 44
- Respect safe areas on all screens; leave bottom space for the tab bar.

---

## 4. Radius & Elevation

| Token | Value | Use |
|---|---|---|
| radius-sm | 8 | Chips, small buttons |
| radius-md | 12 | Buttons, inputs |
| radius-lg | 16 | Cards |
| radius-xl | 24 | Bottom sheets, modals |
| radius-full | 999 | Pills, progress bars, tab circle |

Elevation is minimal. Prefer a 1px border (neutral-200) over shadows.

| Token | Use | Spec |
|---|---|---|
| shadow-sm | Cards (optional) | 0 1px 2px, 6% neutral-900 |
| shadow-md | Modals, bottom sheets, tab bar | 0 4px 12px, 10% neutral-900 |

---

## 5. Components

**Button**
- Height 52, radius-md, horizontal padding 20, label in body-medium semibold.
- Primary: primary-600 fill, white label; pressed primary-700; disabled primary-300.
- Secondary: white fill, 1px neutral-200 border, neutral-900 label.
- Ghost: no fill, primary-600 label.
- Destructive: expense fill, white label.

**Input**
- Height 52, radius-md, neutral-100 fill, 1px transparent border, body text.
- Focus: 2px primary-500 border, white fill. Error: 1px expense border with caption error text below.
- Placeholder neutral-400 (decorative hint only; always keep a visible label).

**Card**
- White surface, radius-lg, padding 16, 1px neutral-200 border (shadow-sm optional).

**List row (transaction)**
- Height 64. Left: 40x40 circular category icon on primary-50 fill with primary-600 icon. Middle: category name (body-medium) and note or date (caption, neutral-500). Right: amount (body-medium, tabular).
- Divider: 1px neutral-200, inset to align with the text.

**Progress bar (budgets)**
- Height 8, radius-full, track neutral-200.
- Fill primary-600 under 80% of limit, warning from 80% to 100%, expense over 100%.

**Badge / chip**
- Height 24, radius-full, small text, tinted background with matching text color (income, expense, warning, primary-100 with primary-800).

**Bottom tab bar**
- Height 64 plus safe area, white surface, top border neutral-200 (or shadow-md).
- Inactive tab: icon and `small` label in neutral-500.
- Active tab: 48 circle in primary-600 with a white icon and no label, animated sliding between tabs.

**Modal / bottom sheet**
- White surface, radius-xl on top corners, shadow-md, 24 padding, scrim 40% neutral-900.

---

## 6. Money Display Rules

- Income: income color with a leading `+`.
- Expense: neutral-900 with a leading `-` in lists (keeps the screen calm), expense color only for totals, overspend and errors.
- Never show a bare number: always format with the app currency constant.
- Large balance uses `display` style; the currency symbol is `title-2` weight regular, aligned to the baseline.

---

## 7. Implementation Notes (NativeWind)

Follow the installed NativeWind version's documentation for how tokens are registered.

- `theme/colors.ts`: all color tokens above.
- `theme/typography.ts`: font family names, sizes, line heights.
- `theme/spacing.ts`: spacing scale, radii, shadows.
- `theme/index.ts`: re-exports the three files.
- `global.css`: map the tokens to NativeWind/Tailwind theme values so classes like `bg-primary-600`, `text-neutral-900`, `rounded-lg` work, and add shared utilities for the components above (card, button variants, input, badge, list row, progress bar).
- Font loading and config: a single place in the root layout, as described in section 2.
- No hardcoded hex values or font sizes in screens; always use tokens or utilities.
- Icons: `@expo/vector-icons` only (line style, 24px by default, 20px inside list rows).