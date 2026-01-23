import { createClient } from '@supabase/supabase-js';

export const createServerSupabaseClient = (authHeader?: string | null) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase environment variables');
    }

    const options: any = {};

    if (authHeader) {
        options.global = {
            headers: {
                Authorization: authHeader,
            },
        };
    }

    return createClient(supabaseUrl, supabaseAnonKey, options);
};
