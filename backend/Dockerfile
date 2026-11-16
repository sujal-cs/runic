# syntax=docker/dockerfile:1

# Multi-stage build for the Runic backend. Two final targets are produced from
# the same source:
#   --target api     the Express API (never executes submitted code)
#   --target worker  the judge worker (talks to Docker, runs untrusted code)
#
#   docker build -f backend/Dockerfile --target api    -t runic-api    .
#   docker build -f backend/Dockerfile --target worker -t runic-worker .

FROM node:22-alpine AS deps
WORKDIR /repo
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
RUN npm ci

FROM deps AS build
COPY backend ./backend
RUN npm run build -w backend

FROM node:22-alpine AS runtime-base
WORKDIR /repo
ENV NODE_ENV=production
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=build /repo/backend/dist ./backend/dist
COPY --from=build /repo/backend/package.json ./backend/package.json
WORKDIR /repo/backend

FROM runtime-base AS api
USER node
EXPOSE 4000
CMD ["node", "dist/index.js"]

# The worker needs the Docker CLI to ask the daemon for execution containers.
# It never runs submitted code itself, so only the socket is shared with it.
FROM runtime-base AS worker
RUN apk add --no-cache docker-cli
CMD ["node", "dist/worker/index.js"]
