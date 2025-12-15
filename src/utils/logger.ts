import { supabase } from './supabaseClient';

export const logAction = async (adminEmail: string, action: string, details: string) => {
  try {
    await supabase.from('audit_logs').insert([
      {
        admin_email: adminEmail,
        action_type: action,
        details: details
      }
    ]);
  } catch (error) {
    console.error("Failed to log action:", error);
  }
};