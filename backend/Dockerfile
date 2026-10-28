# Imagem do backend (container moneyflow-api). Build: docker compose build api (na raiz).

# 1) compila o TypeScript
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build

# 2) imagem final: só JS compilado + dependências de produção
FROM node:24-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
# lido por dist/db/migrate.js na subida
COPY db ./db
USER node
EXPOSE 3334
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=5 \
  CMD wget -qO- http://127.0.0.1:3334/api/health || exit 1
CMD ["node", "dist/server.js"]
