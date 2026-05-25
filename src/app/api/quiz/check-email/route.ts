import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
        return NextResponse.json({ error: '缺少邮箱参数' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return NextResponse.json({ error: '邮箱格式不正确' }, { status: 400 });
    }

    try {
        const supabase = createServerSupabaseClient();

        const { data, error } = await supabase.rpc('check_email_available', {
            email_addr: email,
        });

        if (error) {
            console.error('Failed to check email:', error);
            return NextResponse.json({ error: '检查失败' }, { status: 500 });
        }

        const { is_verified, is_registered } = data[0] as {
            is_verified: boolean;
            is_registered: boolean;
        };

        return NextResponse.json({
            available: !is_verified && !is_registered,
            is_verified,
            is_registered,
        });
    } catch (err: any) {
        console.error('Check email error:', err);
        return NextResponse.json({ error: '服务器错误' }, { status: 500 });
    }
}
