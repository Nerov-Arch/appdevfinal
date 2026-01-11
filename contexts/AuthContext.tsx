import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    console.log('Starting sign up for:', email);
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
    });

    console.log('Sign up response:', { error, data });

    if (error) {
      console.error('Sign up error:', error.message);
      throw error;
    }

    if (data.user) {
      console.log('Creating user profile for:', data.user.id);
      const { error: profileError } = await supabase.from('user_profiles').insert({
        id: data.user.id,
        email: data.user.email!,
      });
      
      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Don't throw - user account is created even if profile fails
      } else {
        console.log('User profile created successfully');
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('Attempting sign in for:', email);
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log('Sign in response:', { error, data });

    if (error) {
      console.error('Sign in error:', error.message);
      throw error;
    }
    
    console.log('Sign in successful');
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
