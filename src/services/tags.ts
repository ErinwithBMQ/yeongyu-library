import { supabase } from '@/lib/supabaseClient';
import { Tag } from '@/types';

/**
 * 获取所有标签
 * @returns Promise<Tag[]> 返回数据库中所有的标签列表
 */
export const getAllTags = async (): Promise<Tag[]> => {
    const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching tags:', error);
        throw error;
    }

    return data || [];
};

/**
 * 按分类获取标签，返回一个分组后的对象
 * @returns Promise<Record<string, Tag[]>> 例如: { "类型": [Tag1, Tag2], "情感": [Tag3...] }
 */
export const getTagsGroupedByCategory = async (): Promise<Record<string, Tag[]>> => {
    const tags = await getAllTags();

    const grouped = tags.reduce((acc, tag) => {
        if (!acc[tag.category]) {
            acc[tag.category] = [];
        }
        acc[tag.category].push(tag);
        return acc;
    }, {} as Record<string, Tag[]>);

    return grouped;
};
