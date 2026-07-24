# Stage 1: Build Stage
FROM node:20-alpine AS builder

WORKDIR /app
RUN apk add --no-cache libc6-compat python3 make g++
COPY package*.json ./
RUN npm install
COPY . .

# Build step (if your dashboard uses a frontend bundler like Vite/React/Vue)
# RUN npm run build

# Stage 2: Production Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs && \
    adduser -S personalhub -u 1001 -G nodejs && \
    mkdir -p /app/data && \
    chown -R personalhub:nodejs /app

COPY --from=builder --chown=personalhub:nodejs /app/node_modules ./node_modules
COPY --chown=personalhub:nodejs . .

USER personalhub

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

CMD ["node", "server.js"]