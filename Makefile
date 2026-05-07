## Todo List — 단일 entry point
##
## `make help` 로 카탈로그를 본다. 모든 dev/build/lint/test/supabase 명령은
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

# Supabase CLI 가 config.toml 의 env() 보간을 해석하도록
# env/.env.local 을 자동 export 한 뒤 supabase 호출.
SB_ENV_FILE   := env/.env.local
SB_LOAD_ENV   := set -a; [ -f $(SB_ENV_FILE) ] && . $(SB_ENV_FILE) || true; set +a;

.PHONY: help doctor install clean \
	dev build lint test typecheck format \
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
		|| printf "  $(C_ERR)✗$(C_END) docker — Supabase CLI 가 docker 스택을 사용하므로 필요. Docker Desktop 설치: https://www.docker.com/products/docker-desktop\n"
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

dev: ## turbo dev (호스트, web/packages 동시 watch)
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

## ── Mobile (호스트) ───────────────────────────────────────────────────────

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
