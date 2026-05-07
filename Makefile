## Todo List — 단일 entry point
##
## `make help` 로 카탈로그를 본다. 모든 dev/build/lint/test/supabase/docker 명령은
## 본 Makefile 을 거친다. 호스트에 도구가 부재하면 `make doctor` 가 안내한다.

SHELL := /usr/bin/env bash
.SHELLFLAGS := -eu -o pipefail -c
.DEFAULT_GOAL := help

# 색상 (TTY 일 때만)
ifneq (,$(findstring xterm,${TERM}))
	C_BOLD := \033[1m
	C_DIM  := \033[2m
	C_OK   := \033[32m
	C_WARN := \033[33m
	C_ERR  := \033[31m
	C_END  := \033[0m
else
	C_BOLD :=
	C_DIM  :=
	C_OK   :=
	C_WARN :=
	C_ERR  :=
	C_END  :=
endif

WEB_FILTER    := --filter @todo-list/web
MOBILE_FILTER := --filter @todo-list/mobile
COMPOSE       := docker compose -f scripts/docker-compose.yml --project-directory .

# Supabase CLI 가 config.toml 의 env() 보간을 해석하도록
# env/.env.local 을 자동 export 한 뒤 supabase 호출.
SB_ENV_FILE   := env/.env.local
SB_LOAD_ENV   := set -a; [ -f $(SB_ENV_FILE) ] && . $(SB_ENV_FILE) || true; set +a;

.PHONY: help doctor install clean \
	dev build lint test typecheck format \
	up down restart ps logs \
	web-up web-down web-logs web-shell web-build web-restart \
	mobile-dev mobile-ios mobile-android mobile-build \
	sb-start sb-stop sb-reset sb-status sb-gen-types sb-link sb-push \
	migrate

# ── 메타 ────────────────────────────────────────────────────────────────────

help: ## 본 카탈로그 출력
	@printf "$(C_BOLD)Todo List — Makefile targets$(C_END)\n"
	@printf "$(C_DIM)사용법: make <target>$(C_END)\n\n"
	@awk 'BEGIN {FS = ":.*?## "} \
		/^## ── / {printf "\n$(C_BOLD)%s$(C_END)\n", substr($$0, 7); next} \
		/^[a-zA-Z0-9_-]+:.*?## / {printf "  $(C_OK)%-22s$(C_END) %s\n", $$1, $$2}' \
		$(MAKEFILE_LIST)
	@printf "\n"

doctor: ## docker / pnpm / supabase / node 4 종 PATH 검증
	@printf "$(C_BOLD)환경 검증$(C_END)\n"
	@command -v docker  >/dev/null 2>&1 && printf "  $(C_OK)✓$(C_END) docker $$(docker --version)\n" \
		|| printf "  $(C_ERR)✗$(C_END) docker — Docker Desktop 설치: https://www.docker.com/products/docker-desktop\n"
	@command -v pnpm    >/dev/null 2>&1 && printf "  $(C_OK)✓$(C_END) pnpm $$(pnpm --version)\n" \
		|| printf "  $(C_ERR)✗$(C_END) pnpm — corepack enable && corepack prepare pnpm@9.15.0 --activate\n"
	@command -v supabase >/dev/null 2>&1 && printf "  $(C_OK)✓$(C_END) supabase $$(supabase --version)\n" \
		|| printf "  $(C_ERR)✗$(C_END) supabase — brew install supabase/tap/supabase\n"
	@command -v node    >/dev/null 2>&1 && printf "  $(C_OK)✓$(C_END) node $$(node --version)\n" \
		|| printf "  $(C_ERR)✗$(C_END) node — .nvmrc(22.17.1) 기준 nvm/asdf/volta 등으로 설치\n"

## ── 의존성 / 빌드 ─────────────────────────────────────────────────────────

install: ## 호스트에서 pnpm install
	@pnpm install

clean: ## turbo clean + node_modules 정리
	@pnpm turbo run clean || true
	@find . -type d -name node_modules -not -path '*/\.*' -prune -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name .turbo -prune -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name .next -prune -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name dist -not -path '*/node_modules/*' -prune -exec rm -rf {} + 2>/dev/null || true

dev: ## turbo dev (호스트, 컨테이너 미사용)
	@pnpm turbo run dev

build: ## turbo build (web 정적 export 등)
	@pnpm turbo run build

lint: ## turbo lint
	@pnpm turbo run lint

test: ## turbo test
	@pnpm turbo run test

typecheck: ## turbo typecheck (있는 경우만)
	@pnpm turbo run typecheck || pnpm -r exec tsc --noEmit

format: ## prettier --write
	@pnpm format

## ── 통합 (supabase + web container) ───────────────────────────────────────

up: ## supabase start + docker compose up -d web (전체 dev 환경 기동)
	@printf "$(C_BOLD)→ Supabase 기동$(C_END)\n"
	@$(SB_LOAD_ENV) supabase start
	@printf "$(C_BOLD)→ Web 컨테이너 기동$(C_END)\n"
	@$(COMPOSE) up -d web
	@printf "\n$(C_OK)✓ 완료$(C_END) — Web: http://localhost:3000  Supabase Studio: http://localhost:54323\n"

down: ## docker compose down + supabase stop
	@$(COMPOSE) down
	@$(SB_LOAD_ENV) supabase stop || true

restart: down up ## up 재실행

ps: ## 컨테이너 상태
	@$(COMPOSE) ps
	@supabase status || true

logs: ## web container log tail (Ctrl-C 로 종료)
	@$(COMPOSE) logs -f web

## ── Web 컨테이너 개별 제어 ────────────────────────────────────────────────

web-up: ## web 컨테이너만 기동
	@$(COMPOSE) up -d web
	@printf "$(C_OK)✓$(C_END) http://localhost:3000\n"

web-down: ## web 컨테이너만 중지
	@$(COMPOSE) stop web
	@$(COMPOSE) rm -f web

web-logs: ## web 컨테이너 log tail
	@$(COMPOSE) logs -f web

web-shell: ## web 컨테이너 안 sh 진입
	@$(COMPOSE) exec web sh

web-build: ## web 이미지 강제 rebuild (lockfile 변경 후 등)
	@$(COMPOSE) build --no-cache web

web-restart: ## web 컨테이너 재기동
	@$(COMPOSE) restart web

## ── Mobile (호스트, 컨테이너 미사용) ──────────────────────────────────────

mobile-dev: ## Expo dev server (호스트)
	@pnpm $(MOBILE_FILTER) dev

mobile-ios: ## iOS 시뮬레이터
	@pnpm $(MOBILE_FILTER) ios

mobile-android: ## Android 에뮬레이터
	@pnpm $(MOBILE_FILTER) android

mobile-build: ## EAS Build 안내
	@printf "$(C_WARN)i$(C_END) 프로덕션 빌드는 eas build 사용. 예: eas build --platform ios\n"

## ── Supabase CLI wrap ─────────────────────────────────────────────────────

sb-start: ## supabase start (env/.env.local 자동 로드)
	@$(SB_LOAD_ENV) supabase start

sb-stop: ## supabase stop
	@$(SB_LOAD_ENV) supabase stop

sb-reset: ## supabase db reset (마이그레이션 재적용)
	@$(SB_LOAD_ENV) supabase db reset

sb-status: ## supabase status (URL/key 등)
	@$(SB_LOAD_ENV) supabase status

sb-gen-types: ## supabase gen types → packages/shared/src/database.ts
	@$(SB_LOAD_ENV) supabase gen types typescript --local > packages/shared/src/database.ts
	@printf "$(C_OK)✓$(C_END) packages/shared/src/database.ts 갱신\n"

sb-link: ## supabase link --project-ref REF=<your-ref>
	@if [ -z "$(REF)" ]; then \
		printf "$(C_ERR)✗$(C_END) REF 인자 필요. 예: make sb-link REF=abcdefghijklmnop\n"; exit 1; \
	fi
	@supabase link --project-ref $(REF)

sb-push: ## supabase db push (원격에 마이그레이션 반영)
	@supabase db push

migrate: sb-reset ## sb-reset alias
