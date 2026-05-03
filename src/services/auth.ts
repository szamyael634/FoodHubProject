import { supabase, signUp, signIn, signOut, getCurrentUser } from '../lib/supabase';
import type { User } from '../types';

export const authService = {
  async register(email: string, password: string, fullName: string, phone?: string) {
    const data = await signUp(email, password, fullName);
    
    if (data.user) {
      // Update profile with additional info
      await supabase
        .from('profiles')
        .update({ phone })
        .eq('id', data.user.id);
    }
    
    return data;
  },

  async login(email: string, password: string) {
    return await signIn(email, password);
  },

  async logout() {
    return await signOut();
  },

  async getCurrentUser() {
    return await getCurrentUser();
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  },

  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
  },

  async updateEmail(newEmail: string) {
    const { error } = await supabase.auth.updateUser({
      email: newEmail,
    });
    if (error) throw error;
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
