FROM node:20-bullseye-slim AS base

WORKDIR /app

COPY package*.json tsconfig.json ./

RUN npm install

FROM base AS builder

WORKDIR /app
COPY . ./

RUN npm run build

FROM node:20-bullseye-slim AS runtime

WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

RUN apt-get update && apt-get install -y libssl1.1 && rm -rf /var/lib/apt/lists/*
RUN npm install --omit=dev

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node dist/server.js"]
