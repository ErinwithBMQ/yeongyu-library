'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getTagsGroupedByCategory } from '@/services/tags';
import { createWork, updateWork } from '@/services/works';
import { Tag, WorkWithTags } from '@/types';
import { toast } from 'sonner';

interface AddWorkFormProps {
    initialData?: WorkWithTags; // 编辑模式下的初始数据
    isEditMode?: boolean;       // 是否为编辑模式
}

export default function AddWorkForm({ initialData, isEditMode = false }: AddWorkFormProps) {
    const router = useRouter();
    const [groupedTags, setGroupedTags] = useState<Record<string, Tag[]>>({});
    const [loadingTags, setLoadingTags] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // 表单状态
    const [title, setTitle] = useState(initialData?.title || '');
    const [author, setAuthor] = useState(initialData?.author_name || '');
    const [url, setUrl] = useState(initialData?.original_url || '');
    const [platform, setPlatform] = useState(initialData?.platform || '');
    const [summary, setSummary] = useState(initialData?.summary || '');
    const [selectedTagIds, setSelectedTagIds] = useState<number[]>(
        initialData?.tags?.map(t => t.id) || []
    );

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setAuthor(initialData.author_name);
            setUrl(initialData.original_url);
            setPlatform(initialData.platform);
            setSummary(initialData.summary || '');
            setSelectedTagIds(initialData.tags?.map(t => t.id) || []);
        }
    }, [initialData]);

    // 加载标签
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const tags = await getTagsGroupedByCategory();
                setGroupedTags(tags);
            } catch (error) {
                console.error('加载标签失败', error);
                toast.error('无法加载标签，请稍后刷新重试');
            } finally {
                setLoadingTags(false);
            }
        };
        fetchTags();
    }, []);

    // 切换标签选中状态
    const toggleTag = (tagId: number) => {
        setSelectedTagIds(prev =>
            prev.includes(tagId)
                ? prev.filter(id => id !== tagId)
                : [...prev, tagId]
        );
    };

    // 提交表单
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 验证必填项 (如果是编辑模式，标题作者通常是只读的，但这里还是校验一下以防万一)
        if (!title || !author || !url || !platform) {
            toast.warning('请填写标星(*)的必填项');
            return;
        }

        setSubmitting(true);
        try {
            if (isEditMode && initialData) {
                // 编辑模式 update
                await updateWork(initialData.id, {
                    original_url: url,
                    platform,
                    summary,
                    author_name: author,
                    tag_ids: selectedTagIds
                });
                toast.success('作品更新成功！');
                router.push(`/library/${initialData.id}`);
            } else {
                // 创建模式 create
                await createWork({
                    title,
                    author_name: author,
                    original_url: url,
                    platform,
                    summary,
                    tag_ids: selectedTagIds
                });
                toast.success('作品添加成功！');
                router.push('/library');
            }
            router.refresh();
        } catch (error: any) {
            console.error('提交失败', error);
            toast.error('操作失败: ' + (error.message || '未知错误'));
        } finally {
            setSubmitting(false);
        }
    };

    // 定义分类的显示顺序（可选，为了更好看）
    const categoryOrder = ['类型', '世界观', '篇幅', '进度', '预警', '情感', '背景', '剧情', '人设', '特殊设定', '幻想设定'];
    // 获取所有实际存在的分类key
    const existingCategories = Object.keys(groupedTags);
    // 合并排序：优先显示定义的顺序，剩下的按原样放后面
    const sortedCategories = [
        ...categoryOrder.filter(c => existingCategories.includes(c)),
        ...existingCategories.filter(c => !categoryOrder.includes(c))
    ];

    // 平台选项
    const PLATFORM_OPTIONS = ['微博', 'LOFTER', 'ao3', '亚洲网', 'B站', '小红书', '其他平台'];

    if (loadingTags) {
        return <div className="p-8 text-center text-gray-500">正在加载标签库...</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 bg-white p-6 sm:p-10 rounded-2xl border border-sakura/50">

            {/* 1. 基本信息区域 */}
            <section className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-2">基本信息</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">作品名称 <span className="text-red-500">*</span></label>
                        <input
                            type="text" required
                            disabled={isEditMode}
                            value={title} onChange={e => setTitle(e.target.value)}
                            className={`w-full px-4 py-2 rounded-lg border border-gray-200 outline-none transition ${isEditMode ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'focus:border-sakura focus:ring-2 focus:ring-sakura-light'}`}
                            placeholder="填写作品名称，不需要书名号"
                        />
                        {isEditMode && <p className="text-xs text-gray-400">作品名称不支持修改。</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">作者 <span className="text-red-500">*</span></label>
                        <input
                            type="text" required
                            value={author} onChange={e => setAuthor(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none transition focus:border-sakura focus:ring-2 focus:ring-sakura-light"
                            placeholder="可以直接复制发表平台上的作者名"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="platform-select" className="block text-sm font-medium text-gray-700">发布平台 <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <select
                                id="platform-select"
                                required
                                value={platform}
                                onChange={e => setPlatform(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-700 focus:border-sakura focus:ring-2 focus:ring-sakura-light outline-none transition appearance-none bg-white"
                            >
                                <option value="" disabled>请选择平台</option>
                                {PLATFORM_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">直达链接 (URL) <span className="text-red-500">*</span></label>
                        <input
                            type="url" required
                            value={url} onChange={e => setUrl(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-sakura focus:ring-2 focus:ring-sakura-light outline-none transition"
                            placeholder="有效连接格式，以 https:// 开头"
                        />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                        <label className="block text-sm font-medium text-gray-700">简介 (选填)</label>
                        <textarea
                            value={summary} onChange={e => setSummary(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-sakura focus:ring-2 focus:ring-sakura-light outline-none transition"
                            placeholder="可以复制发表平台上的简介..."
                        />
                    </div>
                </div>
            </section>

            {/* 2. 标签选择区域 */}
            <section className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-2">
                    标签选择
                    <span className="text-sm font-normal text-gray-500 ml-4">已选: {selectedTagIds.length}</span>
                </h2>

                <div className="space-y-6">
                    {sortedCategories.map(category => (
                        <div key={category} className="space-y-3">
                            <h3 className="text-sm font-semibold text-gray-600 bg-gray-50 inline-block px-2 py-1 rounded">{category}</h3>
                            <div className="flex flex-wrap gap-2">
                                {groupedTags[category].map(tag => {
                                    const isSelected = selectedTagIds.includes(tag.id);
                                    return (
                                        <button
                                            key={tag.id}
                                            type="button"
                                            onClick={() => toggleTag(tag.id)}
                                            className={`
                        px-3 py-1.5 rounded-full text-sm transition-all duration-200 border
                        ${isSelected
                                                    ? 'bg-sakura-light text-bamguet-dark border-sakura font-medium scale-105'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-sakura hover:text-bamguet-dark'
                                                }
                      `}
                                        >
                                            {tag.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 3. 提交按钮 */}
            <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition font-medium"
                >
                    取消
                </button>
                <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-2.5 rounded-xl bg-bamguet-dark text-white hover:brightness-110 transition font-bold disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {submitting ? '提交中...' : (isEditMode ? '保存修改' : '确认添加')}
                </button>
            </div>

        </form>
    );
}
