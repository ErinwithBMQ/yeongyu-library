import React from 'react';
import Image from 'next/image';
import { Calendar, ExternalLink } from 'lucide-react';

// 添加数据定义，方便后续添加
interface PastActivity {
    id: string;
    title: string;
    description: string;
    date: string;
    link: string;
    coverText: string;
    coverImage?: string;
}

// 在这里维护往期活动列表
const PAST_ACTIVITIES: PastActivity[] = [
    {
        id: '1',
        title: 'TheUnsolvableProposition 准奎12h联产',
        description: '“长长的红线把我们捆绑在一起，从此无论何时，我的终点都是你。”',
        date: '2025.10.25',
        link: 'https://weibo.com/7376494465/QaSjzi8cw',
        coverText: '封面图',
        coverImage: '/activities/20251025.jpg'
    },
    {
        id: '2',
        title: 'Magpie No.13 准奎七夕联产',
        description: '我们是永不褪色的灵魂，我们是被写进命运的必然。',
        date: '2025.08.29',
        link: 'https://weibo.com/5610386816/Q299pqoNM',
        coverText: '封面图',
        coverImage: '/activities/20250829.jpg'
    },
    {
        id: '3',
        title: 'LoveAndSweet 准奎万圣联产',
        description: '“不给糖就捣蛋。”',
        date: '2024.10.31 - 11.01',
        link: 'https://weibo.com/7894569707/5097689786613796',
        coverText: '封面图',
        coverImage: '/activities/20241101.jpg'
    },
    {
        id: '4',
        title: '13thLoveExpress 准奎银色情人节联产',
        description: 'No matter where you are, No matter what season it is, If we are together, feel like summer.',
        date: '2024.07.14',
        link: 'https://weibo.com/5671086459/5056182098068665',
        coverText: '封面图',
        coverImage: '/activities/20240714.jpg'
    },
    {
        id: '5',
        title: '镜中万华 准奎联产活动',
        description: '在万花筒中，无数个瞬间也能定格成永恒。',
        date: '2024.06.26',
        link: 'https://weibo.com/6745909488/5049669174428741',
        coverText: '封面图',
        coverImage: '/activities/20240626.jpg'
    },
    {
        id: '6',
        title: 'White Chocolaty Kisses 准奎白色情人节联产',
        description: '话说那天晚上，两个人靠在一起看了一整晚电影睡了过去。迷迷糊糊中，gyu感觉到额头上的吻，湿软的气息贴了上来。他不喜欢薄巧，但白巧的香气，甜甜腻腻，好像……不是不能接受呢。',
        date: '2024.03.14',
        link: 'https://weibo.com/5531266959/5012333962990340',
        coverText: '封面图',
        coverImage: '/activities/20240314.jpg'
    }
];

export default function ActivitiesPage() {
    return (
        <div className="container mx-auto p-4 sm:p-8 space-y-12">
            <header className="mb-4">
                <h1 className="text-2xl font-bold text-bamguet-dark">联产活动</h1>
            </header>
            <div className="border-b border-gray-200 my-5"></div>
            {/* 正在进行 */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 text-xl font-bold text-bamguet-dark border-l-4 border-bamguet pl-3">
                    <span className="animate-pulse">🔥</span>
                    <h2>正在进行</h2>
                </div>

                {/* 如果没有活动，可以显示这个 */}
                {/* <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-100 text-gray-500">
                    目前暂时没有正在进行的联产活动哦，去看看往期回顾吧~
                </div> */}

                {/* 活动卡片示例 */}
                <div className="bg-gradient-to-br from-bamguet-light to-white rounded-3xl p-6 sm:p-8 border border-bamguet/20 flex flex-col md:flex-row gap-10 items-center">
                    <div className="w-full md:w-1/4 aspect-square bg-white rounded-xl flex items-center justify-center text-bamguet-dark/30 font-bold text-xl overflow-hidden relative">
                        {/* 替换这里的 src 属性为您的实际图片路径，例如 /activities/poster_2026.jpg */}
                        <Image
                            src="/activities/20260214.jpg"
                            alt="活动海报"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 33vw"
                            priority
                        />
                    </div>
                    <div className="flex-1 space-y-4 text-center md:text-left">
                        <div className="inline-block px-3 py-1 rounded-full bg-bamguet text-white text-sm font-medium">
                            2026 情人节
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800">
                            玫瑰花礼 准奎情人节联产
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                            “我对你产生意义了吗？”
                            就像这些花儿，她们都是独一无二的。
                            “当然，你是我独一无二的玫瑰。”
                            愿这份情人节的玫瑰花礼，也能够对你产生意义。
                        </p>

                        <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-2">
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <Calendar className="w-4 h-4" />
                                <span>2026.02.14</span>
                            </div>
                        </div>

                        <div className="pt-4">
                            <a
                                href="https://weibo.com/7615272159/QrQokpvic"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-bamguet-dark text-white rounded-xl hover:brightness-110 transition-all font-medium"
                            >
                                查看详情
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* 往期回顾 */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 text-xl font-bold text-gray-700 border-l-4 border-gray-300 pl-3">
                    <h2>往期回顾</h2>
                </div>
                <div className='text-gray-500 text-sm'>统计时间点为2024年向后</div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {PAST_ACTIVITIES.map((activity) => (
                        <div key={activity.id} className="group bg-white rounded-2xl p-5 border border-gray-100 hover:border-bamguet/30 transition-all flex gap-4">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-xs text-gray-400 overflow-hidden relative">
                                {activity.coverImage ? (
                                    <Image
                                        src={activity.coverImage}
                                        alt={activity.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        sizes="(max-width: 640px) 96px, 128px"
                                    />
                                ) : (
                                    activity.coverText
                                )}
                            </div>
                            <div className="flex-1 flex flex-col justify-between py-1">
                                <div>
                                    <h3 className="font-bold text-gray-800 group-hover:text-bamguet-dark transition-colors line-clamp-1">
                                        {activity.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                                        {activity.description}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between mt-3">
                                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">{activity.date}</span>
                                    <a href={activity.link} target="_blank" rel="noopener noreferrer" className="text-sm text-bamguet font-medium hover:underline">
                                        查看归档
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
