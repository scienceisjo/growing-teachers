-- ═══════════════════════════════════════════════════════════════
-- 맛집 지도 · 표 만들기 (내 Supabase 프로젝트의 SQL Editor 에 붙여 넣고 Run)
-- 표 이름: matjip
--   shop = 가게 이름 · memo = 한 줄 추천 · who = 올린 사람(별명)
--   lat, lng = 지도에서 누른 자리의 위도와 경도
-- 다시 Run 해도 안전합니다(있으면 건너뜀).
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.matjip (
  id         bigint generated always as identity primary key,
  shop       text not null,
  memo       text not null default '',
  who        text not null default '',
  lat        double precision not null,
  lng        double precision not null,
  created_at timestamptz not null default now()
);

-- 규칙(RLS)을 켭니다. 켜지 않으면 주소와 키를 아는 누구나 모든 줄을 고치고 지울 수 있습니다.
alter table public.matjip enable row level security;

-- 앱에서 쓰는 열쇠(anon)에게 읽기와 넣기만 허락합니다.
grant select, insert on public.matjip to anon, authenticated;
grant usage on sequence public.matjip_id_seq to anon, authenticated;

drop policy if exists "matjip read"   on public.matjip;
drop policy if exists "matjip insert" on public.matjip;
create policy "matjip read"   on public.matjip for select to anon using (true);
create policy "matjip insert" on public.matjip for insert to anon
  with check (
    length(shop) between 1 and 40
    and length(memo) <= 150
    and length(who) <= 30
    and lat between 33 and 39        -- 우리나라 근처만 받습니다
    and lng between 124 and 132
  );
-- 고치기와 지우기 규칙은 만들지 않았습니다. 지울 때는 Table Editor 에서 직접 지웁니다.

-- 확인: 0 이 나오면 표가 만들어진 것입니다.
select count(*) as 줄_수 from public.matjip;
