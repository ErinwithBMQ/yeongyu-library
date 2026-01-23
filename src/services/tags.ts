import { Tag } from '@/types';
import { fetchApi } from '@/lib/apiClient';

/**
 * 获取所有标签
 * @returns Promise<Tag[]> 返回数据库中所有的标签列表
 */
export const getAllTags = async (): Promise<Tag[]> => {
    return fetchApi<Tag[]>('/tags');
};


// 定义特定分类下标签的自定义排序顺序
const CUSTOM_TAG_ORDER: Record<string, string[]> = {
    '篇幅': ['短打（1w以内）', '短篇（1w~2w）', '中篇（2w~4w）', '长篇（4w字以上）'],
    // 可以在这里添加其他分类的排序规则
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

    // 应用自定义排序
    Object.keys(grouped).forEach(category => {
        if (CUSTOM_TAG_ORDER[category]) {
            const orderList = CUSTOM_TAG_ORDER[category];
            grouped[category].sort((a, b) => {
                const indexA = orderList.indexOf(a.name);
                const indexB = orderList.indexOf(b.name);
                if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                if (indexA !== -1) return -1;
                if (indexB !== -1) return 1;
                return a.name.localeCompare(b.name, 'zh-CN');
            });
        }
    });

    return grouped;
};
