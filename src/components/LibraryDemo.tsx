'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

// 定义数据类型，对应数据库中的表结构
type Work = {
    id: number;
    created_at: string;
    title: string;
    author: string;
    platform: string;
    url: string;
};

export default function LibraryDemo() {
    const [works, setWorks] = useState<Work[]>([]);
    const [loading, setLoading] = useState(true);

    // 表单状态
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        platform: '',
        url: ''
    });

    // 1. 读取数据 (Read)
    // 对应的 SQL: SELECT * FROM works ORDER BY created_at DESC;
    const fetchWorks = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('works_old')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching works:', error);
        } else {
            setWorks(data || []);
        }
        setLoading(false);
    };

    // 页面加载时获取一次数据
    useEffect(() => {
        fetchWorks();
    }, []);

    // 2. 插入数据 (Create)
    // 对应的 SQL: INSERT INTO works (title, author, ...) VALUES (...);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.author) {
            alert('标题和作者是必填项');
            return;
        }

        const { error } = await supabase
            .from('works_old')
            .insert([formData]); // 插入的对象键名必须和数据库列名一致

        if (error) {
            alert('添加失败: ' + error.message);
        } else {
            alert('添加成功！');
            setFormData({ title: '', author: '', platform: '', url: '' }); // 清空表单
            fetchWorks(); // 刷新列表
        }
    };

    // 3. 删除数据 (Delete)
    // 对应的 SQL: DELETE FROM works WHERE id = ?;
    const handleDelete = async (id: number) => {
        const confirm = window.confirm('确定要删除这条记录吗？');
        if (!confirm) return;

        const { error } = await supabase
            .from('works_old')
            .delete()
            .eq('id', id);

        if (error) {
            alert('删除失败: ' + error.message);
        } else {
            fetchWorks(); // 刷新列表
        }
    };

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            {/* 演示区域：添加数据 */}
            <div className="p-6 bg-sakura-light/50 rounded-xl border border-sakura/30">
                <h3 className="text-lg font-bold text-pink-700 mb-4">📝 测试区：添加一个作品</h3>
                <p className="text-sm text-gray-500 mb-4">这会直接向 Supabase 的 works 表中插入数据。</p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <input
                        type="text"
                        placeholder="作品名称 (必填)"
                        className="p-2 rounded border border-pink-200 focus:outline-pink-400"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="作者 (必填)"
                            className="p-2 rounded border border-pink-200 focus:outline-pink-400 flex-1"
                            value={formData.author}
                            onChange={e => setFormData({ ...formData, author: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="发布平台"
                            className="p-2 rounded border border-pink-200 focus:outline-pink-400 flex-1"
                            value={formData.platform}
                            onChange={e => setFormData({ ...formData, platform: e.target.value })}
                        />
                    </div>
                    <input
                        type="text"
                        placeholder="直达URL"
                        className="p-2 rounded border border-pink-200 focus:outline-pink-400"
                        value={formData.url}
                        onChange={e => setFormData({ ...formData, url: e.target.value })}
                    />
                    <button type="submit" className="bg-pink-500 text-white py-2 rounded-lg font-bold hover:bg-pink-600 transition-colors shadow-sm">
                        提交到数据库
                    </button>
                </form>
            </div>

            {/* 演示区域：列表展示 */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-700">📚 数据库中的作品 ({works.length})</h3>
                    <button onClick={fetchWorks} className="text-sm text-pink-500 hover:underline">刷新列表</button>
                </div>

                {loading ? (
                    <div className="text-center py-8 text-gray-400">数据加载中...</div>
                ) : works.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg bg-gray-50">
                        数据库里还没东西，快去添加一条吧！
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {works.map((work) => (
                            <div key={work.id} className="p-4 bg-white shadow-sm rounded-xl border border-gray-100 flex justify-between items-center group">
                                <div>
                                    <h4 className="font-bold text-lg text-gray-800">{work.title}</h4>
                                    <div className="flex gap-2 text-sm text-gray-500 mt-1">
                                        <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{work.platform || '未知平台'}</span>
                                        <span>{work.author}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {work.url && (
                                        <a href={work.url} target="_blank" className="text-pink-500 hover:text-pink-600 text-sm font-medium">
                                            直达 &rarr;
                                        </a>
                                    )}
                                    <button
                                        onClick={() => handleDelete(work.id)}
                                        className="text-gray-300 hover:text-red-500 transition-colors px-2"
                                        title="删除"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
