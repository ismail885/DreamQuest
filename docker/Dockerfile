FROM node:22-alpine

# Dossier de travail dans le conteneur
WORKDIR /app

# On copie d'abord les fichiers de dependances
COPY package.json package-lock.json ./

# Installation des dependances
RUN npm install

# On copie tout le reste du projet
COPY . .

# Variables Supabase necessaires pour le build
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
