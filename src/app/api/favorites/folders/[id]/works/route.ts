import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const authHeader = request.headers.get('Authorization');
        const supabase = createServerSupabaseClient(authHeader);
        const { id } = await params;

        const { data, error } = await supabase
            .from('folder_entries')
            .select(`
                created_at,
                work:works (
                    id,
                    title,
                    author_name,
                    original_url,
                    platform,
                    summary,
                    created_at,
                    work_tags (
                        tag:tags (
                            name,
                            category
                        )
                    )
                )
            `)
            .eq('folder_id', id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform
        const formatted = data.map((item: any) => ({
            ...item.work,
            tags: item.work.work_tags?.map((wt: any) => wt.tag) || [],
            added_at: item.created_at
        }));

        return NextResponse.json(formatted);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
