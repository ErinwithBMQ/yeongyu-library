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

    // 3. 标记邀请码已使用 (调用 RPC 函数)
    const { error: updateError } = await supabase.rpc('mark_invite_used', {
        invite_id: codeData.id
    });

    if (updateError) {
        console.error('Warning: Failed to mark invite code as used', updateError);
        // 这里只是标记失败，用户其实已经注册成功了，所以不抛出阻断性错误
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

/**
 * 用户登录
 */
export const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;
    return data;
};

/**
 * 用户登出
 */
export const signOut = async () => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    } catch (error: any) {
        // 如果错误是因为 Session 丢失，则视为退出成功，忽略报错
        if (error.message?.includes('session missing') || error.name === 'AuthSessionMissingError') {
            console.warn('Supabase signOut: Session already missing, treating as success');
            return;
        }
        throw error;
    }
};

/**
 * 修改密码
 */
export const updatePassword = async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({
        password: password
    });

    if (error) throw error;
    return data;
};
