import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setAuthState({
          user: session?.user ?? null,
          session: session,
          loading: false,
        });
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState({
        user: session?.user ?? null,
        session: session,
        loading: false,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      let errorMessage = error.message;
      if (error.message.includes('already registered')) {
        errorMessage = 'This email is already registered. Please sign in instead.';
      }
      toast({
        title: 'Sign up failed',
        description: errorMessage,
        variant: 'destructive',
      });
      return { error };
    }

    toast({
      title: 'Account created!',
      description: 'Welcome to Roomly!',
    });
    
    return { data, error: null };
  }, [toast]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      let errorMessage = error.message;
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please try again.';
      }
      toast({
        title: 'Sign in failed',
        description: errorMessage,
        variant: 'destructive',
      });
      return { error };
    }

    toast({
      title: 'Welcome back!',
      description: 'You have been signed in successfully.',
    });
    
    return { data, error: null };
  }, [toast]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        title: 'Sign out failed',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }

    toast({
      title: 'Signed out',
      description: 'You have been signed out successfully.',
    });
    
    return { error: null };
  }, [toast]);

  const resetPassword = useCallback(async (email: string) => {
    const redirectUrl = `${window.location.origin}/reset-password`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      toast({
        title: 'Password reset failed',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }

    toast({
      title: 'Check your email',
      description: 'We sent you a password reset link.',
    });
    
    return { error: null };
  }, [toast]);

  const updatePassword = useCallback(async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      toast({
        title: 'Password update failed',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }

    toast({
      title: 'Password updated',
      description: 'Your password has been successfully changed.',
    });
    
    return { error: null };
  }, [toast]);

  return {
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    isAuthenticated: !!authState.session,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
  };
}
