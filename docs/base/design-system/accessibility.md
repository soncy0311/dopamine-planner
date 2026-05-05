# 접근성 가이드라인

> WCAG 2.1 AA 기준 준수. Web 은 Radix Primitives 의 내장 접근성, Mobile(RN) 은 React Native Accessibility API + Expo `expo-accessibility` 를 기반으로 구현한다.

---

## 1. 색 대비 (Color Contrast)

### WCAG AA 기준

| 유형 | 최소 대비비 |
|------|------------|
| 일반 텍스트 (< 18px, < 14px bold) | **4.5:1** |
| 대형 텍스트 (≥ 18px, ≥ 14px bold) | **3:1** |
| UI 요소 (아이콘, 보더 등) | **3:1** |

### 검증된 조합

| 조합 | 대비비 | 판정 |
|------|--------|------|
| Black `#000000` on White `#FFFFFF` | 21:1 | PASS |
| Black `#000000` on Gray `#F2F2F2` | 18.1:1 | PASS |
| Purple 500 `#9755D9` on White `#FFFFFF` | 4.6:1 | PASS (AA) |
| White `#FFFFFF` on Purple 500 `#9755D9` | 4.6:1 | PASS (Large) |
| Indigo 600 `#7578BF` on White `#FFFFFF` | 3.4:1 | PASS (UI Only) |
| Indigo 600 `#7578BF` on Gray `#F2F2F2` | 3.1:1 | PASS (UI Only) |

### 제한 사항

- **Indigo 600** (`--color-text-secondary`)은 일반 본문 텍스트로 사용 금지. 보조 텍스트/아이콘에만 한정한다.
- 새로운 컬러 조합 추가 시 반드시 대비비를 검증한다.

---

## 2. 터치 타겟 (Touch Target)

| 항목 | 최소 크기 |
|------|----------|
| 버튼, 체크박스, 탭 | **44 × 44px** |
| 인라인 링크 | 충분한 패딩으로 44px 확보 |
| 아이콘 버튼 | 아이콘 24px + 패딩으로 44px 이상 |

> 모바일 RN 네이티브 환경에서 필수. 시각적 크기가 작아도 터치 영역은 44px 이상이어야 한다.

---

## 3. 키보드 탐색 (Keyboard Navigation)

### 필수 요구사항

- 모든 인터랙티브 요소는 **Tab 키**로 접근 가능해야 한다.
- **논리적 탭 순서**를 유지한다 (DOM 순서 기반).
- **포커스 표시**는 `--color-border-focus` (Purple 500)으로 명확히 보여야 한다.

### 컴포넌트별 키보드 지원

| 컴포넌트 | 키보드 인터랙션 |
|----------|----------------|
| Button | `Enter`, `Space` → 클릭 |
| Checkbox | `Space` → 토글 |
| BottomTabBar | `←` `→` 방향키로 탭 이동, `Enter` → 선택 |
| DateNavigator | `←` `→` 방향키로 날짜 이동 |
| TodoCreateSheet | `Escape` → 닫기, 포커스 트랩 활성 |
| TodoItem | `Enter` or `Space` → 체크박스 토글 |

---

## 4. 스크린 리더 (Screen Reader)

### ARIA 레이블 규칙

| 요소 | ARIA 속성 |
|------|-----------|
| Checkbox | `role="checkbox"`, `aria-checked="true/false"` |
| BottomTabBar | `role="tablist"` |
| TabBarItem | `role="tab"`, `aria-selected="true/false"` |
| TodoSection | `role="list"` |
| TodoItem | `role="listitem"` |
| TodoCreateSheet | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` |
| FAB | `aria-label="할 일 추가"` |
| DateNavigator 버튼 | `aria-label="이전 날짜"` / `aria-label="다음 날짜"` |
| Divider | `role="separator"` |
| 장식용 Icon | `aria-hidden="true"` |
| 의미 있는 Icon | `aria-label="아이콘 설명"` |

### 상태 변경 알림

- 투두 완료/미완료 전환 시 `aria-live="polite"` 영역에서 상태 변경 알림.
- 투두 삭제 시 삭제 완료 메시지를 `aria-live` 로 전달.
- 폼 제출 성공/실패 시 결과를 `aria-live` 로 전달.

---

## 5. 색상 비의존성 (Color Independence)

색상만으로 정보를 전달하지 않는다. 반드시 **아이콘, 텍스트, 패턴** 중 하나 이상을 병행한다.

| 정보 | 색상 외 보조 수단 |
|------|-------------------|
| 우선순위 High | `AlertTriangle` 아이콘 + "높음" 텍스트 |
| 완료 상태 | 체크 아이콘 + 취소선 |
| 에러 상태 | 에러 아이콘 + 에러 메시지 텍스트 |
| 성공 상태 | 체크 아이콘 + 성공 메시지 텍스트 |
| 이월 표시 | `ArrowRightFromLine` 아이콘 + 이월 횟수 텍스트 |

---

## 6. 폰트 스케일링 (Font Scaling)

- 모든 폰트 크기는 **rem 단위**를 사용하여 시스템 폰트 크기 설정을 존중한다.
- `px` 단위는 아이콘 크기, 보더, 간격 등 비텍스트 요소에만 사용한다.
- 폰트 크기를 200%로 확대해도 콘텐츠가 잘리거나 겹치지 않아야 한다.

---

## 7. 체크리스트

구현 시 각 컴포넌트에 대해 아래 항목을 검증한다:

- [ ] 색 대비 WCAG AA 통과
- [ ] 터치 타겟 44×44px 이상
- [ ] Tab 키로 접근 가능
- [ ] 포커스 링 표시 명확
- [ ] 적절한 ARIA 속성 적용
- [ ] 스크린 리더에서 의미 전달 확인
- [ ] 색상 외 보조 수단 제공
- [ ] rem 단위로 폰트 크기 설정
- [ ] 키보드 인터랙션 동작 확인
