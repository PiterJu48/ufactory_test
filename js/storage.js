// Supabase SDK Import (using CDN for ESM)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- Supabase Configuration ---
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
      if (email === 'admin' && password === 'admin123') {
        const user = { id: 'demo-admin', name: '최고관리자 (데모)', role: 'ADMIN' };
        sessionStorage.setItem('awcfis_user', JSON.stringify(user));
        return user;
      }
      throw new Error("Supabase Anon Key를 설정하세요.");
    }

    const fullEmail = email.includes('@') ? email : `${email}@awcfis.com`;
    const { data, error } = await supabase.auth.signInWithPassword({
      email: fullEmail,
      password: password
    });

    if (error) throw new Error("아이디 또는 비밀번호가 일치하지 않습니다.");

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    const sessionUser = {
      id: data.user.id,
      name: profile?.name || (fullEmail === 'admin@awcfis.com' ? '최고관리자' : '사용자'),
      role: profile?.role || (fullEmail === 'admin@awcfis.com' ? 'ADMIN' : 'OWNER')
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

  // Users (Manual Join with Farms)
  async getUsers() {
    if (!isSupabaseEnabled) return [];
    
    // 1. Get all profiles
    const { data: profiles, error: pError } = await supabase.from('profiles').select('*');
    if (pError) throw pError;
    
    // 2. Get all farms
    const { data: farms, error: fError } = await supabase.from('farms').select('id, name');
    if (fError) throw fError;
    
    // 3. Manual Join
    return profiles.map(p => ({
      ...p,
      farm: farms.find(f => f.id === p.farm_id) || null
    }));
  },

  async saveUser(user) {
    if (!user.password || user.password.length < 6) {
      return { success: false, message: "비밀번호는 최소 6자 이상이어야 합니다." };
    }
    const fullEmail = user.username.includes('@') ? user.username : `${user.username}@awcfis.com`;
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: fullEmail,
      password: user.password,
    });
    if (authError) return { success: false, message: authError.message };
    
    const { error: profileError } = await supabase.from('profiles').insert([{ 
      id: authData.user.id,
      username: user.username, 
      name: user.name, 
      role: user.role,
      farm_id: user.farm_id || null
    }]);
    if (profileError) return { success: false, message: profileError.message };
    return { success: true };
  },

  async deleteUser(userId) {
    await supabase.from('profiles').delete().eq('id', userId);
  },

  // Farms
  async getFarms() {
    if (!isSupabaseEnabled) return [];
    const { data, error } = await supabase.from('farms').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async saveFarm(farm) {
    const { data, error } = await supabase.from('farms').insert([farm]).select();
    if (error) throw error;
    return { success: true, data: data[0] };
  },

  async updateFarm(id, farm) {
    const { error } = await supabase.from('farms').update(farm).eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  async deleteFarm(farmId) {
    await supabase.from('farms').delete().eq('id', farmId);
  },

  // Items
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

  async updateItem(id, item) {
    const { error } = await supabase.from('items').update(item).eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  async deleteItem(itemId) {
    await supabase.from('items').delete().eq('id', itemId);
  },

  // Reports (Manual Join with Profiles)
  async getReports() {
    if (!isSupabaseEnabled) return [];
    
    // 1. Get all reports
    const { data: reports, error: rError } = await supabase
      .from('reports')
      .select('*, report_results(*)')
      .eq('is_virtual', false)
      .order('created_at', { ascending: false });
    if (rError) throw rError;
    
    // 2. Get all profiles (to map names)
    const { data: profiles, error: pError } = await supabase.from('profiles').select('id, name');
    if (pError) throw pError;
    
    // 3. Manual Join
    return reports.map(r => {
      const farmProfile = profiles.find(p => p.id === r.farm_id);
      return {
        ...r,
        farm_name: farmProfile?.name || '알 수 없음',
        date: r.created_at,
        results: r.report_results || []
      };
    });
  },

  async saveReport(report) {
    const { data, error } = await supabase.from('reports').insert([{ 
      farm_id: report.farm_id, 
      inspector_id: report.inspector_id, 
      overall_comment: report.overall_comment,
      is_virtual: report.is_virtual 
    }]).select();
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
