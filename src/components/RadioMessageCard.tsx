'use client';

import { useState } from 'react';
import { RadioMessage } from '@/types';
import Link from 'next/link';
import { Snowflake } from 'lucide-react';

interface RadioMessageCardProps {
    message: RadioMessage & {
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
    };
    onReact: (messageId: number, emoji: string) => void;
}

const EMOJI_OPTIONS = ['❤️', '😭', '😂', '👍', '🎉', '💕'];

export default function RadioMessageCard({ message, onReact }: RadioMessageCardProps) {
    const [expanded, setExpanded] = useState(false);
    const isShort = message.content.length <= 80;
    const messageType = isShort ? '留言' : '来信';
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    // 信封模式下截取前80字
    const getPreview = () => {
        if (isShort) return message.content;
        return message.content.slice(0, 80);
    };

    return (
        <div
            className={`relative ${message.is_winter_letter_storage_participant
                ? 'bg-sky-50 border-sky-200'
                : isShort
                ? 'bg-sakura-light border-sakura'
                : 'bg-hwangchoon-light border-hwangchoon'
                } border rounded-lg p-4 transition-all`}
        >
            {/* 头部：昵称 + 类型标签 */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                        来自 {message.nickname} 的{messageType}
                    </span>
                </div>
                <span className="text-xs text-gray-400">
                    {new Date(message.created_at).toLocaleDateString('zh-CN', {
                        month: 'numeric',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </span>
            </div>

            {/* 正文内容 */}
            <div className="mb-3">
                {isShort ? (
                    <p className="text-gray-800 whitespace-pre-wrap">{message.content}</p>
                ) : (
                    <>
                        <p className="text-gray-800 whitespace-pre-wrap">
                            {expanded ? message.content : getPreview() + '...'}
                        </p>
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="text-sm text-hwangchoon-dark hover:text-hwangchoon mt-2 font-medium"
                        >
                            {expanded ? '收起' : '展开阅读'}
                        </button>
                    </>
                )}
            </div>

            {/* 引用的作品 */}
            {message.linked_work && (
                <div className="mt-2 text-right">
                    <Link
                        href={`/library/${message.linked_work.id}`}
                        prefetch={false}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/50 border border-bamguet/30 text-bamguet-dark hover:bg-bamguet hover:text-white rounded-full text-xs transition-colors duration-200"
                        title={message.linked_work.title}
                    >
                        <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                            />
                        </svg>
                        <span>推荐：{message.linked_work.title.length > 12 ? message.linked_work.title.slice(0, 12) + '...' : message.linked_work.title}</span>
                    </Link>
                </div>
            )}

            {/* 表情反应区 */}
            <div className="flex items-center gap-2 mt-4 flex-wrap">
                {message.reactions?.map((reaction, idx) => (
                    <button
                        key={idx}
                        onClick={() => onReact(message.id, reaction.emoji)}
                        className={`px-2 py-1 rounded-full text-sm transition ${reaction.userReacted
                            ? 'bg-pink-100 ring-2 ring-pink-300'
                            : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                    >
                        {reaction.emoji} {reaction.count}
                    </button>
                ))}

                {/* 添加表情按钮 */}
                <div className="relative">
                    <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className={`px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition relative z-20 ${showEmojiPicker ? 'bg-gray-200 ring-2 ring-sakura/30' : ''}`}
                        title="添加表情"
                    >
                        +
                    </button>
                    {showEmojiPicker && (
                        <>
                            {/* 遮罩层：点击空白处关闭 */}
                            <div className="fixed inset-0 z-10" onClick={() => setShowEmojiPicker(false)} />
                            {/* 表情选择面板：移动端屏幕居中，PC端按钮上方悬浮 */}
                            <div className="
                                fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                                md:absolute md:top-auto md:bottom-full md:left-1/2 md:-translate-x-1/2 md:translate-y-0 md:mb-2 
                                bg-white border border-gray-200 rounded-lg shadow-xl p-2 flex gap-1 z-20 w-max
                            ">
                                {EMOJI_OPTIONS.map((emoji) => (
                                    <button
                                        key={emoji}
                                        onClick={() => {
                                            onReact(message.id, emoji);
                                            setShowEmojiPicker(false);
                                        }}
                                        className="hover:bg-gray-100 rounded px-2 py-1 text-lg active:scale-125 transition-transform"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {message.is_winter_letter_storage_participant && (
                <div className="mt-3 flex justify-end">
                    <span
                        className="inline-flex items-center gap-1 border border-sky-200 bg-sky-100/70 px-2 py-1 text-[11px] text-sky-700"
                        title="冬信收纳局活动留言"
                    >
                        <Snowflake className="h-3 w-3" aria-hidden="true" />
                        冬信收纳局
                    </span>
                </div>
            )}
        </div>
    );
}
