'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

type AuthContextType = {
    user: User | null;
    session: Session | null;
    loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
});

export const AuthProvider = ({
    children,
    initialSession
}: {
    children: React.ReactNode;
    initialSession?: Session | null;
}) => {
    const [user, setUser] = useState<User | null>(initialSession?.user ?? null);
    const [session, setSession] = useState<Session | null>(initialSession ?? null);
    // If initialSession is provided (including null), we don't need to load
    const [loading, setLoading] = useState(initialSession === undefined);

    useEffect(() => {
        // Only fetch if no initial session provided
        if (initialSession === undefined) {
            const getSession = async () => {
                const { data: { session } } = await supabase.auth.getSession();
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
            };
            getSession();
        }

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [initialSession]);

    return (
        <AuthContext.Provider value={{ user, session, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
