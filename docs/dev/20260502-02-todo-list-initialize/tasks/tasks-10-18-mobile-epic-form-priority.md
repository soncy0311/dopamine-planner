# TASK-10-18: mobile — `epic-form.tsx` + `EpicForm.tsx` priority radiogroup 추가

## 기본 정보

- **Sub-PRD**: [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md)
- **작업 번호**: 10-18
- **상태**: 완료 (2026-05-07)
- **의존성**: TASK-10-16 (mobile schemas)

## 작업 목표

sub-prd-10 §5.3 — `apps/mobile/src/app/epic-form.tsx` + `apps/mobile/src/components/forms/EpicForm.tsx` 에 priority radiogroup 추가 + payload wiring.

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/mobile/src/app/epic-form.tsx` | 수정 | priority 필드 wiring (`useCreateEpic` / `useUpdateEpic` payload + 편집 default) |
| `apps/mobile/src/components/forms/EpicForm.tsx` | 수정 | priority radiogroup 마크업 + Controller |

### 변경 세부

#### 1. `EpicForm.tsx` 에 priority radiogroup 추가

```tsx
const PRIORITY_OPTIONS = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
] as const;

<Controller
  name="priority"
  control={control}
  render={({ field }) => (
    <View>
      <Text className="text-xs text-text-secondary mb-1">우선순위</Text>
      <View className="flex-row gap-2">
        {PRIORITY_OPTIONS.map((opt) => (
          <Pressable
            key={opt.value}
            onPress={() => field.onChange(opt.value)}
            className={`flex-1 py-2 rounded-md items-center ${
              field.value === opt.value
                ? `bg-priority-${opt.value}-bg`
                : 'bg-periwinkle-100'
            }`}
            accessibilityRole="radio"
            accessibilityState={{ selected: field.value === opt.value }}
          >
            <Text className={field.value === opt.value ? `text-priority-${opt.value}` : 'text-text-secondary'}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  )}
/>
```

#### 2. `epic-form.tsx` defaultValues / payload

```tsx
const { control, handleSubmit } = useForm({
  resolver: zodResolver(EpicFormSchema),
  defaultValues: {
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    category: initial?.category_id ?? '',
    priority: initial?.priority ?? 'medium',  // 편집 모드 default 채움
  },
});

await (isEdit ? update : create).mutateAsync({
  ...
  priority: values.priority,  // 추가
});
```

### 회귀 영향

- mobile Epic 생성 / 편집 시 priority 선택 가능 + DB 저장
- 메인 일자 뷰의 mobile EpicAccordionCard 헤더 priority badge 노출 (TASK-10-19 / 10-20 정합)

## 검증 과정

- [x] `EpicForm.tsx` 에 priority radiogroup 존재
- [x] `epic-form.tsx` defaultValues.priority 채움 (편집 모드 server 값)
- [x] `useCreateEpic` / `useUpdateEpic` payload 에 priority 전달
- [x] `pnpm --filter @todo-list/mobile run typecheck` 통과
- [x] 수동: 시뮬레이터에서 Epic 생성 → priority 선택 → 저장 → 메인 뷰 헤더 badge 색 확인
- [x] 수동: Epic 편집 진입 → server priority 값으로 default 채움 / 변경 후 저장 → DB / 헤더 즉시 반영

## 주의사항

1. **Nativewind priority 토큰**: `bg-priority-{p}-bg` / `text-priority-{p}` 가 Nativewind 에서 정상 작동하는지 검증 (sub-prd-10 §주의사항 6). 미작동 시 hex 매핑 폴백 + 후속 토큰 SoT 갱신.
2. **`accessibilityRole="radio"`**: RN 접근성 — radiogroup 등가 표현.
3. **편집 모드 default**: server priority 값을 fetch 한 뒤 `reset()` 또는 `defaultValues` 로 채움. 미채움 시 항상 `medium` 으로 덮어써짐 (회귀 위험).
4. **scope = feat(mobile)**: PR scope.

## 관련 문서

- [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md) §5.3 / §주의사항 6
- [`./tasks-10-16-mobile-form-schemas.md`](./tasks-10-16-mobile-form-schemas.md)
- [`./tasks-10-20-mobile-epic-accordion-card.md`](./tasks-10-20-mobile-epic-accordion-card.md)
- `apps/mobile/src/app/epic-form.tsx`
- `apps/mobile/src/components/forms/EpicForm.tsx`
