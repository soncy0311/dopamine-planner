# TASK-10-17: mobile — `sub-issue-form.tsx` priority 제거 + description 추가 + 상위 Epic readonly TextInput

## 기본 정보

- **Sub-PRD**: [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md)
- **작업 번호**: 10-17
- **상태**: 완료 (2026-05-07)
- **의존성**: TASK-10-16 (mobile schemas)

## 작업 목표

sub-prd-10 §5.2 — `apps/mobile/src/app/sub-issue-form.tsx` 갱신:
1. priority radiogroup `<Controller name="priority" />` 제거 (현 L13/40/64/98~121)
2. description multiline TextInput 추가 (정책 정합 — title 아래)
3. 상위 Epic 표기를 `<Text>Epic: {epicTitle}</Text>` (현 L77~79) → readonly TextInput
4. `SubIssueFormSchema` 에 description 추가
5. payload (`mutateAsync`) 갱신

## 상세 구현 내용

### 대상 파일

| 파일 | 작업 | 산출물 |
|---|---|---|
| `apps/mobile/src/app/sub-issue-form.tsx` | 수정 | priority 제거 + description 추가 + Epic readonly + payload 갱신 |

### 변경 세부

#### 1. priority radiogroup 제거 (L98~121)

```tsx
// 변경 전
<Controller name="priority" control={control} render={...라디오 마크업...} />

// 변경 후 — 블록 전체 삭제
```

`SubIssueFormSchema.priority` (L13 / L40), `defaultValues.priority` (L64), payload (L64) 모두 제거.

#### 2. description multiline TextInput 추가

```tsx
<Controller
  name="description"
  control={control}
  render={({ field }) => (
    <TextInput
      multiline
      numberOfLines={4}
      placeholder="설명 (선택)"
      maxLength={2000}
      value={field.value ?? ''}
      onChangeText={field.onChange}
      className="bg-periwinkle-50 rounded-md p-3 text-text-primary"
      style={{ textAlignVertical: 'top' }}
    />
  )}
/>
```

#### 3. 상위 Epic readonly TextInput (L77~79)

```tsx
// 변경 전
<Text className="text-sm text-text-secondary">Epic: {epicTitle}</Text>

// 변경 후 — issue-creation.md §3.2 정합
<View>
  <Text className="text-xs text-text-secondary">상위 Epic</Text>
  <TextInput
    value={epicTitle}
    editable={false}
    accessibilityState={{ disabled: true }}
    className="bg-periwinkle-100 text-text-primary rounded-md px-3 py-2 mt-1"
  />
</View>
```

#### 4. `SubIssueFormSchema` 에 description 추가

```ts
const SubIssueFormSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),  // 추가
  registered_date: z.string(),
  // priority 제거
});
```

#### 5. payload / defaultValues 갱신

```tsx
defaultValues: {
  title: initial?.title ?? '',
  description: initial?.description ?? '',
  registered_date: initial?.registered_date ?? today,
  // priority 제거
}

await create.mutateAsync({
  title: values.title,
  description: values.description ?? null,  // 추가
  registered_date: values.registered_date,
  epic_id: epicId,
  // priority 제거
});
```

### 회귀 영향

- mobile Sub 추가 폼이 web 폼과 동등 필드 (title / description / 상위 Epic readonly / 등록일)
- 200/2000자 한도 정합 (sub-prd-10 §주의사항 3)

## 검증 과정

- [x] `sub-issue-form.tsx` 안 priority 키워드 0건
- [x] description multiline TextInput 존재
- [x] 상위 Epic 표기가 `editable={false}` TextInput
- [x] `SubIssueFormSchema.description` 필드 존재
- [x] payload 에 description 포함, priority 0건
- [x] `pnpm --filter @todo-list/mobile run typecheck` 통과
- [x] 수동: 시뮬레이터에서 sub 추가 폼 진입 → description 입력 → 저장 → DB row 정합

## 주의사항

1. **`accessibilityState`**: RN 접근성 — `disabled: true` 명시.
2. **글자수 제한**: web 과 동일 200/2000자 (sub-prd-10 §주의사항 3).
3. **placeholder 톤**: web 폼과 톤 일치 ("설명 (선택)" 등).
4. **scope = feat(mobile)**: PR scope.

## 관련 문서

- [`../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md`](../sub-prd-10-refactor-priority-on-epic-and-design-system-alignment.md) §5.2 / §주의사항 3
- [`./tasks-10-16-mobile-form-schemas.md`](./tasks-10-16-mobile-form-schemas.md)
- [`../../../base/design-system/components/issue-creation.md`](../../../base/design-system/components/issue-creation.md) §3.2
- `apps/mobile/src/app/sub-issue-form.tsx`
