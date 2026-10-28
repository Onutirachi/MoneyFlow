# Imagem do frontend (container moneyflow-web). Build: docker compose build web (na raiz).

# 1) gera os arquivos estáticos (dist/)
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2) nginx serve o dist/ e repassa /api ao container da API
FROM nginx:1.29-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
