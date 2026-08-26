-- 冬信收纳局活动：一条留言可报名一次
create table if not exists public.radio_activity_participations (
  activity_key text not null,
  message_id bigint not null references public.radio_messages(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (activity_key, message_id)
);

create index if not exists idx_radio_activity_participations_message_id
  on public.radio_activity_participations(message_id);

alter table public.radio_activity_participations enable row level security;

create policy "Activity participations are public" on public.radio_activity_participations
  for select using (true);

-- 留言和活动报名在同一事务内写入，避免只成功其中一项。
create or replace function public.create_radio_message(
  p_nickname text,
  p_content text,
  p_linked_work_id bigint default null,
  p_participate_in_winter_letter_storage boolean default false
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  new_message_id bigint;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  insert into public.radio_messages (user_id, nickname, content, linked_work_id)
  values (auth.uid(), p_nickname, p_content, p_linked_work_id)
  returning id into new_message_id;

  if p_participate_in_winter_letter_storage then
    insert into public.radio_activity_participations (activity_key, message_id)
    values ('winter-letter-storage', new_message_id);
  end if;

  return new_message_id;
end;
$$;

revoke all on function public.create_radio_message(text, text, bigint, boolean) from public;
grant execute on function public.create_radio_message(text, text, bigint, boolean) to authenticated;
