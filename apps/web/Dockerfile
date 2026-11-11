FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/contracts/package.json packages/contracts/
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/

FROM base AS deps
RUN pnpm install --frozen-lockfile

# Development: Vite dev server with HMR; source is bind-mounted by Compose.
FROM deps AS dev
COPY packages/contracts packages/contracts
COPY apps/web apps/web
EXPOSE 5173
CMD ["sh", "-c", "pnpm --filter @atmos/contracts build && (pnpm --filter @atmos/contracts dev &) && pnpm --filter @atmos/web dev"]

FROM deps AS build
COPY packages/contracts packages/contracts
COPY apps/web apps/web
RUN pnpm --filter @atmos/web... build

# Production: Nginx serves the static build, falls back to index.html, proxies /api/*.
FROM nginx:1.28-alpine AS prod
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
