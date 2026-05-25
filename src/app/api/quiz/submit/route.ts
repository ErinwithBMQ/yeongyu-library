import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { createHash } from 'crypto';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, answers, token } = body as {
            email: string;
            answers: { id: number; answer: string }[];
            token: string;
        };

        if (!email || !answers || !token || !Array.isArray(answers) || answers.length === 0) {
            return NextResponse.json({ error: '参数不完整' }, { status: 400 });
        }

        // 校验邮箱格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: '邮箱格式不正确' }, { status: 400 });
        }

        const supabase = createServerSupabaseClient();

        // 1. 验证 token：从题目 ID 反推哈希比对
        const ids = answers
            .map((a) => a.id)
            .sort((a, b) => a - b);
        const expectedToken = createHash('sha256')
            .update(ids.join(',') + (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'quiz-secret'))
            .digest('hex');

        if (token !== expectedToken) {
            return NextResponse.json({ error: '题目校验失败，请重新答题' }, { status: 400 });
        }

        // 验证答案格式
        for (const ans of answers) {
            if (!['a', 'b', 'c', 'd'].includes(ans.answer)) {
                return NextResponse.json({ error: '答案格式不正确' }, { status: 400 });
            }
        }

        // 2. 批改
        const { data: scoreData, error: scoreError } = await supabase.rpc('check_quiz_answers', {
            answer_data: answers,
        });

        if (scoreError || !scoreData || scoreData.length === 0) {
            console.error('Failed to check quiz answers:', scoreError);
            return NextResponse.json({ error: '评分失败' }, { status: 500 });
        }

        const { total, correct, score } = scoreData[0] as {
            total: number;
            correct: number;
            score: number;
        };

        const passed = score >= 80;

        // 3. 分数 ≥ 80，记录邮箱为已验证
        if (passed) {
            const { error: upsertError } = await supabase.rpc('upsert_verified_email', {
                email_addr: email,
                quiz_score: score,
            });

            if (upsertError) {
                console.error('Failed to save verified email:', upsertError);
                return NextResponse.json({ error: '保存邮箱失败' }, { status: 500 });
            }
        }

        return NextResponse.json({
            passed,
            score,
            correct,
            total,
        });
    } catch (err: any) {
        console.error('Quiz submit error:', err);
        return NextResponse.json({ error: '服务器错误' }, { status: 500 });
    }
}
