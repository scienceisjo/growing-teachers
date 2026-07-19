-- ─────────────────────────────────────────────────────────────
--  연수: 우리 반 반응속도 대결 · Supabase 테이블
--  사용법: Supabase 대시보드 → SQL Editor → 아래 붙여넣고 RUN
--  그다음 ① sonic.html 의 YEONSU.key  ② 대시보드 HTML 의 CFG.key 채우기
-- ─────────────────────────────────────────────────────────────

create table if not exists public.reaction_results (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  room        text not null default 'demo',   -- 반 코드(예:'3-2'). 반별로 데이터 분리
  player      text,                            -- 익명 라벨('1번 선수' 등) — 실명 X (최소수집)
  ms          int  not null,                   -- 반응 시간(밀리초). 이것만 있으면 그래프 완성
  mode        text,                            -- 'human' | 'animal'
  rounds      int
);

-- 반별 최신순 조회 빠르게
create index if not exists reaction_results_room_created_idx
  on public.reaction_results (room, created_at desc);

-- ── 행 수준 보안(RLS) ─────────────────────────────────────────
-- ⚠️ 강의 포인트: RLS를 켜지 않으면(또는 정책이 헐거우면) 키만 아는 사람은
--    누구나 전체 데이터를 다운로드할 수 있습니다. 이게 '바이브코딩'의 대표 사고예요.
alter table public.reaction_results enable row level security;

-- 익명(anon) 참가자: 남기기(insert)만, 그것도 '말이 되는 값'만 허용
--   · ms 범위 체크로 장난 데이터 차단  · room 길이 제한
drop policy if exists "anon can insert reaction" on public.reaction_results;
create policy "anon can insert reaction"
  on public.reaction_results for insert to anon
  with check ( ms between 50 and 5000 and char_length(room) between 1 and 40 );

-- 대시보드가 결과를 읽어야 하므로 select 허용.
--   지금은 '누구나 읽기(true)'라 키를 아는 사람은 모든 반을 볼 수 있습니다.
--   더 엄격히 하려면: select를 끄고 반별 뷰/함수로만 노출하거나,
--   교사 로그인(auth) 후 auth 사용자만 읽게 바꾸세요. (강의 5부에서 다룸)
drop policy if exists "anon can read reaction" on public.reaction_results;
create policy "anon can read reaction"
  on public.reaction_results for select to anon
  using ( true );

-- (선택) 연수/수업 끝나고 특정 반 데이터 비우기:
--   delete from public.reaction_results where room = '3-2';
-- (선택) 자동 파기 예시: 7일 지난 데이터 삭제(스케줄러 필요)
--   delete from public.reaction_results where created_at < now() - interval '7 days';
