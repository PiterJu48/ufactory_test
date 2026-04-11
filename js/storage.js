// Supabase SDK Import (using CDN for ESM)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- Supabase Configuration ---
// TO USER: Replace YOUR_SUPABASE_ANON_KEY with your actual "anon public" key 
// from your Supabase Project Settings > API.
const SUPABASE_URL = "https://aentoqkcgzfijezieidb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlbnRvcWtjZ3pmaWplemllaWRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NzMzMjYsImV4cCI6MjA5MTQ0OTMyNn0.h8MbiDaP7xlRPg9rvtLNZvCZEKI8KSJK4IeXTDGTuHU";

let supabase;
let isSupabaseEnabled = false;

try {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  isSupabaseEnabled = (SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY");
  if (isSupabaseEnabled) console.log("Supabase initialized successfully.");
} catch (e) {
  console.warn("Supabase initialization failed. Check your config.");
}

export const Storage = {
  // Authentication
  async login(email, password) {
    if (!isSupabaseEnabled) {
      // Demo login for fallback
      if (email === 'admin' && password === 'admin123') {
        const user = { id: 'demo-admin', name: '최고관리자 (데모)', role: 'ADMIN' };
        sessionStorage.setItem('awcfis_user', JSON.stringify(user));
        return user;
      }
      throw new Error("Supabase Anon Key를 설정하거나 admin/admin123으로 접속하세요.");
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.includes('@') ? email : `${email}@awcfis.com`,
      password: password
    });

    if (error) throw new Error(error.message);

    // Fetch user profile from 'profiles' table (assuming standard RBAC setup)
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    const sessionUser = {
      id: data.user.id,
      name: profile?.name || '사용자',
      role: profile?.role || 'OWNER'
    };
    
    sessionStorage.setItem('awcfis_user', JSON.stringify(sessionUser));
    return sessionUser;
  },

  getUser() {
    const user = sessionStorage.getItem('awcfis_user');
    return user ? JSON.parse(user) : null;
  },

  async logout() {
    if (isSupabaseEnabled) await supabase.auth.signOut();
    sessionStorage.removeItem('awcfis_user');
    window.location.href = 'index.html';
  },

  // Users (from 'profiles' table)
  async getUsers() {
    if (!isSupabaseEnabled) return [];
    const { data, error } = await supabase.from('profiles').select('*, farms(name)');
    if (error) throw error;
    return data;
  },
async saveUser(user) {
  // 1. Create actual Auth user in Supabase
  const fullEmail = user.username.includes('@') ? user.username : `${user.username}@awcfis.com`;
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: fullEmail,
    password: user.password,
  });

  if (authError) throw authError;

  // 2. Link metadata in 'profiles' table
  const { error: profileError } = await supabase.from('profiles').insert([
    { 
      id: authData.user.id,
      username: user.username, 
      name: user.name, 
      role: user.role,
      farm_id: user.farm_id || null
    }
  ]);

  if (profileError) throw profileError;
  return { success: true };
},


  async deleteUser(userId) {
    await supabase.from('profiles').delete().eq('id', userId);
  },

  // Farms Management
  async getFarms() {
    if (!isSupabaseEnabled) return [];
    const { data, error } = await supabase.from('farms').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async saveFarm(farm) {
    const { data, error } = await supabase.from('farms').insert([
      { 
        name: farm.name, 
        phone: farm.phone, 
        address: farm.address 
      }
    ]).select();
    if (error) throw error;
    return { success: true, data: data[0] };
  },

  async deleteFarm(farmId) {
    await supabase.from('farms').delete().eq('id', farmId);
  },

  // Inspection Items
  async getItems() {
    if (!isSupabaseEnabled) return [];
    const { data, error } = await supabase.from('items').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async saveItem(item) {
    const { error } = await supabase.from('items').insert([item]);
    if (error) throw error;
    return { success: true };
  },

  async deleteItem(itemId) {
    await supabase.from('items').delete().eq('id', itemId);
  },

  // Reports
  async getReports() {
    if (!isSupabaseEnabled) return [];
    const { data, error } = await supabase
      .from('reports')
      .select('*, profiles(name)')
      .eq('is_virtual', false)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Transform to match the UI expectations
    return data.map(r => ({
      ...r,
      farm_name: r.profiles?.name || '알 수 없음',
      date: r.created_at
    }));
  },

  async saveReport(report) {
    // We assume 'reports' and 'report_results' tables exist
    const { data, error } = await supabase
      .from('reports')
      .insert([{ 
        farm_id: report.farm_id, 
        inspector_id: report.inspector_id, 
        overall_comment: report.overall_comment,
        is_virtual: report.is_virtual 
      }])
      .select();

    if (error) throw error;

    const reportId = data[0].id;
    const resultsToInsert = report.results.map(res => ({
      report_id: reportId,
      item_id: res.itemId,
      score: res.score,
      status: res.status,
      comment: res.comment
    }));

    await supabase.from('report_results').insert(resultsToInsert);
    return { success: true };
  },

  // Virtual Assessments
  async getVirtualReports(userId) {
    if (!isSupabaseEnabled) return [];
    const { data, error } = await supabase
      .from('reports')
      .select('*, report_results(*)')
      .eq('farm_id', userId)
      .eq('is_virtual', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};
