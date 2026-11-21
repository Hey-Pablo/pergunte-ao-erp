FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package.json e instalar dependencias
COPY package.json package-lock.json tsconfig.json ./
RUN npm ci --ignore-scripts && npm cache clean --force

# Copiar codigo fonte
COPY src/ ./src/

# Compilar TypeScript
RUN npx tsc

# Stage de producao
FROM node:20-alpine AS production

WORKDIR /app

# Copiar dependencias e codigo compilado
COPY --from=builder /app/package.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/esquema ./src/esquema
COPY --from=builder /app/node_modules ./node_modules

# Criar usuario nao root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

USER nextjs

EXPOSE 3002

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]