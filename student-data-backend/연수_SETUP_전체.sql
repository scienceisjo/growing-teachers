-- ═══════════════════════════════════════════════════════════════
--  「학생 데이터, 모으기 전에」 연수 — 전체 백엔드 SETUP (한 번에)
--  Supabase(과학이조선생 A) → SQL Editor에 통째로 붙여넣고 Run 하세요.
--  표 4개: 반응속도 게임 · 과학 측정앱 · 국어 낱말앱 · 기획 공유앱
--  모두 RLS(행 수준 보안) 켬 + 최소권한(anon insert/select만, 수정·삭제 금지)
-- ═══════════════════════════════════════════════════════════════


-- ① 반응속도 게임 (reaction_results) ─────────────────────────────
create table if not exists reaction_results (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  room        text not null default 'demo',   -- 반 코드(예: '3-2')
  player      text,                            -- 익명 라벨('1번 선수') — 실명 금지
  ms          int  not null,                   -- 반응 시간(밀리초)
  mode        text,
  rounds      int
);
create index if not exists reaction_results_room_idx on reaction_results(room, created_at desc);
alter table reaction_results enable row level security;
drop policy if exists "anon insert reaction" on reaction_results;
create policy "anon insert reaction" on reaction_results for insert to anon
  with check ( ms between 50 and 5000 and char_length(room) between 1 and 40 );
drop policy if exists "anon read reaction" on reaction_results;
create policy "anon read reaction" on reaction_results for select to anon using ( true );


-- ② 과학 측정앱 (science_measure) ────────────────────────────────
create table if not exists science_measure (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  room        text not null default 'demo',
  team        text,                            -- 조 이름/번호
  x           double precision not null,       -- 가로값(예: 부피)
  y           double precision not null        -- 세로값(예: 질량)
);
create index if not exists science_measure_room_idx on science_measure(room, created_at desc);
alter table science_measure enable row level security;
drop policy if exists "anon insert science" on science_measure;
create policy "anon insert science" on science_measure for insert to anon
  with check ( char_length(room) between 1 and 40
    and x between -1000000 and 1000000 and y between -1000000 and 1000000 );
drop policy if exists "anon read science" on science_measure;
create policy "anon read science" on science_measure for select to anon using ( true );


-- ③ 국어 낱말앱 (korean_words) ──────────────────────────────────
create table if not exists korean_words (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  room        text not null default 'demo',
  name        text,                            -- 작성자(선택/익명)
  word        text not null                    -- 낱말/짧은 답
);
create index if not exists korean_words_room_idx on korean_words(room, created_at desc);
alter table korean_words enable row level security;
drop policy if exists "anon insert words" on korean_words;
create policy "anon insert words" on korean_words for insert to anon
  with check ( char_length(room) between 1 and 40 and char_length(word) between 1 and 40 );
drop policy if exists "anon read words" on korean_words;
create policy "anon read words" on korean_words for select to anon using ( true );


-- ④ 기획 공유앱 (teacher_plans) ─────────────────────────────────
--    선생님들이 낸 기획을 승재쌤이 모아서 대신 배포하기 위한 표.
--    ★ 넣기(insert)만 허용 · 읽기(select)는 anon에게 막음
--      (다른 사람이 남의 기획·키를 못 읽게. 승재쌤은 Table Editor/SQL Editor로 봄)
create table if not exists teacher_plans (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  teacher     text,        -- 성함/과목
  plan        text,        -- 프로그램 계획
  data_types  text,        -- 수집할 데이터 종류
  purpose     text,        -- 수집 목적
  app_plan    text,        -- 웹앱 계획
  supa_url    text,        -- 교사 본인 Supabase URL
  supa_key    text,        -- 교사 본인 anon key(공개 가능)
  prompt_app  text,        -- 자동 생성된 '앱 만들기' 프롬프트
  prompt_sql  text         -- 자동 생성된 'Supabase SQL' 프롬프트
);
create index if not exists teacher_plans_created_idx on teacher_plans(created_at desc);
alter table teacher_plans enable row level security;
drop policy if exists "anon insert plans" on teacher_plans;
create policy "anon insert plans" on teacher_plans for insert to anon
  with check ( char_length(coalesce(plan,'')) <= 5000 );
-- 읽기 정책 없음 = anon은 읽을 수 없음(의도적). 관리자만 대시보드에서 열람.


-- ═══════════════════════════════════════════════════════════════
--  확인: "Success. No rows returned" 이 뜨면 성공.
--  데이터 지우기(파기): delete from 표이름;   예) delete from reaction_results;
-- ═══════════════════════════════════════════════════════════════
