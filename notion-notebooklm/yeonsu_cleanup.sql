-- ─────────────────────────────────────────────────────────────
--  연수 참가자 응답 정리(개인정보 삭제)
--  대상 : Supabase A 프로젝트(과학이조선생, vbvtnmnodeoocbbjauap)
--         public.yeonsu_responses
--  사용 : Supabase 대시보드 → SQL Editor → 붙여넣고 RUN
--         (SQL Editor는 RLS를 통과하므로 삭제가 됩니다)
--
--  이 페이지가 받은 것 : name(선택 입력 이름, 최대 12자) · body(한 줄 답변) · created_at
--  ※ 이 테이블은 다른 연수 페이지 2개와 함께 씁니다.
--       notion-notebooklm(이 연수)  : subject · notion_idea · nlm_idea   ← 이름이 들어간 것은 여기뿐
--       gaepo-backend               : gaepo_tool_idea
--       student-data-backend        : teacher_tool_idea
--     그래서 아래 ②는 prompt 로 범위를 좁혀 이 연수 것만 지웁니다.
-- ─────────────────────────────────────────────────────────────


-- ① 먼저 무엇이 남아 있는지 확인 (삭제 전 1회)
select prompt,
       count(*)                                          as 건수,
       count(*) filter (where coalesce(name,'') <> '')   as 이름있음,
       min(created_at)                                   as 처음,
       max(created_at)                                   as 마지막
from public.yeonsu_responses
group by prompt
order by prompt;

-- (원하면) 실제 내용 눈으로 확인
-- select created_at, prompt, name, body
-- from public.yeonsu_responses
-- where prompt in ('subject','notion_idea','nlm_idea')
-- order by created_at desc;


-- ② 이 연수(Notion·NotebookLM)에서 받은 응답 전부 삭제  ← 되돌릴 수 없습니다
delete from public.yeonsu_responses
where prompt in ('subject','notion_idea','nlm_idea');


-- ③ 삭제 확인 (0 이 나와야 정상)
select count(*) as 남은건수
from public.yeonsu_responses
where prompt in ('subject','notion_idea','nlm_idea');


-- ─────────────────────────────────────────────────────────────
--  아래는 필요할 때만 골라 쓰는 선택지 (기본은 실행되지 않게 주석 처리)
-- ─────────────────────────────────────────────────────────────

-- (A) 답변 내용은 남기고 '이름'만 지우기 — ② 대신 쓸 때
-- update public.yeonsu_responses
-- set name = null
-- where coalesce(name,'') <> '';

-- (B) 특정 날짜 이전 것만 지우기 — 날짜는 상황에 맞게 고쳐서
-- delete from public.yeonsu_responses
-- where created_at < '2026-09-01';

-- (C) 테이블 통째로 비우기 ⚠ 다른 연수(gaepo_tool_idea · teacher_tool_idea) 응답까지 전부 사라집니다
-- truncate table public.yeonsu_responses;

-- (D) 앞으로 이름 자체를 받지 않기 — 컬럼을 없애는 대신 항상 비우기
--     (연수 페이지의 '이름(선택)' 칸을 지우는 편이 더 확실합니다)
-- alter table public.yeonsu_responses
--   add constraint yeonsu_responses_no_name check (name is null) not valid;


-- ─────────────────────────────────────────────────────────────
--  SQL 로 지울 수 없는 것 — 따로 처리해 주세요
--   · 만족도 조사(구글 폼 forms.gle/qUK1SDq56igoCuSM6)
--       → 구글 폼 '응답' 탭 → 점 세 개 → 모든 응답 삭제 (연결된 스프레드시트도 함께)
--   · 팀즈(Reflect) 감정 체크인 보드 → 팀즈에서 직접 삭제
-- ─────────────────────────────────────────────────────────────
