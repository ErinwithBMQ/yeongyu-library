import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const filterTagIdsStr = searchParams.get('filterTagIds');
        const filterTagIds = filterTagIdsStr ? filterTagIdsStr.split(',').map(Number) : [];
        const searchQuery = searchParams.get('searchQuery');

        const supabase = createServerSupabaseClient();

        let query = supabase.from('works').select('id');

        if (filterTagIds.length > 0) {
            const { data: tagMatches, error: tagError } = await supabase
                .from('work_tags')
                .select('work_id, tag_id')
                .in('tag_id', filterTagIds);

            if (tagError) throw tagError;

            if (!tagMatches || tagMatches.length === 0) {
                return NextResponse.json({ id: null });
            }

            const workIdCounts: Record<number, number> = {};
            tagMatches.forEach(item => {
                workIdCounts[item.work_id] = (workIdCounts[item.work_id] || 0) + 1;
            });

            const validWorkIds = Object.keys(workIdCounts)
                .map(id => parseInt(id))
                .filter(id => workIdCounts[id] === filterTagIds.length);

            if (validWorkIds.length === 0) {
                return NextResponse.json({ id: null });
            }
            query = query.in('id', validWorkIds);
        }

        if (searchQuery) {
            query = query.or(`title.ilike.%${searchQuery}%,author_name.ilike.%${searchQuery}%`);
        }

        const { data, error } = await query;
        if (error) throw error;

        if (!data || data.length === 0) return NextResponse.json({ id: null });

        const randomIndex = Math.floor(Math.random() * data.length);
        return NextResponse.json({ id: data[randomIndex].id });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
