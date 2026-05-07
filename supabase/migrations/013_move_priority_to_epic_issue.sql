-- 013_move_priority_to_epic_issue.sql
-- sub-prd-10 §1 — `priority` 컬럼을 sub_issue → epic_issue 로 이전.
-- 정책: priority 는 Epic 단위로 부여하고 Sub 는 상속.
-- 데이터: 기존 sub_issue.priority 값은 drop. Epic 모두 'medium' default 로 초기화.

alter table public.epic_issue
  add column priority priority not null default 'medium';

alter table public.sub_issue
  drop column priority;

comment on column public.epic_issue.priority is
  'Epic 단위 우선순위. Sub 는 본 컬럼을 상속.';
