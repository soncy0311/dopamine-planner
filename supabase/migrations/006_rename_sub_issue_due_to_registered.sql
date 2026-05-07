-- 006_rename_sub_issue_due_to_registered.sql
-- sub-prd-09 §1 — sub_issue.due_date 의미를 "등록일"로 정합.
-- 컬럼·인덱스 rename. 데이터 값 손실 0.

alter table public.sub_issue rename column due_date to registered_date;
alter index public.idx_sub_issue_user_due_status rename to idx_sub_issue_user_registered_status;

comment on column public.sub_issue.registered_date is '그 날짜에 등록 / 이월된 sub. 마감일 의미 아님.';
