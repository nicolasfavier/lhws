# Déploiement Cloudflare — étapes à faire

## Vue d'ensemble

| Composant | Plateforme |
|---|---|
| Frontend (React) | Cloudflare Pages |
| Backend API (Hono/oRPC) | Cloudflare Workers |
| Base de données | Neon (PostgreSQL serverless) |

---

## 1. Base de données — Neon

1. Créer un compte sur https://neon.tech (free tier)
2. Créer un nouveau projet, nommer la base `lhws`
3. Copier la **Connection string** (format `postgresql://user:pass@ep-xxx.neon.tech/lhws?sslmode=require`)
4. Lancer les migrations et le seed depuis ta machine locale :
   ```bash
   cd apps/server
   DATABASE_URL="postgresql://neondb_owner:npg_DNPvuARTa5M4@ep-misty-field-ab7m4j9s.eu-west-2.aws.neon.tech/neondb?sslmode=require" bun db:migrate
   DATABASE_URL="postgresql://neondb_owner:npg_DNPvuARTa5M4@ep-misty-field-ab7m4j9s.eu-west-2.aws.neon.tech/neondb?sslmode=require" bun db:seed
   ```

---

## 2. Backend — Cloudflare Workers

### Config locale (développement)

Copier les fichiers sample :
```bash
cp apps/server/.env.sample apps/server/.env
cp apps/server/.dev.vars.sample apps/server/.dev.vars
```
Remplir `DATABASE_URL` et `CORS_ORIGIN` dans les deux fichiers avec les vraies valeurs.

- `apps/server/.env` → utilisé par `bun dev`
- `apps/server/.dev.vars` → utilisé par `wrangler dev`

### Connexion à Cloudflare
```bash
cd apps/server
bunx wrangler login
```

### Secret DATABASE_URL (production)
```bash
cd apps/server
bunx wrangler secret put DATABASE_URL
# → coller la connection string Neon quand demandé
```

### CORS_ORIGIN (production)
Après avoir déployé le frontend (étape 3), mettre à jour `apps/server/wrangler.toml` :
```toml
[vars]
CORS_ORIGIN = "https://lhws.pages.dev"   # ton URL Cloudflare Pages
```

### Déployer le Worker
```bash
cd apps/server
bunx wrangler deploy
```
→ Note l'URL obtenue, ex. `https://lhws-server.<ton-subdomain>.workers.dev`

---

## 3. Frontend — Cloudflare Pages

### Config locale
```bash
cp apps/web/.env.sample apps/web/.env
```
Remplir `VITE_SERVER_URL` avec l'URL du Worker obtenue à l'étape 2.

### Déploiement via le dashboard

1. Aller sur https://dash.cloudflare.com → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. Sélectionner le repo `lhws`
3. Paramètres de build :

   | Champ | Valeur |
   |---|---|
   | Build command | `npx turbo build --filter=web` |
   | Build output directory | `apps/web/dist` |
   | Root directory | `/` |

4. Variables d'environnement **(avant le premier build)** :

   | Variable | Valeur |
   |---|---|
   | `VITE_SERVER_URL` | URL du Worker (ex. `https://lhws-server.<subdomain>.workers.dev`) |

5. Cliquer **Save and Deploy**

---

## 4. Après les deux déploiements

Une fois que tu as les deux URLs, mettre à jour `CORS_ORIGIN` dans `wrangler.toml` et redéployer :
```bash
cd apps/server
bunx wrangler deploy
```

---

## Résumé des commandes dans l'ordre

```bash
# 1. Installer les dépendances
bun install
cd apps/server && bun db:generate   # régénérer le client Prisma

# 2. Migrations DB (avec ta DATABASE_URL Neon)
DATABASE_URL="postgresql://..." bun db:migrate
DATABASE_URL="postgresql://..." bun db:seed

# 3. Login Cloudflare
bunx wrangler login

# 4. Secret DB
bunx wrangler secret put DATABASE_URL

# 5. Déployer le Worker (après avoir mis à jour wrangler.toml si besoin)
bunx wrangler deploy
# → URL du Worker : https://lhws-server.lhws.workers.dev

# 6. Configurer Cloudflare Pages via le dashboard (voir étape 3)
#    avec VITE_SERVER_URL = URL du Worker

# 7. Mettre à jour CORS_ORIGIN dans wrangler.toml puis redéployer
bunx wrangler deploy
```
