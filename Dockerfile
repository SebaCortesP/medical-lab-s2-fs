# Etapa 1: Build Angular
FROM node:20 AS builder

WORKDIR /app

# Copiar package.json para instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el resto del proyecto Angular (incluye src/, angular.json, etc.)
COPY . .

# Generar el build
RUN npm run build --prod

# Etapa 2: Servir con Nginx
FROM nginx:stable-alpine

# IMPORTANTE: copiar desde /app/dist/medical-lab (del builder) a Nginx
COPY --from=builder /app/dist/medical-lab/browser /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80