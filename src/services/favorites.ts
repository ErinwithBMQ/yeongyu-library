import { FavoriteFolder, Work } from '@/types';
import { fetchApi } from '@/lib/apiClient';

/**
 * 获取当前用户的所有收藏夹
 */
export const getMyFolders = async () => {
    // fetchApi automatically attaches token if logged in
    return fetchApi<FavoriteFolder[]>('/favorites/folders');
};

/**
 * 创建新收藏夹
 */
export const createFolder = async (name: string) => {
    return fetchApi<FavoriteFolder>('/favorites/folders', {
        method: 'POST',
        body: JSON.stringify({ name })
    });
};

/**
 * 删除收藏夹
 */
export const deleteFolder = async (folderId: number) => {
    return fetchApi(`/favorites/folders/${folderId}`, {
        method: 'DELETE'
    });
};

/**
 * 获取收藏夹内的作品列表
 */
export const getFolderWorks = async (folderId: number) => {
    return fetchApi<(Work & { added_at: string, tags: any[] })[]>(`/favorites/folders/${folderId}/works`);
};

/**
 * 将作品添加到收藏夹
 */
export const addWorkToFolder = async (folderId: number, workId: number) => {
    return fetchApi('/favorites/entries', {
        method: 'POST',
        body: JSON.stringify({ folderId, workId })
    });
};

/**
 * 从收藏夹移除作品
 */
export const removeWorkFromFolder = async (folderId: number, workId: number) => {
    return fetchApi('/favorites/entries', {
        method: 'DELETE',
        params: { folderId, workId }
    });
};

/**
 * 检查作品被当前用户收藏在哪些文件夹中
 */
export const checkWorkInFolders = async (workId: number) => {
    try {
        return await fetchApi<number[]>('/favorites/entries', {
            params: { workId }
        });
    } catch (e) {
        // Assume failure means not logged in or error, return empty
        return [];
    }
};
