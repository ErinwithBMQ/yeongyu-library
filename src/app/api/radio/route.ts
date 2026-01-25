import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = parseInt(searchParams.get('pageSize') || '10');

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const authHeader = request.headers.get('Authorization');
        const supabase = createServerSupabaseClient(authHeader);

        // Get current user for userReacted check
        const { data: { user } } = await supabase.auth.getUser();

        const { data, error, count } = await supabase
            .from('radio_messages')
            .select(`
        *,
        linked_work:works (
          id,
          title,
          author_name
        ),
        radio_reactions (
            user_id,
            emoji
        )
      `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) throw error;

        // Transform data to group reactions
        const formattedData = data.map((msg: any) => {
            const reactionsMap = new Map<string, { count: number; userReacted: boolean }>();

            if (msg.radio_reactions) {
                msg.radio_reactions.forEach((reaction: any) => {
                    const existing = reactionsMap.get(reaction.emoji) || { count: 0, userReacted: false };
                    existing.count++;
                    if (user && reaction.user_id === user.id) {
                        existing.userReacted = true;
                    }
                    reactionsMap.set(reaction.emoji, existing);
                });
            }

            const reactions = Array.from(reactionsMap.entries()).map(([emoji, val]) => ({
                emoji,
                count: val.count,
                userReacted: val.userReacted
            }));

            // Remove raw radio_reactions and return clean object
            const { radio_reactions, ...rest } = msg;
            return {
                ...rest,
                reactions
            };
        });

        return NextResponse.json({
            data: formattedData,
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
