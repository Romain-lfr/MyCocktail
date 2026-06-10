# 🍹 MyCocktail

My Cocktail est une application web spécialisée dans la création et l'exploration de cocktails.

---

## Description

MyCocktail permet aux utilisateurs de découvrir, créer et partager des recettes de cocktails et mocktails. 

Elle donne aux utilisateurs la faculté d'examiner un vaste choix de cocktails grâce à des filtres ou des tris, facilitant ainsi la découverte de nouvelles recettes.

My Cocktail possède une fonction principale qui propose des recettes de cocktails basées sur les ingrédients disponibles : l'usager spécifie les ingrédients dont il dispose, et l'application lui propose automatiquement les cocktails qu'il peut concocter avec ce qu'il a à disposition. Cela aide à minimiser le gaspillage tout en explorant de nouvelles recettes.

Nous visons à rendre la découverte des cocktails plus simple et sur mesure, que vous soyez un novice ou un passionné plus aguerri.

---

## Stack technique

| Couche | Technologie |
|---|---|
| Front-end | React + TypeScript + Vite |
| Back-end | NestJS + TypeScript |
| Base de données | PostgreSQL |
| ORM | Prisma |
| Auth | JWT |
| Images | Sharp (conversion WebP) |

---

## Installation

### Prérequis

- Node.js v20+
- PostgreSQL
- npm

### 1. Cloner le projet

```bash
git clone https://github.com/tonuser/mycocktail.git
cd mycocktail
```

### 2. Base de données

Exécute les scripts SQL dans cet ordre dans PostgreSQL :

```bash
# Créer le schéma et les tables
psql -U postgres -d mycocktail -f creadb.sql

# Peupler la base avec les données initiales
psql -U postgres -d mycocktail -f peupdb.sql
```

### 3. Back-end

```bash
cd back
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Modifier DATABASE_URL dans .env

# Synchroniser Prisma
npx prisma db pull
npx prisma generate

# Lancer le serveur
npm run start:dev
```

Le serveur démarre sur `http://localhost:3000`

### 4. Front-end

```bash
cd front
npm install
npm run dev
```

L'application démarre sur `http://localhost:5173`

---

## Variables d'environnement

Créer un fichier `.env` dans le dossier `back/` :

```env
DATABASE_URL="postgresql://postgres:motdepasse@localhost:5432/mycocktail?schema=mycocktail"
```

---

## Comptes par défaut

| Pseudo | Email | Mot de passe | Rôle |
|---|---|---|---|
| romain | romain@mycocktail.com | Romain1234 | User (majeur) |
| test | test@mycocktail.com | Test1234 | User (mineur) |

---