import { supabase } from '@/lib/supabaseClient';
import { RadioMessage } from '@/types';

/**
 * 提交留言需要的参数
 */
export interface CreateMessageParams {
    nickname: string;
    content: string;
    linked_work_id?: number;
}

/**
 * 获取电台留言
 * @param page 页码
 * @param pageSize 每页条数
 * @returns 留言列表和总数
 */
export const getRadioMessages = async (page = 1, pageSize = 10) => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
        .from('radio_messages')
        .select(`
      *,
      linked_work:works (
        id,
        title,
        author_name
      )
    `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) throw error;

    return {
        data: data as (RadioMessage & { linked_work?: { title: string, author_name: string } })[],
        total: count || 0
    };
};

/**
 * 发送新留言
 * 需要登录 (RLS)
 */
export const postRadioMessage = async (params: CreateMessageParams) => {
    // 需确认当前用户是否登录，虽然 RLS 会拦截，但在 JS 层获取 user_id 也是必要的
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('未登录，无法留言');

    const { data, error } = await supabase
        .from('radio_messages')
        .insert({
            user_id: user.id,
            nickname: params.nickname,
            content: params.content,
            linked_work_id: params.linked_work_id
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};
