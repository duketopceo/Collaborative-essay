FROM node:20-alpine AS builder
WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci
RUN npx prisma generate

COPY . .

# Set demo mode to disable AI endpoints
ENV DEMO_MODE=true
ENV NODE_ENV=production
ENV NEXTAUTH_SECRET=demo-secret-key
ENV DATABASE_URL=postgresql://postgres:postgres@db:5432/collaborative_essay

RUN npm run build

# Runtime
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache openssl
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

ENV PORT=3050
ENV HOSTNAME=0.0.0.0
EXPOSE 3050
CMD ["node", "server.js"]
