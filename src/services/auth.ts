import { supabase } from '@/lib/supabaseClient';
import { fetchApi } from '@/lib/apiClient';

/**
 * 用户注册（通过糖点测试后使用已验证邮箱注册）
 */
export const signUp = async (
    email: string,
    password: string,
    username: string
) => {
    return fetchApi<any>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, username }),
    });
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

/**
 * 发送重置密码邮件
 */
export const sendPasswordResetEmail = async (email: string) => {
    const redirectTo = typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback?next=/reset-password`
        : undefined;

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
    });

    if (error) throw error;
    return data;
};
