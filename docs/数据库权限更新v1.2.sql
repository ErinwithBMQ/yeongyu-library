-- 1. (如果之前创建过) 删除旧的“仅限作者修改”策略
drop policy if exists "Users can update own works" on works;

-- 2. 创建新的宽松策略：允许任何登录用户修改作品
-- 只要用户已登录 (role = authenticated)，就可以修改 works 表的任意记录
create policy "Authenticated users can update works" on works for update
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');


-- 3. (可选) 关于删除权限
-- 目前只有作者本人可以删除。如果您希望“任何登录用户都能删除别人上传的作品”，
-- 请取消注释下面这两行代码并运行：

-- drop policy if exists "Users can delete own works" on works;
-- create policy "Authenticated users can delete works" on works for delete using (auth.role() = 'authenticated');
