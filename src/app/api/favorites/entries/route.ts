import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

export async function GET(request: NextRequest) {
    // checkWorkInFolders
    try {
        const authHeader = request.headers.get('Authorization');
        const supabase = createServerSupabaseClient(authHeader);
        // We do not strict check user here because if not logged in, we return empty list.
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json([]);

        const { searchParams } = new URL(request.url);
        const workId = searchParams.get('workId');

        if (!workId) {
            return NextResponse.json({ error: 'Missing workId' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('folder_entries')
            .select('folder_id, favorite_folders!inner(user_id)')
            .eq('work_id', workId)
            .eq('favorite_folders.user_id', user.id);

        if (error) throw error;

        const folderIds = data.map((item: any) => item.folder_id as number);
        return NextResponse.json(folderIds);

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    // addWorkToFolder
    try {
        const authHeader = request.headers.get('Authorization');
        const supabase = createServerSupabaseClient(authHeader);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { folderId, workId } = await request.json();

        const { error } = await supabase
            .from('folder_entries')
            .insert({
                folder_id: folderId,
                work_id: workId
            });

        if (error) {
            if (error.code === '23505') {
                // Ignore unique constraint violation
                return NextResponse.json({ success: true });
            }
            throw error;
        }
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    // removeWorkFromFolder
    try {
        const authHeader = request.headers.get('Authorization');
        const supabase = createServerSupabaseClient(authHeader);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const folderId = searchParams.get('folderId');
        const workId = searchParams.get('workId');

        if (!folderId || !workId) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

        const { error } = await supabase
            .from('folder_entries')
            .delete()
            .eq('folder_id', folderId)
            .eq('work_id', workId);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
