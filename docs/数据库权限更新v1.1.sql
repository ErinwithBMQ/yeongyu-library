-- 请在 Supabase 的 SQL Editor 中运行以下代码以更新权限和添加必要函数

-- 1. 邀请码表 (invite_codes)
-- 允许前端查询邀请码有效性
alter table invite_codes enable row level security;
create policy "Allow public read invite codes" on invite_codes for select using (true);

-- 创建一个安全函数来标记邀请码已使用 (绕过前端直接更新的权限限制)
create or replace function mark_invite_used(invite_id uuid)
returns void
language plpgsql
security definer -- 以管理员权限运行
as $$
begin
  update public.invite_codes
  set is_used = true
  where id = invite_id;
end;
$$;

-- 2. 作品表 (works)
-- 之前只有 insert 权限，补上 delete 权限 (允许作者删除自己的作品)
create policy "Users can delete own works" on works for delete using (auth.uid() = submitter_id);

-- 3. 标签相关表 (tags, work_tags)
-- 标签表：所有人可读
alter table tags enable row level security;
create policy "Public read tags" on tags for select using (true);
create policy "Authenticated insert tags" on tags for insert with check (auth.role() = 'authenticated'); -- 如果允许用户创建新标签

-- 作品标签关联表：所有人可读，登录用户可增删
alter table work_tags enable row level security;
create policy "Public read work_tags" on work_tags for select using (true);
create policy "Authenticated insert work_tags" on work_tags for insert with check (auth.role() = 'authenticated');
create policy "Authenticated delete work_tags" on work_tags for delete using (auth.role() = 'authenticated');

-- 4. 再次确认 profiles 表权限
-- 确保所有人能读取用户信息 (用于显示作者名、头像)
-- create policy "Public read profiles" on profiles for select using (true); 
-- (如果之前已经运行过文档里的 SQL，这一条应该已经有了)
