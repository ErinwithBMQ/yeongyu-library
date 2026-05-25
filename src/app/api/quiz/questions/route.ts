import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { createHash } from 'crypto';

export async function GET(_request: NextRequest) {
    try {
        const supabase = createServerSupabaseClient();

        const { data: questions, error } = await supabase.rpc('get_random_questions', {
            limit_count: 10,
        });

        if (error) {
            console.error('Failed to fetch quiz questions:', error);
            return NextResponse.json({ error: '获取题目失败' }, { status: 500 });
        }

        if (!questions || questions.length === 0) {
            return NextResponse.json({ error: '题库暂无题目' }, { status: 500 });
        }

        // 生成 token：题目 ID 列表的哈希，用于提交时校验题目一致性
        const ids = questions.map((q: any) => q.id).sort((a: number, b: number) => a - b);
        const token = createHash('sha256')
            .update(ids.join(',') + (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'quiz-secret'))
            .digest('hex');

        return NextResponse.json({ questions, token });
    } catch (err: any) {
        console.error('Quiz questions error:', err);
        return NextResponse.json({ error: '服务器错误' }, { status: 500 });
    }
}
