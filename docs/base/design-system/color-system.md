# Color System

> Dopamine Planner 의 컬러는 결과가 아닌 서사의 산물이다. 형용사 → 메타포 → 팔레트 → 토큰 순서를 유지한다.

---

## 1. Color Story (확정)

| 항목 | 내용 |
|---|---|
| **Brand Adjectives** | `차분한` · `집중력 있는` · `즐거운` · `깔끔한` · `현대적인` |
| **Core Metaphor** | "이른 저녁, 책상 위 라일락 향초가 타오르는 차분한 작업 공간" — 보랏빛 잔향이 집중을 부드럽게 끌어올리는 장면 |
| **Target & Domain** | 20–30대 직장인·대학생의 일/생활 분리형 투두 (생산성 도구) |
| **Temperature** | Cool 70 / Warm 30 — Cool 우세 (보라·인디고 계열). 도파민 자극은 Accent Purple 의 채도로만 한정 |
| **Harmony** | **Analogous** (Purple ↔ Periwinkle ↔ Indigo — 보라계 인접 색상). 안정감 우선 + 강한 대비 회피 |
| **Emotional Statement** | "우리의 색은 *몰입을 방해하지 않는 즐거움* 을 말하고 싶다." |

선택 근거:
- Analogous 를 선택한 이유: 생산성 도구는 장시간 노출되므로 Triadic / Complementary 의 강한 대비는 피로 유발
- Cool 우세를 선택한 이유: 집중·정돈 의 무드 (보랏빛 노을 / 라일락) 와 일치
- Accent 만 채도 높은 Purple 500 (`#9755D9`) — 60-30-10 의 10% 영역에서만 사용

---

## 2. 6역할 팔레트

| 역할 | 대표 HEX | 토큰 | 사용 영역 |
|---|---|---|---|
| **Primary** | `#9755D9` | `color-purple-500` | CTA, FAB, 체크박스, 포커스 링 |
| **Secondary** | `#9DA3E8` | `color-periwinkle-500` | 카테고리 뱃지, 보조 인터랙션, 태그 |
| **Accent** | `#9755D9` | (Primary 와 동일 — Analogous 특성상 Accent 분리 안 함) | (Primary 사용처와 동일) |
| **Neutrals (Cool)** | `#7578BF` ~ `#F2F2F2` | `color-indigo-600`, `color-lavender-gray-300`, `color-gray-50` | 보조 텍스트, 보더, Surface |
| **Semantic** | `#22C55E` / `#EF4444` / `#F59E0B` / `#3B82F6` | `color-{green,red,yellow,blue}-500` | success / error / warning / info |
| **Surface** | `#FFFFFF` / `#F2F2F2` | `color-white`, `color-gray-50` | 페이지 배경, 카드 배경 |
| **Grounding** | `#000000` | `color-black-900` | 본문 텍스트 |

> Analogous 팔레트 특성상 Primary 와 Accent 가 통합된다. 화면당 Accent 영역은 1–2곳으로 제한 (FAB + 활성 CTA 등).

---

## 3. 명도 스케일 (Hue Shift 적용)

각 핵심 색은 5단계 스케일로 전개. **명도 변화 시 Hue 도 미세 이동**하여 자연스러움 확보.

### Purple (Primary)

| 토큰 | HEX | 용도 |
|---|---|---|
| `color-purple-100` | `#D7AEF2` | 배경 하이라이트, 비활성 상태 |
| `color-purple-200` | `#C599F2` | 호버 surface |
| `color-purple-300` | `#B87EF2` | hover 상태 (`interactive-primary-hover`) |
| `color-purple-500` | `#9755D9` | **Primary 브랜드색** |
| `color-purple-700` | `#8A63BF` | active / pressed 상태 |

### Periwinkle (Secondary)

| 토큰 | HEX | 용도 |
|---|---|---|
| `color-periwinkle-100` | `#D2D3FF` | 연한 배경, 카테고리 뱃지 배경 |
| `color-periwinkle-200` | `#BFCEFF` | 호버 surface |
| `color-periwinkle-300` | `#BAC3FF` | secondary hover |
| `color-periwinkle-400` | `#9DABE8` | secondary active |
| `color-periwinkle-500` | `#9DA3E8` | **Secondary 색상** |

### Neutrals

| 토큰 | HEX | 용도 |
|---|---|---|
| `color-indigo-600` | `#7578BF` | 보조 텍스트/아이콘 (UI 한정) |
| `color-lavender-gray-300` | `#B8BAD9` | 보더, 디바이더 |
| `color-gray-50` | `#F2F2F2` | Surface 배경 |
| `color-white` | `#FFFFFF` | 기본 배경 |
| `color-black-900` | `#000000` | Grounding (본문 텍스트) |

### Status

| 토큰 | HEX | 용도 |
|---|---|---|
| `color-green-500` | `#22C55E` | success |
| `color-red-500` | `#EF4444` | error |
| `color-yellow-500` | `#F59E0B` | warning |
| `color-blue-500` | `#3B82F6` | info |

> Status 색상은 Tailwind 의 표준 Status 팔레트를 채택. Primary/Secondary 와 Hue 충돌 없음 (보라계 vs 적·녹·황·청).

---

## 4. 60-30-10 적용 가이드

| 비율 | 영역 | 사용 색상 |
|---|---|---|
| **60%** Dominant | 페이지 배경, 카드 배경, 여백 | `color-white`, `color-gray-50` |
| **30%** Subdominant | 섹션 헤더, 보조 텍스트, 보더, 태그 | `color-periwinkle-{100,500}`, `color-lavender-gray-300`, `color-indigo-600` |
| **10%** Accent | CTA, FAB, 체크박스 active, 포커스 링 | `color-purple-500` |
| — Grounding | 본문 텍스트, 주요 아이콘 | `color-black-900` |

**금지 사항**:
- Accent (Purple 500) 영역이 화면당 30% 초과 — 시각적 피로 유발
- Status 색을 일반 UI 강조용으로 사용 — 의미 신호 약화

---

## 5. WCAG 2.1 AA 대비 검증

핵심 텍스트–배경 조합. 일반 텍스트 4.5:1 / 큰 텍스트·UI 3:1 기준.

| 조합 | 대비비 | 판정 | 사용 가이드 |
|------|--------|------|------|
| `color-black-900` on `color-white` | 21 : 1 | ✅ AA / AAA | 본문 기본 |
| `color-black-900` on `color-gray-50` | 18.1 : 1 | ✅ AA / AAA | Surface 위 본문 |
| `color-purple-500` on `color-white` | 4.6 : 1 | ✅ AA | 강조 텍스트 가능 |
| `color-white` on `color-purple-500` | 4.6 : 1 | ✅ AA (Large) / UI | CTA 버튼 텍스트 (≥ 18px) |
| `color-indigo-600` on `color-white` | 3.4 : 1 | ⚠️ UI Only | 보조 텍스트·아이콘 한정 (본문 금지) |
| `color-indigo-600` on `color-gray-50` | 3.1 : 1 | ⚠️ UI Only | 보조 텍스트·아이콘 한정 |
| `color-lavender-gray-300` on `color-white` | 1.9 : 1 | ❌ Fail | **본문/UI 모두 금지** — 보더/디바이더 전용 |
| `color-periwinkle-500` on `color-white` | 2.4 : 1 | ❌ Fail (텍스트) / ✅ UI 보더 | 텍스트로 사용 금지 — 뱃지 배경 + 별도 텍스트색 사용 |

### 사용 금지 / 제한 조합

- ❌ `color-lavender-gray-300` 텍스트 — 디바이더/보더 전용
- ❌ `color-periwinkle-500` 위 흰 텍스트 (대비 미달) — 뱃지의 텍스트는 `color-periwinkle-500` 자체를 사용 (배경은 `color-periwinkle-100`)
- ⚠️ `color-indigo-600` 본문 금지 — 보조 텍스트/아이콘 한정 (WCAG AA 본문 4.5:1 미달)
- ⚠️ Status 색 단독 의존 금지 — 반드시 아이콘/텍스트 보조 (색맹 대응)

---

## 6. 다크 모드 (Future / P3)

라이트 모드만 MVP. 다크 모드 도입 시 **Semantic 토큰만 재매핑** 한다 (Primitive·Component 변경 없음).

| Semantic 토큰 | Light 참조 | Dark 참조 (예정) |
|---|---|---|
| `color-bg-base` | `color-white` | `color-black-900` (또는 `color-gray-900` 추가) |
| `color-text-primary` | `color-black-900` | `color-white` |
| `color-bg-surface` | `color-gray-50` | (신규 `color-gray-800` 등 추가 검토) |
| `color-interactive-primary` | `color-purple-500` | `color-purple-300` (어두운 배경에서 시인성) |

> Dark Mode 도입 시 `theming.md` 추가 + Primitive 에 `color-gray-{800,900}` 등 어두운 단계 보강 필요.
