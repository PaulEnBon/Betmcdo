# NuggetBet

Application web mobile-first de paris privés et fun entre amis (sans argent réel), avec une monnaie virtuelle: le Nugget.

## Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS v4
- lucide-react

## Lancer le projet

1. Installer les dépendances:
   - `npm install`
2. Démarrer en local:
   - `npm run dev`
3. Ouvrir:
   - `http://localhost:3000`

## Structure

- app/
  - globals.css
  - layout.tsx
  - page.tsx
- components/
  - add-bet-modal.tsx
  - app-header.tsx
  - bet-card.tsx
  - floating-add-button.tsx
- lib/
  - mock-data.ts
- types/
  - bet.ts
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- tsconfig.json
