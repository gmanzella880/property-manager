FROM node:20-slim AS deps
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl

COPY package.json package-lock.json ./
COPY prisma ./prisma

RUN npm ci

FROM node:20-slim AS builder
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]