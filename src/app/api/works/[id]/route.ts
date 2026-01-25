import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

// GET Detail
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const supabase = createServerSupabaseClient();
        const { id } = await params;

        const { data, error } = await supabase
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
            `)
            .eq('id', id)
            .single();

        if (error) {
            // Handle 404
            if (error.code === 'PGRST116') return NextResponse.json(null);
            throw error;
        }

        const formattedData = {
            ...data,
            tags: data.work_tags?.map((wt: any) => wt.tags).filter(Boolean) || []
        };

        return NextResponse.json(formattedData);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// DELETE
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const authHeader = request.headers.get('Authorization');
        const supabase = createServerSupabaseClient(authHeader);
        const { id } = await params;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { error } = await supabase
            .from('works')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// PUT (Update)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const authHeader = request.headers.get('Authorization');
        const supabase = createServerSupabaseClient(authHeader);
        const { id } = await params;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const updates: any = {};
        if (body.original_url !== undefined) updates.original_url = body.original_url;
        if (body.platform !== undefined) updates.platform = body.platform;
        if (body.summary !== undefined) updates.summary = body.summary;
        if (body.author_name !== undefined) updates.author_name = body.author_name;

        if (Object.keys(updates).length > 0) {
            const { error: workError } = await supabase
                .from('works')
                .update(updates)
                .eq('id', id);

            if (workError) throw workError;
        }

        if (body.tag_ids !== undefined) {
            const tagIds = body.tag_ids as number[];
            const { error: deleteTagsError } = await supabase
                .from('work_tags')
                .delete()
                .eq('work_id', id);

            if (deleteTagsError) throw deleteTagsError;

            if (tagIds.length > 0) {
                const workTagsInsert = tagIds.map(tagId => ({
                    work_id: id,
                    tag_id: tagId
                }));

                const { error: insertTagsError } = await supabase
                    .from('work_tags')
                    .insert(workTagsInsert);

                if (insertTagsError) throw insertTagsError;
            }
        }

        return NextResponse.json({ success: true });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
