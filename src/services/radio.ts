import { RadioMessage } from '@/types';
import { fetchApi } from '@/lib/apiClient';

/**
 * 提交留言需要的参数
 */
export interface CreateMessageParams {
    nickname: string;
    content: string;
    linked_work_id?: number;
    participate_in_winter_letter_storage: boolean;
}

/**
 * 获取电台留言
 * @param page 页码
 * @param pageSize 每页条数
 * @returns 留言列表和总数
 */
export const getRadioMessages = async (page = 1, pageSize = 10) => {
    return fetchApi<{
        data: (RadioMessage & {
            linked_work?: { id: number; title: string; author_name: string };
            reactions?: { emoji: string; count: number; userReacted: boolean }[];
        })[];
        total: number;
    }>('/radio', {
        params: { page, pageSize }
    });
};

/**
 * 发送新留言
 * 需要登录 (RLS)
 */
export const postRadioMessage = async (params: CreateMessageParams) => {
    return fetchApi('/radio', {
        method: 'POST',
        body: JSON.stringify(params),
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

/**
 * 获取某条留言的互动信息
 * @param messageId 留言ID
 * @returns 互动列表 { emoji, count, userReacted }
 */
export const getMessageReactions = async (messageId: number) => {
    return fetchApi<{ emoji: string; count: number; userReacted: boolean }[]>(`/radio/${messageId}/reactions`);
};

/**
 * 切换对某条留言的表情表态 (Toggle)
 * @param messageId 留言ID
 * @param emoji 表情符号
 */
export const toggleReaction = async (messageId: number, emoji: string) => {
    return fetchApi(`/radio/${messageId}/reactions`, {
        method: 'POST',
        body: JSON.stringify({ emoji }),
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

