# TASK-06-09: 빌드·린트·수동 시각 검증 (sub-prd-06 종료 게이트)

## 기본 정보

- **Sub-PRD**: [`../sub-prd-06-feat-web-prototype-visual-alignment.md`](../sub-prd-06-feat-web-prototype-visual-alignment.md)
- **작업 번호**: 09
- **상태**: 미착수
- **의존성**: TASK-06-01 ~ 08 모두 완료

## 작업 목표

sub-prd-06 의 자동·수동 검증 기준을 통과하는지 확인하는 종료 게이트 task. 코드 변경 0건. 검증 활동만 수행한다. 본 task 통과 시 sub-prd-06 PR 머지 가능.

## 상세 구현 내용

### 대상 파일

(코드 변경 0건)

### 자동 검증

```bash
make lint        # 모든 패키지 lint 통과
make build       # turbo build 통과 (next/font/local 번들 성공 포함)
make test        # 단위 테스트 통과 (TASK-06-08 산출물 포함)
```

### 수동 검증 — 데스크탑 (`md:` 이상)

- [ ] **사이드바**: 로고 + 그룹 헤더 + 메뉴 아이콘 + 분리선 prototype 정합
- [ ] **chip 필터**: 메인 뷰 상단 노출, "전체" 초기 활성, 클릭 시 todos 클라이언트 필터링
- [ ] **DateNavigator**: 헤더 클릭 → 월간 그리드 펼침, chevron 회전, Esc 닫힘, prev/next 의미 단위 (주/월) 동작
- [ ] **카드 메타**: 일반 카드에 priority 3색 badge + carry-over `+N` 뱃지 prototype 정합
- [ ] **섹션 헤더**: 완료 섹션 50% opacity, 진행 중 섹션 활성 톤
- [ ] **CreateTodoModal**: priority 3 badge radiogroup + 분류 combobox 자동완성 동작
- [ ] **TodoDetailModal**: 동일 정합
- [ ] **FAB**: 데스크탑에서도 우측 하단 fixed 노출 (`md:hidden` 제거 확인)

### 수동 검증 — 모바일 (`<md:`)

- [ ] **MobileTabBar 동작 유지** (regression 0)
- [ ] **chip 필터 가로 스크롤** 정상
- [ ] **FAB / TabBar 위치 충돌 없음**

### 수동 검증 — 폰트·접근성

- [ ] 브라우저 DevTools Computed `font-family` 첫 항목이 `Pretendard Variable`
- [ ] `apps/web/public/fonts/LICENSE` 동봉 확인
- [ ] **키보드 only** 로 모든 인터랙션 가능 (chip / 토글 / 모달 priority / 모달 combobox)
- [ ] **Lighthouse Accessibility ≥ 95** (Chrome DevTools Lighthouse 데스크탑 시뮬레이션)

### 회귀 검증

- [ ] todo CRUD (create/toggle/edit/delete) 정상 동작
- [ ] 카테고리 / Epic 관리 화면 정상 동작
- [ ] 로그인 / 로그아웃 정상 동작
- [ ] 워크스페이스 전환 (Life ↔ Work) 정상 동작

## 검증 과정

- [ ] 자동 검증 3개 (lint / build / test) 모두 PASS
- [ ] 수동 검증 데스크탑 8개 항목 PASS (스크린샷 첨부 권장)
- [ ] 수동 검증 모바일 3개 항목 PASS
- [ ] 폰트·접근성 4개 항목 PASS
- [ ] 회귀 검증 4개 항목 PASS
- [ ] sub-prd-06 의 §검증 기준 §수동 9개 항목 모두 PASS
- [ ] PR 본문에 검증 결과 체크리스트 첨부

## 주의사항

1. **Lighthouse 측정 환경 일관성** — Incognito + 확장 프로그램 비활성 + Throttling: Simulated Slow 4G + DPR 1. 측정 환경 변수 통제.
2. **수동 회귀 누락 주의** — 코드 변경이 큰 sub 이므로 todo CRUD / 워크스페이스 전환 등 핵심 플로우를 한 번씩 직접 클릭해 확인.
3. **모바일 검증 환경** — Chrome DevTools Device Toolbar (iPhone 12 등) 또는 실기기. Expo 앱이 아닌 web 모바일 뷰포트 검증.
4. **자동 검증 실패 시 우회 금지** — `make lint` / `make build` / `make test` 중 하나라도 실패 시 해당 task 로 롤백 후 수정. `--no-verify` 등 우회 절대 금지.
5. **PR 머지 게이트** — 본 task 통과 = sub-prd-06 종료. PR 머지 후 main PRD 의 sub-prd-06 진행 상태를 "완료" 로 갱신.

## 관련 문서

- [`../main-prd-todo-list-initialize.md`](../main-prd-todo-list-initialize.md)
- [`../sub-prd-06-feat-web-prototype-visual-alignment.md`](../sub-prd-06-feat-web-prototype-visual-alignment.md) §검증 기준
- [`./tasks-06-01-setup-design-tokens-and-pretendard.md`](./tasks-06-01-setup-design-tokens-and-pretendard.md)
- [`./tasks-06-02-revamp-sidenav.md`](./tasks-06-02-revamp-sidenav.md)
- [`./tasks-06-03-extend-date-navigator-monthly.md`](./tasks-06-03-extend-date-navigator-monthly.md)
- [`./tasks-06-04-extend-todo-item-meta.md`](./tasks-06-04-extend-todo-item-meta.md)
- [`./tasks-06-05-create-category-filter-chips.md`](./tasks-06-05-create-category-filter-chips.md)
- [`./tasks-06-06-create-combobox-component.md`](./tasks-06-06-create-combobox-component.md)
- [`./tasks-06-07-revamp-todo-modals.md`](./tasks-06-07-revamp-todo-modals.md)
- [`./tasks-06-08-add-unit-tests.md`](./tasks-06-08-add-unit-tests.md)
