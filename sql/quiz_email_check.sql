-- 补充：邮箱状态检测函数
-- 用于答题前检查邮箱是否已验证或已注册

create or replace function public.check_email_available(email_addr text)
returns table(is_verified boolean, is_registered boolean)
language plpgsql
security definer
as $$
begin
  -- 检查是否已在 verified_emails 中
  select exists(
    select 1 from public.verified_emails where email = email_addr
  ) into is_verified;

  -- 检查是否已注册（auth.users 中有记录）
  select exists(
    select 1 from auth.users where email = email_addr
  ) into is_registered;

  return next;
end;
$$;
