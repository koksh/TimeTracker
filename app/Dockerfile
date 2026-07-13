FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json tsconfig.json ./

RUN npm install

FROM base AS builder

WORKDIR /app
COPY . ./

RUN npm run build

FROM node:20-alpine AS runtime

WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

RUN npm install --omit=dev

EXPOSE 3000

CMD ["node", "dist/server.js"]
