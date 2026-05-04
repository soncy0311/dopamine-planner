# Web (Next.js 15) dev container — alpine + pnpm@9.15.0 + node 22.17.1
# 본 이미지는 dev 전용. 프로덕션은 Vercel 직접 배포.

FROM node:22.17.1-alpine

# pnpm 정확 버전 매칭 (root package.json 의 packageManager 와 일치)
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# 빌드 도구 (lightningcss / esbuild native bin 의존 — alpine 호환 위해 설치)
RUN apk add --no-cache libc6-compat git bash

WORKDIR /workspace

# lockfile / workspace 메타파일만 먼저 copy 해서 install layer 캐시 활용
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json .npmrc* ./
COPY apps/web/package.json        apps/web/package.json
COPY apps/mobile/package.json     apps/mobile/package.json
COPY packages/core/package.json   packages/core/package.json
COPY packages/ui/package.json     packages/ui/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/config/package.json packages/config/package.json

RUN pnpm install --frozen-lockfile

# 런타임에는 docker-compose.yml 의 bind mount 가 / workspace 를 호스트 소스로 덮어씀.
# (node_modules 는 anonymous volume 으로 마스킹되어 본 layer 의 결과가 살아남음)

EXPOSE 3000

CMD ["pnpm", "--filter", "@todo-list/web", "dev"]
