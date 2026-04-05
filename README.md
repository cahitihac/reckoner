# Reckoner

A lightweight group expense splitter built with Vue 3, Vite, and Tailwind CSS. Track shared costs for trips, dinners, or any event and instantly see who owes whom.

## Features

- **Named events** — give your expense group a custom title
- **Participants** — add or remove people (removal is blocked if they appear in an expense)
- **Expenses** — log each expense with a description, amount, payer, and the subset of participants sharing the cost
- **Balances** — real-time per-person balance showing net owed (+) or owing (−)
- **Spending summary** — visual breakdown of what each person paid vs. their consumed share
- **Configurable currency** — set any currency symbol/code
- **Persistent state** — data is saved in `localStorage` so nothing is lost on page refresh
- **Reset** — clear everything with a single button

## Tech Stack

| Layer | Library / Tool |
|-------|---------------|
| UI framework | [Vue 3](https://vuejs.org/) (Composition API) |
| Build tool | [Vite 6](https://vitejs.dev/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |

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

1. **Name your event** — click the pencil icon next to the title in the header.
2. **Add participants** — type a name and press **Add** or hit Enter.
3. **Record expenses** — click **Add Expense**, fill in the description, amount, who paid, and who shares the cost.
4. **Check balances** — the right panel updates instantly; green means owed money, red means owes money.
5. **Settle up** — use the settlement suggestions to arrange the minimum number of transfers.
6. **Reset** — use the trash icon in the header to start fresh.
