# Gestion Entreprises — Frontend React

Interface React connectée au backend NestJS. Zustand pour l'état, Tailwind CSS pour le style.

## Stack

- **React 19** + **TypeScript**
- **Zustand** — gestion d'état globale
- **Tailwind CSS v4** — styles utilitaires
- **React Router v7** — navigation
- **Lucide React** — icônes

## Démarrage

```bash
npm install
npm run dev
```

Accessible sur : **http://localhost:5173**

## Configuration

Fichier `.env` :

```env
VITE_API_URL=http://localhost:3000/api
```

## Comptes de test

Après avoir exécuté le seed du backend :

| Email             | Mot de passe |
| ----------------- | ------------ |
| admin@example.com | admin123     |

## Structure

```
src/
├── infrastructure/api/client.ts   ← Client HTTP central
├── store/
│   ├── authStore.ts               ← Auth (JWT persisté)
│   ├── clientStore.ts
│   ├── productStore.ts
│   ├── invoiceStore.ts
│   └── expenseStore.ts
├── domain/models/                 ← Types partagés
├── presentation/
│   ├── hooks/                     ← Hooks métier (Zustand)
│   ├── components/
│   │   ├── layouts/BaseLayout.tsx ← Sidebar Tailwind
│   │   ├── common/listDataGrid/   ← Tables Tailwind (pas de MUI)
│   │   └── ui/                    ← Button, Card, Input, Select
│   ├── pages/admin/               ← Dashboard, Clients, Factures, Stock, Dépenses
│   └── routes/AppRoutes.tsx       ← React Router
└── shared/constants/              ← Routes navigation
```
