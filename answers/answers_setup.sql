-- 학생 답 모으기 · 설치 SQL (한 번에)
-- 내 Supabase 프로젝트의 SQL Editor 에 이 글을 통째로 붙여 넣고 Run 을 누릅니다. 여러 번 돌려도 됩니다.
-- 맨 아래 결과에 「설치 끝」 한 줄이 나오면 됩니다.
-- (answers.sql + answers_v2.sql + answers_v3.sql 을 이어 붙인 것 — make_setup_sql.py 가 만듦)

-- 학생 답 모으기 (Supabase A · vbvtnmnodeoocbbjauap)
-- Supabase 대시보드 → SQL Editor 에 통째로 붙여 넣고 Run.
--
-- 표 두 개(방 · 답)는 아무도 직접 읽거나 쓸 수 없게 막고, 아래 함수 여섯 개로만 다룬다.
--   선생님: ans_open(방 열기) · ans_set_cur(지금 질문 바꾸기) · ans_list(답 모아보기) · ans_close(방 지우기)
--   학생  : ans_room(지금 질문 보기) · ans_submit(답 보내기)
-- 선생님 함수는 방을 열 때 받은 열쇠(teacher_key)가 맞아야 움직인다. 학생 함수는 열쇠를 돌려주지 않는다.
-- 학생 이름은 받지 않는다. 번호(num)는 선생님이 「번호 받기」를 켰을 때만 들어온다.
-- 30일 넘게 쓰지 않은 방은 새 방을 열 때 답과 함께 지워진다.

create table if not exists public.ans_rooms (
  code        text primary key,
  teacher_key text not null,
  title       text not null default '',
  cur         jsonb,
  use_number  boolean not null default false,
  created_at  timestamptz not null default now(),
  touched_at  timestamptz not null default now()
);

create table if not exists public.ans_answers (
  id         bigint generated always as identity primary key,
  code       text not null references public.ans_rooms(code) on delete cascade,
  qid        text not null,
  kind       text not null,
  prompt     text not null default '',
  body       text not null,
  num        text,
  device     text not null,
  created_at timestamptz not null default now()
);
create index if not exists ans_answers_code_idx on public.ans_answers(code, id);
create index if not exists ans_answers_device_idx on public.ans_answers(device, created_at);

alter table public.ans_rooms   enable row level security;
alter table public.ans_answers enable row level security;
revoke all on public.ans_rooms, public.ans_answers from anon, authenticated;

-- 방 열기: 6자리 코드와 선생님 열쇠를 돌려준다
create or replace function public.ans_open(p_title text, p_use_number boolean)
returns table(room_code text, room_key text)
language plpgsql security definer set search_path = public as $$
declare
  c text;
  abc text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  i int;
begin
  delete from ans_rooms where touched_at < now() - interval '30 days';
  loop
    c := '';
    for i in 1..6 loop
      c := c || substr(abc, 1 + floor(random() * length(abc))::int, 1);
    end loop;
    exit when not exists (select 1 from ans_rooms r where r.code = c);
  end loop;
  room_code := c;
  room_key := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
  insert into ans_rooms(code, teacher_key, title, use_number)
  values (c, room_key, left(coalesce(p_title, ''), 120), coalesce(p_use_number, false));
  return next;
end $$;

-- 지금 질문 바꾸기(선생님 화면이 질문 단계에 오면 부른다). 정답은 넣지 않는다.
create or replace function public.ans_set_cur(p_code text, p_key text, p_cur jsonb)
returns boolean
language sql security definer set search_path = public as $$
  update ans_rooms set cur = p_cur, touched_at = now()
  where code = upper(p_code) and teacher_key = p_key
  returning true;
$$;

-- 방 보기(학생): 제목 · 지금 질문 · 번호 받기 여부만
create or replace function public.ans_room(p_code text)
returns table(title text, cur jsonb, use_number boolean)
language sql security definer set search_path = public stable as $$
  select r.title, r.cur, r.use_number from ans_rooms r where r.code = upper(p_code);
$$;

-- 답 보내기(학생): 질문 보내기(ask)는 여러 번, 나머지는 같은 기기의 앞 답을 바꿔 쓴다
create or replace function public.ans_submit(p_code text, p_qid text, p_kind text, p_prompt text, p_body text, p_num text, p_device text)
returns boolean
language plpgsql security definer set search_path = public as $$
declare c text := upper(p_code);
begin
  if not exists (select 1 from ans_rooms r where r.code = c) then return false; end if;
  if p_kind not in ('choice', 'predict', 'blank', 'text', 'ask') then return false; end if;
  if coalesce(length(trim(p_body)), 0) = 0 or length(p_body) > 500 then return false; end if;
  if coalesce(length(p_device), 0) < 8 then return false; end if;
  -- 한 기기가 10초에 8번 넘게 보내면 받지 않는다
  if (select count(*) from ans_answers a where a.device = p_device and a.created_at > now() - interval '10 seconds') >= 8 then
    return false;
  end if;
  if p_kind <> 'ask' then
    delete from ans_answers a where a.code = c and a.qid = p_qid and a.device = p_device;
  end if;
  insert into ans_answers(code, qid, kind, prompt, body, num, device)
  values (c, left(p_qid, 40), p_kind, left(coalesce(p_prompt, ''), 300), trim(p_body),
          left(nullif(trim(coalesce(p_num, '')), ''), 10), left(p_device, 40));
  update ans_rooms set touched_at = now() where code = c;
  return true;
end $$;

-- 답 모아보기(선생님): p_since 보다 뒤에 들어온 답만
create or replace function public.ans_list(p_code text, p_key text, p_since bigint default 0)
returns table(id bigint, qid text, kind text, prompt text, body text, num text, device text, created_at timestamptz)
language sql security definer set search_path = public stable as $$
  select a.id, a.qid, a.kind, a.prompt, a.body, a.num, a.device, a.created_at
  from ans_answers a join ans_rooms r on r.code = a.code
  where r.code = upper(p_code) and r.teacher_key = p_key and a.id > coalesce(p_since, 0)
  order by a.id;
$$;

-- 방 지우기(선생님): 답도 함께 지워진다
create or replace function public.ans_close(p_code text, p_key text)
returns boolean
language sql security definer set search_path = public as $$
  delete from ans_rooms where code = upper(p_code) and teacher_key = p_key
  returning true;
$$;

revoke all on function public.ans_open(text, boolean)                              from public;
revoke all on function public.ans_set_cur(text, text, jsonb)                       from public;
revoke all on function public.ans_room(text)                                       from public;
revoke all on function public.ans_submit(text, text, text, text, text, text, text) from public;
revoke all on function public.ans_list(text, text, bigint)                         from public;
revoke all on function public.ans_close(text, text)                                from public;
grant execute on function public.ans_open(text, boolean)                              to anon, authenticated;
grant execute on function public.ans_set_cur(text, text, jsonb)                       to anon, authenticated;
grant execute on function public.ans_room(text)                                       to anon, authenticated;
grant execute on function public.ans_submit(text, text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.ans_list(text, text, bigint)                         to anon, authenticated;
grant execute on function public.ans_close(text, text)                                to anon, authenticated;


-- 학생 답 모으기 · 2판 더하기 (Supabase A · vbvtnmnodeoocbbjauap)
-- answers.sql 을 이미 돌린 뒤에 이 파일을 SQL Editor 에 붙여 넣고 Run. 여러 번 돌려도 됩니다.
--
-- 더하는 것: 지금 보고 있는 학생 수와 나간 학생(번호)을 선생님이 볼 수 있게
--   ans_people       : 방마다 기기 한 줄(번호 · 보는 중/나감 · 마지막 신호 시각 · 나간 횟수). 직접 접근은 막는다.
--   ans_room_ping    : 학생 페이지가 2초마다 부른다. 방 정보를 돌려주면서 「보는 중」 신호를 남긴다.
--                      다른 앱으로 넘어가거나 창을 닫으면 state='away' 로 한 번 부른다.
--   ans_people_list  : 선생님이 방 열쇠로 기기 목록을 본다(ago = 마지막 신호 뒤 지난 초).
-- 방을 지우면(ans_close) 이 줄들도 함께 지워진다.

create table if not exists public.ans_people (
  code       text not null references public.ans_rooms(code) on delete cascade,
  device     text not null,
  num        text,
  state      text not null default 'here',
  joined_at  timestamptz not null default now(),
  seen_at    timestamptz not null default now(),
  left_count int not null default 0,
  primary key (code, device)
);
alter table public.ans_people enable row level security;
revoke all on public.ans_people from anon, authenticated;

create or replace function public.ans_room_ping(p_code text, p_device text, p_num text, p_state text)
returns table(title text, cur jsonb, use_number boolean)
language plpgsql security definer set search_path = public as $$
#variable_conflict use_column
declare
  c text := upper(p_code);
  s text := case when p_state = 'away' then 'away' else 'here' end;
begin
  if not exists (select 1 from ans_rooms r where r.code = c) then return; end if;
  if coalesce(length(p_device), 0) >= 8 then
    insert into ans_people as p (code, device, num, state, seen_at)
    values (c, left(p_device, 40), left(nullif(trim(coalesce(p_num, '')), ''), 10), s, now())
    on conflict (code, device) do update
      set num = coalesce(excluded.num, p.num),
          left_count = p.left_count + case when excluded.state = 'away' and p.state <> 'away' then 1 else 0 end,
          state = excluded.state,
          seen_at = now();
  end if;
  return query select r.title, r.cur, r.use_number from ans_rooms r where r.code = c;
end $$;

create or replace function public.ans_people_list(p_code text, p_key text)
returns table(device text, num text, state text, ago int, left_count int)
language sql security definer set search_path = public stable as $$
  select p.device, p.num, p.state, extract(epoch from (now() - p.seen_at))::int, p.left_count
  from ans_people p join ans_rooms r on r.code = p.code
  where r.code = upper(p_code) and r.teacher_key = p_key
  order by p.joined_at;
$$;

revoke all on function public.ans_room_ping(text, text, text, text) from public;
revoke all on function public.ans_people_list(text, text)           from public;
grant execute on function public.ans_room_ping(text, text, text, text) to anon, authenticated;
grant execute on function public.ans_people_list(text, text)           to anon, authenticated;

-- 서버가 새 표·함수를 바로 알아보게 한다
notify pgrst, 'reload schema';

-- 확인: 아래가 ans_people_list, ans_room_ping 두 줄을 돌려주면 끝
select proname from pg_proc where proname in ('ans_room_ping', 'ans_people_list') order by 1;


-- 학생 답 모으기 · 3판 더하기 (Supabase A · vbvtnmnodeoocbbjauap)
-- answers.sql, answers_v2.sql 을 돌린 뒤에 이 파일을 SQL Editor 에 붙여 넣고 Run. 여러 번 돌려도 됩니다.
--
-- 바꾸는 것: 답 종류 이름을 다섯 가지로 묶어 두던 것을 「영어 소문자 2~12자」로 넓힌다.
--   그래프 예측(sketch)부터 받고, 앞으로 새 종류를 더해도 SQL 을 다시 돌리지 않게 한다.
--   나머지(빈 답·500자 넘는 답·짧은 기기 값 거부, 10초에 8번 제한, 같은 기기 앞 답 바꿔 쓰기)는 그대로.

create or replace function public.ans_submit(p_code text, p_qid text, p_kind text, p_prompt text, p_body text, p_num text, p_device text)
returns boolean
language plpgsql security definer set search_path = public as $$
declare c text := upper(p_code);
begin
  if not exists (select 1 from ans_rooms r where r.code = c) then return false; end if;
  if coalesce(p_kind, '') !~ '^[a-z]{2,12}$' then return false; end if;
  if coalesce(length(trim(p_body)), 0) = 0 or length(p_body) > 500 then return false; end if;
  if coalesce(length(p_device), 0) < 8 then return false; end if;
  -- 한 기기가 10초에 8번 넘게 보내면 받지 않는다
  if (select count(*) from ans_answers a where a.device = p_device and a.created_at > now() - interval '10 seconds') >= 8 then
    return false;
  end if;
  if p_kind <> 'ask' then
    delete from ans_answers a where a.code = c and a.qid = left(p_qid, 40) and a.device = left(p_device, 40);
  end if;
  insert into ans_answers(code, qid, kind, prompt, body, num, device)
  values (c, left(p_qid, 40), p_kind, left(coalesce(p_prompt, ''), 300), trim(p_body),
          left(nullif(trim(coalesce(p_num, '')), ''), 10), left(p_device, 40));
  update ans_rooms set touched_at = now() where code = c;
  return true;
end $$;

revoke all on function public.ans_submit(text, text, text, text, text, text, text) from public;
grant execute on function public.ans_submit(text, text, text, text, text, text, text) to anon, authenticated;

-- 서버가 바뀐 함수를 바로 알아보게 한다
notify pgrst, 'reload schema';

-- 확인: 「설치 끝」 한 줄이 나오면 됩니다
select case when (select count(*) from pg_proc where proname in ('ans_open','ans_set_cur','ans_room','ans_submit','ans_list','ans_close','ans_room_ping','ans_people_list')) >= 8
             and (select prosrc from pg_proc where proname = 'ans_submit' limit 1) like '%a-z]{2,12}%'
            then '설치 끝' else '설치가 덜 됐습니다. 다시 Run 을 눌러 주세요' end as 확인;
