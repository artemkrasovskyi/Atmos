FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/contracts/package.json packages/contracts/
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/

FROM base AS deps
RUN pnpm install --frozen-lockfile

# Development: source is bind-mounted by Compose; dependencies stay in the image.
FROM deps AS dev
COPY packages/contracts packages/contracts
COPY apps/api apps/api
CMD ["sh", "-c", "pnpm --filter @atmos/contracts build && (pnpm --filter @atmos/contracts dev &) && pnpm --filter @atmos/api build && (pnpm --filter @atmos/api exec tsc -p tsconfig.build.json --watch --preserveWatchOutput &) && cd apps/api && node --watch dist/main.js"]

FROM deps AS build
COPY packages/contracts packages/contracts
COPY apps/api apps/api
RUN pnpm --filter @atmos/api... build
RUN pnpm --filter @atmos/api deploy --prod /out

FROM node:24-alpine AS prod
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /out/ ./
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
