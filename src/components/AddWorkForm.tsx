'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getTagsGroupedByCategory } from '@/services/tags';
import { createWork } from '@/services/works';
import { Tag } from '@/types';

export default function AddWorkForm() {
    const router = useRouter();
    const [groupedTags, setGroupedTags] = useState<Record<string, Tag[]>>({});
    const [loadingTags, setLoadingTags] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // 表单状态
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [url, setUrl] = useState('');
    const [platform, setPlatform] = useState('');
    const [summary, setSummary] = useState('');
    const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

    // 加载标签
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const tags = await getTagsGroupedByCategory();
                setGroupedTags(tags);
            } catch (error) {
                console.error('加载标签失败', error);
                alert('无法加载标签，请稍后刷新重试');
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

        if (!title || !author || !url || !platform) {
            alert('请填写标星(*)的必填项');
            return;
        }

        setSubmitting(true);
        try {
            await createWork({
                title,
                author_name: author,
                original_url: url,
                platform,
                summary,
                tag_ids: selectedTagIds
            });
            alert('✅ 作品添加成功！');
            router.push('/library'); // 跳转回图书馆首页
            router.refresh(); // 刷新数据
        } catch (error: any) {
            console.error('提交失败', error);
            alert('❌ 提交失败: ' + (error.message || '未知错误'));
        } finally {
            setSubmitting(false);
        }
    };

    // 定义分类的显示顺序（可选，为了更好看）
    const categoryOrder = ['类型', '世界观', '篇幅', '进度', '情感', '剧情', '预警', '人设', '特殊设定', '幻想设定'];
    // 获取所有实际存在的分类key
    const existingCategories = Object.keys(groupedTags);
    // 合并排序：优先显示定义的顺序，剩下的按原样放后面
    const sortedCategories = [
        ...categoryOrder.filter(c => existingCategories.includes(c)),
        ...existingCategories.filter(c => !categoryOrder.includes(c))
    ];

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
                            value={title} onChange={e => setTitle(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-sakura focus:ring-2 focus:ring-sakura-light outline-none transition"
                            placeholder="填写作品名称，不需要书名号"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">作者 <span className="text-red-500">*</span></label>
                        <input
                            type="text" required
                            value={author} onChange={e => setAuthor(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-sakura focus:ring-2 focus:ring-sakura-light outline-none transition"
                            placeholder="可以直接复制发表平台上的作者名"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">发布平台 <span className="text-red-500">*</span></label>
                        <input
                            type="text" required
                            value={platform} onChange={e => setPlatform(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-sakura focus:ring-2 focus:ring-sakura-light outline-none transition"
                            placeholder="例如：微博、Lofter、ao3、亚洲网、B站等"
                        />
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
                    {submitting ? '添加中...' : '确认添加'}
                </button>
            </div>

        </form>
    );
}
