import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const sort = searchParams.get('sort') || 'newest';
    const searchQuery = searchParams.get('searchQuery');

    // filterTagIds is passed as comma separated string '1,2,3'
    const filterTagIdsStr = searchParams.get('filterTagIds');
    const filterTagIds = filterTagIdsStr ? filterTagIdsStr.split(',').map(Number) : [];

    const supabase = createServerSupabaseClient();

    let query = supabase
        .from('works')
        .select(`
            id,
            title,
            author_name,
            original_url,
            platform,
            summary,
            created_at,
            submitter_id,
            work_tags (
                tag_id,
                tags (
                    id,
                    name,
                    category
                )
            )
        `, { count: 'exact' });

    if (filterTagIds.length > 0) {
        const { data: tagMatches, error: tagError } = await supabase
            .from('work_tags')
            .select('work_id, tag_id')
            .in('tag_id', filterTagIds);

        if (tagError) {
            return NextResponse.json({ error: tagError.message }, { status: 500 });
        }

        if (!tagMatches || tagMatches.length === 0) {
            return NextResponse.json({ data: [], total: 0 });
        }

        const workIdCounts: Record<number, number> = {};
        tagMatches.forEach(item => {
            workIdCounts[item.work_id] = (workIdCounts[item.work_id] || 0) + 1;
        });

        const validWorkIds = Object.keys(workIdCounts)
            .map(id => parseInt(id))
            .filter(id => workIdCounts[id] === filterTagIds.length);

        if (validWorkIds.length === 0) {
            return NextResponse.json({ data: [], total: 0 });
        }

        query = query.in('id', validWorkIds);
    }

    if (sort === 'newest') {
        query = query.order('created_at', { ascending: false });
    } else {
        query = query.order('created_at', { ascending: true });
    }

    if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,author_name.ilike.%${searchQuery}%`);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formattedData = (data || []).map((item: any) => ({
        ...item,
        tags: item.work_tags?.map((wt: any) => wt.tags).filter(Boolean) || []
    }));

    // 作品列表缓存策略调整：
    // s-maxage=10: 只缓存10秒，防止瞬时并发打崩数据库。
    // 10秒的延迟对用户几乎无感，但能把 RPS 承载力提升一个数量级。
    return NextResponse.json({
        data: formattedData,
        total: count || 0
    }, {
        headers: {
            'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=60'
        }
    });
}

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        const supabase = createServerSupabaseClient(authHeader);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, author_name, original_url, platform, summary, tag_ids } = body;

        const { data: workData, error: workError } = await supabase
            .from('works')
            .insert({
                title,
                author_name,
                original_url,
                platform,
                summary,
                submitter_id: user.id
            })
            .select()
            .single();

        if (workError) throw workError;

        if (tag_ids && tag_ids.length > 0) {
            const workTagsInsert = tag_ids.map((tagId: number) => ({
                work_id: workData.id,
                tag_id: tagId
            }));

            const { error: tagError } = await supabase
                .from('work_tags')
                .insert(workTagsInsert);

            if (tagError) {
                console.error('Error adding tags to work:', tagError);
            }
        }

        return NextResponse.json(workData);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
