const API_BASE = '/api';

export const Storage = {
  // Authentication
  async login(username, password) {
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Server response was not JSON:', text);
        throw new Error('서버로부터 올바르지 않은 응답을 받았습니다.');
      }

      if (data.success) {
        sessionStorage.setItem('awcfis_user', JSON.stringify(data.user));
        return data.user;
      }
      throw new Error(data.message || '로그인 실패');
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  },

  getUser() {
    const user = sessionStorage.getItem('awcfis_user');
    return user ? JSON.parse(user) : null;
  },

  logout() {
    sessionStorage.removeItem('awcfis_user');
    window.location.href = 'index.html';
  },

  // Users
  async getUsers() {
    const res = await fetch(`${API_BASE}/users`);
    return await res.json();
  },
  async saveUser(user) {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    return await res.json();
  },
  async deleteUser(userId) {
    await fetch(`${API_BASE}/users/${userId}`, { method: 'DELETE' });
  },

  // Items
  async getItems() {
    const res = await fetch(`${API_BASE}/items`);
    return await res.json();
  },
  async saveItem(item) {
    const res = await fetch(`${API_BASE}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return await res.json();
  },
  async deleteItem(itemId) {
    await fetch(`${API_BASE}/items/${itemId}`, { method: 'DELETE' });
  },

  // Reports
  async getReports() {
    const res = await fetch(`${API_BASE}/reports`);
    return await res.json();
  },
  async saveReport(report) {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report)
    });
    return await res.json();
  },

  // Virtual Assessments
  async getVirtualReports(userId) {
    const res = await fetch(`${API_BASE}/reports/virtual/${userId}`);
    return await res.json();
  }
};
