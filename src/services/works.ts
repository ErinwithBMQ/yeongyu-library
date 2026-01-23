import { fetchApi } from '@/lib/apiClient';
import { Work, WorkWithTags } from '@/types';

/**
 * 创建新作品的参数接口
 */
export interface CreateWorkParams {
    title: string;
    author_name: string;
    original_url: string;
    platform: string;
    summary?: string;
    tag_ids?: number[]; // 选填：关联的标签ID列表
}

/**
 * 获取作品列表的筛选参数
 */
export interface GetWorksParams {
    page?: number;       // 页码，从1开始
    pageSize?: number;   // 每页数量
    sort?: 'newest' | 'oldest'; // 排序方式
    searchQuery?: string; // 搜索关键词(标题或作者)
    filterTagIds?: number[]; // 按多个标签筛选
}

/**
 * 从数据库获取作品列表
 * 支持分页、排序、搜索，并包含关联的标签信息
 */
export const getWorks = async ({
    page = 1,
    pageSize = 20,
    sort = 'newest',
    searchQuery,
    filterTagIds = []
}: GetWorksParams = {}) => {
    return fetchApi<{ data: WorkWithTags[]; total: number }>('/works', {
        params: {
            page,
            pageSize,
            sort,
            searchQuery,
            filterTagIds
        }
    });
};

/**
 * 根据筛选条件随机获取一个作品ID
 */
export const getRandomWorkId = async ({
    searchQuery,
    filterTagIds = []
}: Pick<GetWorksParams, 'searchQuery' | 'filterTagIds'> = {}): Promise<number | null> => {
    const res = await fetchApi<{ id: number | null }>('/works/random', {
        params: { searchQuery, filterTagIds }
    });
    return res.id;
};

/**
 * 获取单个作品详情
 */
export const getWorkById = async (id: number): Promise<WorkWithTags | null> => {
    return fetchApi<WorkWithTags | null>(`/works/${id}`);
};


/**
 * 添加新作品 (包含标签关联)
 * 注意：需要登录状态 (RLS会拦截)
 */
export const createWork = async (params: CreateWorkParams) => {
    return fetchApi<any>('/works', {
        method: 'POST',
        body: JSON.stringify(params)
    });
};

/**
 * 删除作品
 * 由于设置了 cascade delete，关联的 work_tags 会自动删除
 */
export const deleteWork = async (id: number) => {
    return fetchApi<boolean>(`/works/${id}`, {
        method: 'DELETE'
    });
};

/**
 * 更新作品信息
 * 支持更新：original_url, platform, summary, tags, author_name
 * 注意：title 不支持更改
 */
export const updateWork = async (id: number, params: Partial<CreateWorkParams>) => {
    return fetchApi<boolean>(`/works/${id}`, {
        method: 'PUT',
        body: JSON.stringify(params)
    });
};

