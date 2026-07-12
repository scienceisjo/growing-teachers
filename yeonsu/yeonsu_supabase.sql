-- ─────────────────────────────────────────────────────────────
--  연수 라이브 응답 벽 · Supabase 테이블
--  사용법: Supabase 대시보드 → SQL Editor → 아래 붙여넣고 RUN
--  그다음 연수 페이지 CONFIG.supabaseUrl / supabaseAnonKey 채우기
-- ─────────────────────────────────────────────────────────────

create table if not exists public.yeonsu_responses (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text,
  prompt      text not null default 'nlm_work',   -- 질문 구분 키 (연수 페이지와 동일)
  body        text not null
);

-- 최신순 조회 빠르게
create index if not exists yeonsu_responses_prompt_created_idx
  on public.yeonsu_responses (prompt, created_at desc);

-- 행 수준 보안(RLS) 켜기
alter table public.yeonsu_responses enable row level security;

-- 익명(anon) 참가자: 남기기(insert) + 읽기(select) 허용, 수정/삭제는 불가
drop policy if exists "anon can insert" on public.yeonsu_responses;
create policy "anon can insert"
  on public.yeonsu_responses for insert to anon
  with check ( char_length(body) between 1 and 300 );

drop policy if exists "anon can read" on public.yeonsu_responses;
create policy "anon can read"
  on public.yeonsu_responses for select to anon
  using ( true );

-- (선택) 연수 끝나고 비우기:
--   delete from public.yeonsu_responses where prompt = 'nlm_work';
