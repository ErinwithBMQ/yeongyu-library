import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

export async function GET() {
    try {
        const supabase = createServerSupabaseClient();
        const { data, error } = await supabase
            .from('tags')
            .select('*')
            .order('category', { ascending: true })
            .order('name', { ascending: true });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // 标签库缓存策略优化：
        // 标签极少变动，设置 1小时 (3600秒) 的强缓存。
        // stale-while-revalidate=86400 (一天): 哪怕过期了，一天内也先给缓存，后台慢悠悠更新。
        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
            }
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
