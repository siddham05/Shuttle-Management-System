import { create } from 'zustand';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<{ data: User | null }>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (userError) throw userError;

        // Store the session in localStorage
        localStorage.setItem('supabase.auth.token', JSON.stringify(data.session));
        set({ user: userData });
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  },
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear stored session
      localStorage.removeItem('supabase.auth.token');
      set({ user: null });
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },
  initialize: async () => {
    try {
      // Check for existing session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;

      let userData = null;
      if (session?.user) {
        const { data: userDataResponse, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userError) throw userError;
        userData = userDataResponse;
        set({ user: userDataResponse });
      }

      set({ loading: false });
      return { data: userData };
    } catch (error) {
      console.error('Initialization error:', error);
      set({ loading: false });
      return { data: null };
    }
  },
}));