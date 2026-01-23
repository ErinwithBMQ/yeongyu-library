import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const authHeader = request.headers.get('Authorization');
        const supabase = createServerSupabaseClient(authHeader);
        const { id } = await params;
        const messageId = parseInt(id);

        const { data: { user } } = await supabase.auth.getUser();

        // Fetch all reactions for this message
        const { data, error } = await supabase
            .from('radio_reactions')
            .select('emoji, user_id')
            .eq('message_id', messageId);

        if (error) throw error;

        // Process data to get counts and user status
        const reactionMap = new Map<string, { count: number; userReacted: boolean }>();

        data.forEach((r: any) => {
            if (!reactionMap.has(r.emoji)) {
                reactionMap.set(r.emoji, { count: 0, userReacted: false });
            }
            const info = reactionMap.get(r.emoji)!;
            info.count += 1;
            if (user && r.user_id === user.id) {
                info.userReacted = true;
            }
        });

        const result = Array.from(reactionMap.entries()).map(([emoji, info]) => ({
            emoji,
            count: info.count,
            userReacted: info.userReacted
        }));

        return NextResponse.json(result);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const authHeader = request.headers.get('Authorization');
        const supabase = createServerSupabaseClient(authHeader);
        const { id } = await params;
        const messageId = parseInt(id);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { emoji } = await request.json();

        // Check if exists
        const { data: existing, error: fetchError } = await supabase
            .from('radio_reactions')
            .select('id')
            .eq('message_id', messageId)
            .eq('user_id', user.id)
            .eq('emoji', emoji)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "found no rows"
            throw fetchError;
        }

        if (existing) {
            // Delete
            const { error: deleteError } = await supabase
                .from('radio_reactions')
                .delete()
                .eq('id', existing.id);
            if (deleteError) throw deleteError;
        } else {
            // Insert
            const { error: insertError } = await supabase
                .from('radio_reactions')
                .insert({
                    message_id: messageId,
                    user_id: user.id,
                    emoji
                });
            if (insertError) throw insertError;
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
