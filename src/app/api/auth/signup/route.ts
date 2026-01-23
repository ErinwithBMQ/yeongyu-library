import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, code, username } = body;

        // Init admin client or regular client?
        // Checking invite code requires reading 'invite_codes' table.
        // Assuming public or authenticated user can read it?
        // Ideally checking 'is_used' status requires standard client.
        // But for update?
        // Since this is a server route, we might want to bypass RLS if the table is protected?
        // But the original code was client-side using ANON key, so RLS must allow reading.

        const supabase = createServerSupabaseClient(); // Anon client

        // 1. 检查邀请码
        const { data: codeData, error: codeError } = await supabase
            .from('invite_codes')
            .select('*')
            .eq('code', code)
            .eq('email', email)
            .single();

        if (codeError || !codeData) {
            return NextResponse.json({ error: '邀请码无效或与邮箱不匹配' }, { status: 400 });
        }

        if (codeData.is_used) {
            return NextResponse.json({ error: '该邀请码已被使用' }, { status: 400 });
        }

        // 2. 注册
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: username,
                }
            }
        });

        if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });
        if (!authData.user) return NextResponse.json({ error: '注册失败' }, { status: 500 });

        // 3. 标记邀请码已使用 (调用 RPC 函数)
        const { error: updateError } = await supabase.rpc('mark_invite_used', {
            invite_id: codeData.id
        });

        if (updateError) {
            console.error('Warning: Failed to mark invite code as used', updateError);
        }

        return NextResponse.json({ user: authData.user, session: authData.session });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
