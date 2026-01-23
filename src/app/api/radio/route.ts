import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = parseInt(searchParams.get('pageSize') || '10');

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const supabase = createServerSupabaseClient();
        const { data, error, count } = await supabase
            .from('radio_messages')
            .select(`
        *,
        linked_work:works (
          id,
          title,
          author_name
        )
      `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) throw error;

        return NextResponse.json({
            data,
            total: count || 0
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        const supabase = createServerSupabaseClient(authHeader);
        const body = await request.json();

        // Use getUser to verify auth (RLS requires the user to be authenticated)
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { nickname, content, linked_work_id } = body;

        let query = supabase.from('radio_messages').insert({
            user_id: user.id,
            nickname,
            content,
            linked_work_id
        });

        // If we want to return the inserted data
        // .select()
        const { error } = await query;
        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
