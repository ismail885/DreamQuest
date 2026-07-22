# Stage 1 : Build — installation des dépendances + compilation
FROM node:22-alpine AS builder

WORKDIR /app

# Copie des fichiers de dépendances (caché par Docker tant que package.json ne change pas)
COPY package.json package-lock.json ./
RUN npm ci

# Copie du code source
COPY . .

# Variables Supabase nécessaires au build Next.js
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

RUN npm run build

# Stage 2 : Production — image minimale pour servir l'app
FROM node:22-alpine

WORKDIR /app

# Copie des artefacts de build (pas besoin du code source ni des dépendances dev)
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/next.config.ts ./next.config.ts

# Installation des seules dépendances de production
RUN npm ci --omit=dev && npm cache clean --force

EXPOSE 3000

CMD ["npm", "run", "start"]
