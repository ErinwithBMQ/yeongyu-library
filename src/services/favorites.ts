import { supabase } from '@/lib/supabaseClient';
import { FavoriteFolder, Work } from '@/types';

/**
 * 获取当前用户的所有收藏夹
 */
export const getMyFolders = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('未登录');

    const { data, error } = await supabase
        .from('favorite_folders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as FavoriteFolder[];
};

/**
 * 创建新收藏夹
 */
export const createFolder = async (name: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('未登录');

    const { data, error } = await supabase
        .from('favorite_folders')
        .insert({
            user_id: user.id,
            name
        })
        .select()
        .single();

    if (error) throw error;
    return data as FavoriteFolder;
};

/**
 * 删除收藏夹
 */
export const deleteFolder = async (folderId: number) => {
    const { error } = await supabase
        .from('favorite_folders')
        .delete()
        .eq('id', folderId);

    if (error) throw error;
};

/**
 * 获取收藏夹内的作品列表
 */
export const getFolderWorks = async (folderId: number) => {
    const { data, error } = await supabase
        .from('folder_entries')
        .select(`
            created_at,
            work:works (
                id,
                title,
                author_name,
                original_url,
                platform,
                summary,
                created_at
            )
        `)
        .eq('folder_id', folderId)
        .order('created_at', { ascending: false });

    if (error) throw error;

    // 格式化返回数据，将 work 属性展平
    return data.map((item: any) => ({
        ...item.work,
        added_at: item.created_at
    })) as (Work & { added_at: string })[];
};

/**
 * 将作品添加到收藏夹
 */
export const addWorkToFolder = async (folderId: number, workId: number) => {
    const { error } = await supabase
        .from('folder_entries')
        .insert({
            folder_id: folderId,
            work_id: workId
        });

    if (error) {
        // 忽略重复添加的错误 (Postgres unique constraint violation code is 23505)
        if (error.code === '23505') return;
        throw error;
    }
};

/**
 * 从收藏夹移除作品
 */
export const removeWorkFromFolder = async (folderId: number, workId: number) => {
    const { error } = await supabase
        .from('folder_entries')
        .delete()
        .eq('folder_id', folderId)
        .eq('work_id', workId);

    if (error) throw error;
};

/**
 * 检查作品被当前用户收藏在哪些文件夹中
 */
export const checkWorkInFolders = async (workId: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // 这里需要两步查询，或者一个复杂的 join
    // 简单起见：先查出包含该作品的所有 folder_id，再筛选由于 user_id 是当前用户的 folders
    // 或者利用 RLS，直接查 folder_entries 关联 favorite_folders

    const { data, error } = await supabase
        .from('folder_entries')
        .select('folder_id, favorite_folders!inner(user_id)')
        .eq('work_id', workId)
        .eq('favorite_folders.user_id', user.id);

    if (error) throw error;

    return data.map((item: any) => item.folder_id as number);
};
