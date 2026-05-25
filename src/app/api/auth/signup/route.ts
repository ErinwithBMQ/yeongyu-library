import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, username } = body;

        if (!email || !password || !username) {
            return NextResponse.json({ error: '请填写所有必填字段' }, { status: 400 });
        }

        const supabase = createServerSupabaseClient();

        // 1. 检查邮箱是否通过糖点测试
        const { data: emailData, error: emailError } = await supabase.rpc('check_verified_email', {
            email_addr: email,
        });

        if (emailError) {
            console.error('Failed to check verified email:', emailError);
            return NextResponse.json({ error: '服务器错误' }, { status: 500 });
        }

        if (!emailData || emailData.length === 0) {
            return NextResponse.json(
                { error: '该邮箱未通过糖点测试，请先完成答题' },
                { status: 400 }
            );
        }

        // 2. 注册
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: username,
                },
            },
        });

        if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });
        if (!authData.user) return NextResponse.json({ error: '注册失败' }, { status: 500 });

        // 3. 标记邮箱已使用
        const { error: updateError } = await supabase.rpc('mark_email_used', {
            email_addr: email,
        });

        if (updateError) {
            console.error('Warning: Failed to mark email as used', updateError);
        }

        return NextResponse.json({ user: authData.user, session: authData.session });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
