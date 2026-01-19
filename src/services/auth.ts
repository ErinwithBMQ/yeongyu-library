import { supabase } from '@/lib/supabaseClient';

/**
 * 用户注册接口 (带邀请码校验)
 * 这是一个组合操作：先查邀请码，再注册，最后更新邀请码状态
 * 
 * ⚠️ 注意：这是前端模拟流程。
 * 在生产环境中，为了防止用户绕过邀请码检查直接调 Supabase API 注册，
 * 应该在 Supabase 端设置 Database Trigger 拒绝无邀请码注册，
 * 或者使用 Next.js API Route (后端) 来执行此操作。
 * 
 * 下面代码为了开发方便，先写在前端 Service 里。
 */
export const signUpWithInviteCode = async (
    email: string,
    password: string,
    code: string,
    username: string
) => {

    // 1. 检查邀请码是否有效且未被使用
    const { data: codeData, error: codeError } = await supabase
        .from('invite_codes')
        .select('*')
        .eq('code', code)
        .eq('email', email) // 必须匹配邮箱
        .single();

    if (codeError || !codeData) {
        throw new Error('邀请码无效或与邮箱不匹配');
    }

    if (codeData.is_used) {
        throw new Error('该邀请码已被使用');
    }

    // 2. 调用 Supabase 注册
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                username: username, // 存入 user_metadata
            }
        }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('注册失败');

    // 3. 标记邀请码已使用
    // 注意：普通用户可能没权限改 invite_codes 表。
    // 如果数据库 RLS 没开放 update 权限给 anon/public，这步在前端会失败。
    // 解决方案：使用 Postgres Function 或者简单的 API Route。
    // 为了不卡住流程，假设 invite_codes 表暂时开放了部分权限。
    const { error: updateError } = await supabase
        .from('invite_codes')
        .update({ is_used: true })
        .eq('id', codeData.id);

    if (updateError) {
        console.error('Warning: Failed to mark invite code as used', updateError);
    }

    return authData;
};

/**
 * 获取当前登录用户的 Profile 信息
 */
export const getCurrentProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }

    return data;
};
