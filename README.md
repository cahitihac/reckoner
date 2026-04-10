# Reckoner

A lightweight group expense splitter built with Vue 3, Vite, and Tailwind CSS. Track shared costs for trips, dinners, or any event and instantly see who owes whom.

## Features

- **Multiple saved events** — create, switch, and manage multiple events from the header
- **Named events** — give each event a custom title
- **Participants** — add or remove people (removal is blocked if they appear in an expense)
- **Expenses** — log each expense with a description, amount, payer, and the subset of participants sharing the cost
- **Balances** — real-time per-person balance showing net owed (+) or owing (−)
- **Spending summary** — visual breakdown of what each person paid vs. their consumed share
- **Two settlement modes** — choose between *Fewest payments* (optimized) and *Pay directly* (pairwise)
- **Configurable currency** — set any currency symbol/code
- **Shareable links** — generate a read-only event link and let recipients create an editable copy
- **Multilingual UI** — built-in language picker with 8 locales: `en`, `tr`, `pl`, `ru`, `de`, `fr`, `it`, `es`
- **Persistent state** — events and settings are saved in `localStorage` so nothing is lost on refresh
- **Reset tools** — clear current event data, delete a single saved event, or clear all events

## Tech Stack

| Layer | Library / Tool |
|-------|---------------|
| UI framework | [Vue 3](https://vuejs.org/) (Options API) |
| Build tool | [Vite 6](https://vitejs.dev/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| i18n | [vue-i18n](https://vue-i18n.intlify.dev/) |
| Share storage API | [Vercel Functions](https://vercel.com/docs/functions) + [@vercel/blob](https://vercel.com/docs/storage/vercel-blob) |

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview
```

## Usage

1. **Create or select an event** — use the **Saved events** button in the header to switch events or start a new one.
2. **Name your event** — click the pencil icon next to the title in the header.
3. **Add participants** — type a name and press **Add** or hit Enter.
4. **Record expenses** — click **Add Expense**, fill in the description, amount, who paid, and who shares the cost.
5. **Check balances and summary** — the right panel updates instantly (green means owed money, red means owes money).
6. **Settle up** — switch between **Fewest payments** and **Pay directly** to view settlement suggestions.
7. **Share read-only** — click **Share** to generate a link that others can view.
8. **Manage saved events** — delete one event from the saved list or clear all events from the event menu.
