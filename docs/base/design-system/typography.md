# Typography

> 한글 우선 가변 폰트 + 코드용 모노 스택. 모든 텍스트 관련 값은 **rem 단위**를 사용한다.

---

## 1. 폰트 패밀리

### `font-family-sans`

```
"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont,
system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo",
"Noto Sans KR", "Malgun Gothic", "Apple Color Emoji",
"Segoe UI Emoji", "Segoe UI Symbol", sans-serif
```

- 한글 우선 가변 폰트 (Pretendard Variable)
- CDN 로딩 실패 시 system-ui → 한글 OS 기본 폰트로 폴백
- 모바일(Expo): Pretendard 를 `expo-font` 로 로컬 번들링하거나 시스템 폴백 허용

### `font-family-mono`

```
"JetBrains Mono", "Fira Code", Consolas, monospace
```

- 코드/숫자/날짜·시간 표시 (`2026-05-04`, `12:00`) 용
- 가변 폭이 시각적 흐름을 깨는 영역에서만 한정 사용

---

## 2. Type Scale (Font Size)

| 토큰 | 값 | px 환산 | 사용처 |
|---|---|---|---|
| `font-size-xs` | `0.6875rem` | 11px | 캡션, 이월 횟수, 마이크로 라벨 |
| `font-size-sm` | `0.8125rem` | 13px | 보조 텍스트, 날짜, 메타 정보 |
| `font-size-md` | `0.9375rem` | 15px | **본문 기본**, 투두 제목, 입력 필드 |
| `font-size-lg` | `1.0625rem` | 17px | 섹션 헤더, 강조 본문 |
| `font-size-xl` | `1.25rem` | 20px | 페이지 타이틀 |
| `font-size-2xl` | `1.5rem` | 24px | 날짜 네비게이션 (히어로) |

> 6단계 스케일은 모바일 화면(~430px) 기준에 최적화. 데스크탑에서도 동일 값을 유지하되 layout-max-width 480px 으로 가독성 보장.

---

## 3. Line Height

| 토큰 | 값 | px 환산 | 페어링되는 Font Size |
|---|---|---|---|
| `line-height-xs` | `1rem` | 16px | `font-size-xs` |
| `line-height-sm` | `1.125rem` | 18px | `font-size-sm` |
| `line-height-md` | `1.375rem` | 22px | `font-size-md` |
| `line-height-lg` | `1.5rem` | 24px | `font-size-lg` |
| `line-height-xl` | `1.75rem` | 28px | `font-size-xl` |
| `line-height-2xl` | `2rem` | 32px | `font-size-2xl` |

**원칙**: 한글은 영문 대비 자형 높이가 커서 line-height 비율을 영문 권장(1.4~1.6) 보다 약간 낮게 맞춤 (대략 1.33~1.45).

---

## 4. Font Weight

| 토큰 | 값 | 사용처 |
|---|---|---|
| `font-weight-regular` | `400` | 본문 |
| `font-weight-medium` | `500` | 강조 텍스트, 카테고리명 |
| `font-weight-semibold` | `600` | 섹션 헤더, 탭 활성, 강한 강조 |
| `font-weight-bold` | `700` | 날짜 히어로, 페이지 타이틀 |

> Pretendard 는 가변 폰트이므로 100 단위 정수면 모두 사용 가능. 본 시스템은 4단계로 한정해 시각적 위계 명확성 우선.

---

## 5. 사용 예시 매트릭스

| 화면 영역 | Size | Weight | Line Height |
|---|---|---|---|
| 페이지 타이틀 (`/login` 헤더 등) | `font-size-xl` | `font-weight-bold` | `line-height-xl` |
| 날짜 히어로 (DateNavigator) | `font-size-2xl` | `font-weight-bold` | `line-height-2xl` |
| 섹션 헤더 ("진행 중 (3)") | `font-size-lg` | `font-weight-semibold` | `line-height-lg` |
| 본문 / 투두 제목 | `font-size-md` | `font-weight-regular` | `line-height-md` |
| 강조 본문 (카테고리명) | `font-size-md` | `font-weight-medium` | `line-height-md` |
| 보조 텍스트 (날짜·메타) | `font-size-sm` | `font-weight-regular` | `line-height-sm` |
| 캡션 (이월 횟수 뱃지) | `font-size-xs` | `font-weight-medium` | `line-height-xs` |
| 탭 라벨 활성 | `font-size-xs` | `font-weight-semibold` | `line-height-xs` |
| 탭 라벨 비활성 | `font-size-xs` | `font-weight-regular` | `line-height-xs` |

---

## 6. 원칙

1. **rem 단위 우선** — 모든 폰트 크기·줄높이는 rem (시스템 폰트 크기 설정 존중). px 는 비텍스트 요소(아이콘/보더/간격)에만
2. **본문은 `font-size-md` (15px)** 미만 금지 — 모바일 가독성 최소선
3. **줄높이를 텍스트별로 임의 변경 금지** — 항상 동일 인덱스 토큰을 페어링 (`font-size-md` ↔ `line-height-md`)
4. **장식용 폰트 추가 금지** — Pretendard / JetBrains Mono 외 폰트는 본 시스템에서 미정의
5. **font-stretch / italic 사용 자제** — 한글 가독성 저해. 강조는 weight 로
6. **200% 폰트 확대 시에도 콘텐츠가 잘리지 않아야 함** — 컴포넌트 max-width / 줄바꿈 정책에 반영
