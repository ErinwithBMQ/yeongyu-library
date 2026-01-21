import { supabase } from '@/lib/supabaseClient';
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

    let query = supabase
        .from('works')
        .select(`
            *,
            work_tags (
                tag_id,
                tags (
                    id,
                    name,
                    category
                )
            )
        `, { count: 'exact' });

    // 筛选逻辑：是否使用了标签筛选 (交集筛选)
    if (filterTagIds && filterTagIds.length > 0) {
        // 第一步：找出包含所有指定标签的作品ID
        // 我们需要找到 work_id，它在 work_tags 表中出现的次数等于 filterTagIds 的长度
        // (前提是每个作品每个标签只出现一次，这在数据库约束中通常是成立的)

        const { data: tagMatches, error: tagError } = await supabase
            .from('work_tags')
            .select('work_id, tag_id')
            .in('tag_id', filterTagIds);

        if (tagError) {
            console.error('Error fetching tag matches:', tagError);
            throw tagError;
        }

        if (!tagMatches || tagMatches.length === 0) {
            return { data: [], total: 0 };
        }

        // 统计每个 work_id 匹配到的标签数量
        const workIdCounts: Record<number, number> = {};
        tagMatches.forEach(item => {
            workIdCounts[item.work_id] = (workIdCounts[item.work_id] || 0) + 1;
        });

        // 筛选出拥有所有目标标签的 work_id
        const validWorkIds = Object.keys(workIdCounts)
            .map(id => parseInt(id))
            .filter(id => workIdCounts[id] === filterTagIds.length);

        if (validWorkIds.length === 0) {
            return { data: [], total: 0 };
        }

        // 第二步：在主查询中限定 ID 范围
        query = query.in('id', validWorkIds);
    }

    // 1. 排序
    if (sort === 'newest') {
        query = query.order('created_at', { ascending: false });
    } else {
        query = query.order('created_at', { ascending: true });
    }

    // 2. 搜索 (模糊匹配 标题 或 作者名)
    if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,author_name.ilike.%${searchQuery}%`);
    }

    // 3. 分页 (Supabase range 是 0-based)
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
        console.error('Error fetching works:', error);
        throw error;
    }

    // 数据格式转换
    const formattedData: WorkWithTags[] = (data || []).map((item: any) => ({
        ...item,
        tags: item.work_tags?.map((wt: any) => wt.tags).filter(Boolean) || []
    }));

    return {
        data: formattedData,
        total: count || 0
    };
};

/**
 * 根据筛选条件随机获取一个作品ID
 */
export const getRandomWorkId = async ({
    searchQuery,
    filterTagIds = []
}: Pick<GetWorksParams, 'searchQuery' | 'filterTagIds'> = {}): Promise<number | null> => {
    let query = supabase.from('works').select('id');

    // Reuse filter logic
    if (filterTagIds && filterTagIds.length > 0) {
        const { data: tagMatches, error: tagError } = await supabase
            .from('work_tags')
            .select('work_id, tag_id')
            .in('tag_id', filterTagIds);

        if (tagError) {
            console.error('Error fetching tag matches:', tagError);
            throw tagError;
        }

        if (!tagMatches || tagMatches.length === 0) {
            return null;
        }

        const workIdCounts: Record<number, number> = {};
        tagMatches.forEach(item => {
            workIdCounts[item.work_id] = (workIdCounts[item.work_id] || 0) + 1;
        });

        const validWorkIds = Object.keys(workIdCounts)
            .map(id => parseInt(id))
            .filter(id => workIdCounts[id] === filterTagIds.length);

        if (validWorkIds.length === 0) {
            return null;
        }
        query = query.in('id', validWorkIds);
    }

    if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,author_name.ilike.%${searchQuery}%`);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching random work candidates:', error);
        return null;
    }

    if (!data || data.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex].id;
};

/**
 * 获取单个作品详情
 */
export const getWorkById = async (id: number): Promise<WorkWithTags | null> => {
    const { data, error } = await supabase
        .from('works')
        .select(`
      *,
      work_tags (
        tag_id,
        tags (
          id,
          name,
          category
        )
      )
    `)
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching work by id:', error);
        return null;
    }

    // 数据格式转换
    const formattedData: WorkWithTags = {
        ...data,
        tags: data.work_tags?.map((wt: any) => wt.tags).filter(Boolean) || []
    };

    return formattedData;
};


/**
 * 添加新作品 (包含标签关联)
 * 注意：需要登录状态 (RLS会拦截)
 */
export const createWork = async (params: CreateWorkParams) => {
    // 获取当前用户ID作为提交者
    const { data: { user } } = await supabase.auth.getUser();

    // 1. 插入 Works 表
    const { data: workData, error: workError } = await supabase
        .from('works')
        .insert({
            title: params.title,
            author_name: params.author_name,
            original_url: params.original_url,
            platform: params.platform,
            summary: params.summary,
            submitter_id: user?.id
        })
        .select()
        .single();

    if (workError) throw workError;
    if (!workData) throw new Error('Failed to create work');

    // 2. 如果有标签，插入 Work_Tags 关联表
    if (params.tag_ids && params.tag_ids.length > 0) {
        const workTagsInsert = params.tag_ids.map(tagId => ({
            work_id: workData.id,
            tag_id: tagId
        }));

        const { error: tagError } = await supabase
            .from('work_tags')
            .insert(workTagsInsert);

        if (tagError) {
            // 这里的处理策略看需求：如果标签插入失败，是回滚删除作品，还是仅仅报错？
            // 简单起见，暂时只打印错误
            console.error('Error adding tags to work:', tagError);
        }
    }

    return workData;
};

/**
 * 删除作品
 * 由于设置了 cascade delete，关联的 work_tags 会自动删除
 */
export const deleteWork = async (id: number) => {
    const { error } = await supabase
        .from('works')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return true;
};

/**
 * 更新作品信息
 * 支持更新：original_url, platform, summary, tags
 * 注意：title 和 author_name 通常不建议更改，除非特定需求
 */
export const updateWork = async (id: number, params: Partial<CreateWorkParams>) => {
    // 1. 更新 Works 表基本字段
    const updates: any = {};
    if (params.original_url !== undefined) updates.original_url = params.original_url;
    if (params.platform !== undefined) updates.platform = params.platform;
    if (params.summary !== undefined) updates.summary = params.summary;
    // 如果需要允许修改标题作者，也可以解开注释
    // if (params.title !== undefined) updates.title = params.title;
    // if (params.author_name !== undefined) updates.author_name = params.author_name;

    if (Object.keys(updates).length > 0) {
        const { error: workError } = await supabase
            .from('works')
            .update(updates)
            .eq('id', id);

        if (workError) throw workError;
    }

    // 2. 更新标签 (全量替换策略：先删后加)
    if (params.tag_ids !== undefined) {
        // 2.1 删除旧的关联
        const { error: deleteTagsError } = await supabase
            .from('work_tags')
            .delete()
            .eq('work_id', id);

        if (deleteTagsError) throw deleteTagsError;

        // 2.2 插入新的关联
        if (params.tag_ids.length > 0) {
            const workTagsInsert = params.tag_ids.map(tagId => ({
                work_id: id,
                tag_id: tagId
            }));

            const { error: insertTagsError } = await supabase
                .from('work_tags')
                .insert(workTagsInsert);

            if (insertTagsError) throw insertTagsError;
        }
    }

    return true;
};

