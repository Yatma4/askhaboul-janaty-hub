import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  changePassword: (newPassword: string) => Promise<boolean>;
  createUser: (email: string, password: string, username: string, role: UserRole) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  listUsers: () => Promise<{ id: string; email: string; username: string; role: UserRole; created_at: string }[]>;
  updateUserPassword: (userId: string, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapSupabaseUser = async (supabaseUser: SupabaseUser): Promise<User> => {
  // Fetch role from user_roles table
  const { data: roleData } = await supabase
    .from('user_roles' as any)
    .select('role')
    .eq('user_id', supabaseUser.id)
    .single();

  // Fetch username from profiles table
  const { data: profileData } = await supabase
    .from('profiles' as any)
    .select('username')
    .eq('user_id', supabaseUser.id)
    .single();

  return {
    id: supabaseUser.id,
    username: (profileData as any)?.username || supabaseUser.user_metadata?.username || supabaseUser.email || 'Utilisateur',
    role: ((roleData as any)?.role as UserRole) || 'user',
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Use setTimeout to avoid potential deadlock with Supabase client
        setTimeout(async () => {
          const mappedUser = await mapSupabaseUser(session.user);
          setUser(mappedUser);
          setIsLoading(false);
        }, 0);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const mappedUser = await mapSupabaseUser(session.user);
        setUser(mappedUser);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return !error;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const changePassword = useCallback(async (newPassword: string): Promise<boolean> => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return !error;
  }, []);

  const createUser = useCallback(async (email: string, password: string, username: string, role: UserRole): Promise<boolean> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    const { data, error } = await supabase.functions.invoke('manage-users', {
      body: { action: 'create', email, password, username, role },
    });

    return !error && !data?.error;
  }, []);

  const deleteUser = useCallback(async (userId: string): Promise<boolean> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    const { data, error } = await supabase.functions.invoke('manage-users', {
      body: { action: 'delete', userId },
    });

    return !error && !data?.error;
  }, []);

  const listUsers = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return [];

    const { data, error } = await supabase.functions.invoke('manage-users', {
      body: { action: 'list' },
    });

    if (error || data?.error) return [];
    return data?.users || [];
  }, []);

  const updateUserPassword = useCallback(async (userId: string, password: string): Promise<boolean> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    const { data, error } = await supabase.functions.invoke('manage-users', {
      body: { action: 'update-password', userId, password },
    });

    return !error && !data?.error;
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      changePassword,
      createUser,
      deleteUser,
      listUsers,
      updateUserPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
