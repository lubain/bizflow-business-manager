# Gestion Entreprises — Backend NestJS

API REST — facturation, stock, clients, dépenses.
Auth JWT via entité `Admin` (sans module `users`).

## Stack

- **NestJS** + TypeScript · **PostgreSQL** / TypeORM · **JWT** + Passport
- **Helmet** (sécurité) · **Compression** gzip · **Throttling** (100 req/min)
- **Swagger** `/api/docs` · **Health check** `/api/health`

---

## Démarrage local

```bash
npm install

# Copier et adapter le fichier d'environnement
cp .env.example .env

# Lancer PostgreSQL via Docker
docker-compose up -d

# Démarrer en mode dev (hot reload)
npm run start:dev

# Charger les données de démo (admin@example.com / admin123)
npm run seed
```

Swagger : http://localhost:3000/api/docs

---

## Variables d'environnement

| Variable          | Dev                     | Prod          | Description              |
| ----------------- | ----------------------- | ------------- | ------------------------ |
| `NODE_ENV`        | `development`           | `production`  | Environnement            |
| `DATABASE_URL`    | `postgresql://...`      | URL Supabase  | Connexion DB             |
| `DB_HOST`         | `localhost`             | —             | (si pas de DATABASE_URL) |
| `DB_PORT`         | `5432`                  | —             |                          |
| `DB_USERNAME`     | `postgres`              | —             |                          |
| `DB_PASSWORD`     | `postgres`              | —             |                          |
| `DB_NAME`         | `gestion_entreprises`   | —             |                          |
| `JWT_SECRET`      | local-secret            | Secret long   | Clé de signature JWT     |
| `JWT_EXPIRES_IN`  | `7d`                    | `7d`          | Durée token              |
| `CORS_ORIGIN`     | `http://localhost:5173` | URL Vercel    | Origines autorisées      |
| `PORT`            | `3000`                  | auto (Render) | Port d'écoute            |
| `SWAGGER_ENABLED` | `true`                  | `true`        | Activer Swagger en prod  |

---

## Migrations (production)

En production `synchronize` est désactivé. Utiliser les migrations :

```bash
# Générer une migration depuis les entités
npm run migration:generate -- src/database/migrations/NomMigration

# Appliquer toutes les migrations
npm run migration:run

# Annuler la dernière migration
npm run migration:revert
```

La migration initiale `InitSchema` crée toutes les tables depuis zéro.

---

## Déploiement Production

### 1. Supabase — Base de données

1. Créer un projet sur [supabase.com](https://supabase.com)
2. **Settings → Database → Connection string → URI (mode Transaction)**
3. Copier l'URL : `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`
4. En développement local, pointer `DATABASE_URL` vers Supabase pour appliquer les migrations :

```bash
DATABASE_URL="postgresql://..." npm run migration:run
DATABASE_URL="postgresql://..." npm run seed
```

---

### 2. Render — Backend

1. Créer un compte sur [render.com](https://render.com)
2. **New → Web Service → Connect GitHub**
3. Paramètres :
   - **Build** : `npm ci && npm run build`
   - **Start** : `npm run start:prod`
   - **Health Check** : `/api/health`
4. Ajouter les variables d'environnement :

| Variable          | Valeur                              |
| ----------------- | ----------------------------------- |
| `NODE_ENV`        | `production`                        |
| `DATABASE_URL`    | URL Supabase (URI mode Transaction) |
| `JWT_SECRET`      | Chaîne aléatoire ≥ 64 chars         |
| `CORS_ORIGIN`     | `https://votre-app.vercel.app`      |
| `SWAGGER_ENABLED` | `true`                              |

5. Récupérer l'URL du service (ex: `https://gestion-entreprises-api.onrender.com`)

> ⚠️ Le plan **Free** de Render met le service en veille après 15 min d'inactivité.
> Le premier appel peut prendre 30–60 secondes.
> Utiliser le plan **Starter** ($7/mois) pour éviter ça.

---

### 3. Vercel — Frontend

1. Créer un compte sur [vercel.com](https://vercel.com)
2. **New Project → Import GitHub** (dossier frontend)
3. **Environment Variables** :

| Variable       | Valeur                                             |
| -------------- | -------------------------------------------------- |
| `VITE_API_URL` | `https://gestion-entreprises-api.onrender.com/api` |

4. Framework preset : **Vite**
5. Le fichier `vercel.json` gère les redirections SPA automatiquement

---

## Structure des modules

```
src/
├── config/
│   ├── database.config.ts          # Config DB (url + fallback host)
│   ├── jwt.config.ts               # Config JWT
│   └── typeorm-migration.config.ts # DataSource CLI migrations
├── common/
│   ├── filters/all-exceptions.filter.ts
│   ├── guards/jwt-auth.guard.ts
│   └── interceptors/transform.interceptor.ts
├── database/
│   ├── seed.ts                     # Données de démo
│   └── migrations/
│       └── 1700000000000-InitSchema.ts
└── modules/
    ├── auth/                       # Login, Register, JWT, Admin entity
    ├── clients/                    # CRUD clients
    ├── products/                   # CRUD + ajustement stock
    ├── invoices/                   # CRUD + mark-as-paid + items
    ├── expenses/                   # CRUD dépenses
    ├── dashboard/                  # Stats globales
    └── health/                     # /api/health (Terminus)
```

---

## Endpoints

| Méthode          | Route                                | Auth | Description                   |
| ---------------- | ------------------------------------ | ---- | ----------------------------- |
| POST             | `/api/auth/login`                    | ❌   | Connexion → JWT               |
| POST             | `/api/auth/register`                 | ❌   | Créer un admin                |
| GET              | `/api/auth/me`                       | ✅   | Profil connecté               |
| PATCH            | `/api/auth/change-password`          | ✅   | Modifier MDP                  |
| GET              | `/api/dashboard`                     | ✅   | Stats globales                |
| GET              | `/api/dashboard/revenue-vs-expenses` | ✅   | Évolution mensuelle           |
| GET/POST         | `/api/clients`                       | ✅   | Liste / Créer                 |
| GET/PATCH/DELETE | `/api/clients/:id`                   | ✅   | Détail / Modifier / Supprimer |
| GET/POST         | `/api/products`                      | ✅   | Liste / Créer                 |
| GET              | `/api/products/low-stock`            | ✅   | Produits en stock faible      |
| PATCH            | `/api/products/:id/stock`            | ✅   | Ajuster stock (+/-)           |
| GET/POST         | `/api/invoices`                      | ✅   | Liste / Créer                 |
| PATCH            | `/api/invoices/:id/mark-as-paid`     | ✅   | Marquer payée                 |
| GET/POST         | `/api/expenses`                      | ✅   | Liste / Créer                 |
| GET              | `/api/expenses/by-category`          | ✅   | Totaux par catégorie          |
| GET              | `/api/health`                        | ❌   | Santé API + DB                |
