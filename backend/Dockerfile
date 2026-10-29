FROM node:20-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.18.2 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
COPY prisma ./prisma
COPY prisma7.config.ts ./

RUN pnpm install --frozen-lockfile
RUN pnpm prisma generate

COPY tsconfig.json ./
COPY src ./src

RUN pnpm build

EXPOSE 8000

ENV PORT=8000
ENV NODE_ENV=production

CMD ["node", "dist/server.js"]
