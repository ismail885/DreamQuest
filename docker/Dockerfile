# Dockerfile pour DreamQuest (Next.js)
# Projet CDA - permet de lancer l'application dans un conteneur

# Image de base : Node.js 22 (version legere alpine)
FROM node:22-alpine

# Dossier de travail dans le conteneur
WORKDIR /app

# On copie d'abord les fichiers de dependances
# (comme ca Docker garde en cache si elles ne changent pas)
COPY package.json package-lock.json ./

# Installation des dependances
RUN npm install

# On copie tout le reste du projet
COPY . .

# Variables Supabase necessaires pour le build
# (Next.js les integre dans le code du navigateur au moment du build)
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

# Build de l'application
RUN npm run build

# Le port 3000 est celui utilise par Next.js
EXPOSE 3000

# Commande pour demarrer l'application
CMD ["npm", "run", "start"]
