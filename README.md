# BizFlow — Application de Gestion PME

Application complète de gestion pour petites entreprises : facturation, stock, clients, dépenses et tableau de bord.

## Stack Technique

| Couche          | Technologie                          |
| --------------- | ------------------------------------ |
| Frontend        | React 18 + TypeScript + Tailwind CSS |
| Backend         | NestJS + TypeScript                  |
| Base de données | PostgreSQL + TypeORM                 |
| Auth            | JWT (access + refresh tokens)        |
| Validation      | class-validator + class-transformer  |
| API             | REST avec Swagger auto-généré        |

## Structure du projet

```
bizflow/
├── frontend/          # React + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/   # Composants réutilisables
│   │   ├── pages/        # Pages principales
│   │   ├── store/        # Zustand (state management)
│   │   ├── hooks/        # Hooks personnalisés
│   │   ├── types/        # Types TypeScript partagés
│   │   └── utils/        # Utilitaires (formatage, calculs)
│   └── package.json
│
└── backend/           # NestJS + TypeScript
    ├── src/
    │   ├── modules/      # Modules métier (factures, stock, clients…)
    │   ├── common/       # Guards, décorateurs, filtres
    │   └── config/       # Configuration (DB, JWT, CORS)
    └── package.json
```

## Démarrage rapide

### Prérequis

- Node.js ≥ 18
- PostgreSQL ≥ 14
- pnpm (recommandé) ou npm

### 1. Backend

```bash
cd backend
cp .env.example .env          # Configurer DB_HOST, JWT_SECRET, etc.
pnpm install
pnpm run migration:run
pnpm run start:dev            # http://localhost:3000
# Swagger: http://localhost:3000/api
```

### 2. Frontend

```bash
cd frontend
pnpm install
pnpm run dev                  # http://localhost:5173
```

## Modules fonctionnels

### 📊 Tableau de bord

- KPIs en temps réel : chiffre d'affaires, dépenses, bénéfice net
- Graphique CA mensuel (12 mois glissants)
- Top 5 clients, factures récentes, alertes stock bas

### 🧾 Facturation

- Création, édition, duplication de factures
- Statuts : Brouillon → Envoyée → Payée → Annulée
- Calcul automatique HT/TVA/TTC
- Export PDF (jsPDF)
- Numérotation automatique (FAC-2024-001)

### 📦 Gestion des stocks

- Catalogue produits avec prix d'achat/vente
- Mouvements : entrée, sortie, ajustement, retour
- Alertes stock minimum configurables
- Historique des mouvements
- Valorisation du stock

### 👥 Gestion des clients

- Fiche client complète (contact, adresse, SIRET)
- Historique des factures par client
- Solde et encours
- Segmentation (particulier / professionnel)

### 💸 Dépenses

- Saisie avec catégories personnalisables
- Pièces jointes (reçus)
- Rapports par catégorie et période
- TVA récupérable

## Variables d'environnement

### Backend (.env)

```env
# Base de données
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=secret
DB_NAME=bizflow

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

# App
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000
```
