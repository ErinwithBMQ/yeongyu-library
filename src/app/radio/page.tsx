'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getRadioMessages, postRadioMessage, toggleReaction, getMessageReactions } from '@/services/radio';
import { RadioMessage } from '@/types';
import RadioMessageCard from '@/components/RadioMessageCard';
// import { getWorks } from '@/services/works';

interface MessageWithReactions extends RadioMessage {
    linked_work?: {
        id: number;
        title: string;
        author_name: string;
    };
    reactions?: Array<{
        emoji: string;
        count: number;
        userReacted: boolean;
    }>;
}

export default function RadioPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const [messages, setMessages] = useState<MessageWithReactions[]>([]);
    const [nickname, setNickname] = useState('');
    const [content, setContent] = useState('');
    // const [linkedWorkId, setLinkedWorkId] = useState<number | undefined>();
    // const [works, setWorks] = useState<Work[]>([]);
    // const [showWorkSelector, setShowWorkSelector] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    // 加载留言列表
    useEffect(() => {
        if (user) {
            loadMessages();
            // loadWorks();
        }
    }, [user]);

    const loadMessages = async () => {
        try {
            setLoadingMessages(true);
            const { data } = await getRadioMessages(1, 50);

            // 为每条留言加载表情统计
            const messagesWithReactions = await Promise.all(
                data.map(async (msg) => {
                    const reactions = await getMessageReactions(msg.id);
                    return {
                        ...msg,
                        reactions
                    };
                })
            );

            setMessages(messagesWithReactions);
        } catch (error) {
            console.error('加载留言失败:', error);
            alert('加载留言失败，请稍后再试');
        } finally {
            setLoadingMessages(false);
        }
    };

    /* const loadWorks = async () => {
        try {
            const { data } = await getWorks({ page: 1, pageSize: 100 });
            setWorks(data);
        } catch (error) {
            console.error('加载作品列表失败:', error);
        }
    }; */

    const handleSubmit = async () => {
        if (!content.trim()) {
            alert('请输入留言内容');
            return;
        }

        if (!nickname.trim()) {
            alert('请输入昵称');
            return;
        }

        try {
            setSubmitting(true);
            await postRadioMessage({
                nickname: nickname.trim(),
                content: content.trim(),
                // linked_work_id: linkedWorkId
            });

            // 清空表单
            setNickname('');
            setContent('');
            // setLinkedWorkId(undefined);

            // 重新加载留言列表
            await loadMessages();

            alert('留言发送成功！');
        } catch (error) {
            console.error('发送留言失败:', error);
            alert('发送留言失败，请稍后再试');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReact = async (messageId: number, emoji: string) => {
        try {
            await toggleReaction(messageId, emoji);

            // 更新该留言的表情统计
            const reactions = await getMessageReactions(messageId);
            setMessages(prev => prev.map(msg =>
                msg.id === messageId ? { ...msg, reactions } : msg
            ));
        } catch (error) {
            console.error('表情操作失败:', error);
            alert('操作失败，请稍后再试');
        }
    };

    // const selectedWork = works.find(w => w.id === linkedWorkId);

    if (loading) return null;
    if (!user) return null;

    return (
        <div className="container mx-auto p-4 sm:p-8 max-w-6xl">
            <header className="mb-8 text-center">
                <h1 className="text-3xl sm:text-4xl font-bold text-teal-500 mb-2">真心定格电台</h1>
                <p className="text-gray-600">匿名树洞，留下你的碎碎念或长信</p>
            </header>

            <div className="grid lg:grid-cols-5 gap-8">
                {/* 左侧：发送留言表单 */}
                <div className="lg:col-span-2">
                    <div className="bg-gradient-to-br from-pink-50 to-mint-50 rounded-2xl p-6 border border-pink-200/50 sticky top-4">
                        <h2 className="text-xl font-semibold text-teal-700 mb-4">我要留言</h2>

                        {/* 昵称输入 */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                昵称
                            </label>
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                className="w-full rounded-lg border-gray-200 p-3 focus:ring-2 focus:ring-mint focus:border-mint"
                                placeholder="给自己起个可爱的名字..."
                                maxLength={20}
                            />
                        </div>

                        {/* 内容输入 */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                留言内容
                                <span className="text-xs text-gray-500 ml-2">
                                    ({content.length <= 150 ? '碎碎念' : '来信'} · {content.length}字)
                                </span>
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full h-40 rounded-lg border-gray-200 p-3 focus:ring-2 focus:ring-mint focus:border-mint resize-none"
                                placeholder="写下你想说的话...&#10;150字以内会显示为碎碎念&#10;更长的内容会显示为信封"
                            ></textarea>
                        </div>

                        {/* 引用作品 - 暂时移除 */}
                        {/* <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                引用作品（可选）
                            </label>
                            {selectedWork ? (
                                <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
                                    <span className="text-sm text-gray-700 truncate">
                                        {selectedWork.title}
                                    </span>
                                    <button
                                        onClick={() => setLinkedWorkId(undefined)}
                                        className="text-red-500 hover:text-red-700 text-sm"
                                    >
                                        移除
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowWorkSelector(!showWorkSelector)}
                                    className="w-full px-4 py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-teal-400 hover:text-teal-600 transition"
                                >
                                    + 选择作品
                                </button>
                            )} */}

                        {/* 作品选择器 */}
                        {/* {showWorkSelector && !selectedWork && (
                                <div className="mt-2 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg">
                                    {works.map(work => (
                                        <button
                                            key={work.id}
                                            onClick={() => {
                                                setLinkedWorkId(work.id);
                                                setShowWorkSelector(false);
                                            }}
                                            className="w-full text-left px-4 py-2 hover:bg-mint/10 transition text-sm border-b border-gray-100 last:border-0"
                                        >
                                            <div className="font-medium text-gray-800">{work.title}</div>
                                            <div className="text-xs text-gray-500">by {work.author_name}</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div> */}

                        {/* 提交按钮 */}
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="w-full px-6 py-3 bg-gradient-to-r from-pink-400 to-teal-400 text-white font-semibold rounded-full hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? '投递中...' : '📮 投递留言'}
                        </button>
                    </div>
                </div>

                {/* 右侧：留言列表 */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-700 mb-6">最新回声</h2>

                        {loadingMessages ? (
                            <div className="text-center text-gray-400 py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
                                加载中...
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="text-center text-gray-400 py-12">
                                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <p>暂无留言</p>
                                <p className="text-sm mt-2">成为第一个分享心情的人吧~</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {messages.map(msg => (
                                    <RadioMessageCard
                                        key={msg.id}
                                        message={msg}
                                        onReact={handleReact}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
