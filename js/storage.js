// Data keys
const STORAGE_KEYS = {
  USERS: 'awcfis_users',
  ITEMS: 'awcfis_items',
  REPORTS: 'awcfis_reports',
  SELF_ASSESSMENTS: 'awcfis_self_assessments'
};

// Initial Data
const INITIAL_USERS = [
  { id: 'admin1', name: '관리자', role: 'ADMIN' },
  { id: 'inspector1', name: '점검자 A', role: 'INSPECTOR' },
  { id: 'owner1', name: '농장주 B', role: 'OWNER' }
];

const INITIAL_ITEMS = [
  { id: 'item1', category: '사육환경', title: '충분한 공간 확보', description: '동물이 자유롭게 움직일 수 있는 공간이 확보되어 있는가?', maxScore: 10 },
  { id: 'item2', category: '영양관리', title: '깨끗한 음수 제공', description: '모든 동물에게 상시 깨끗한 물이 제공되는가?', maxScore: 10 },
  { id: 'item3', category: '건강관리', title: '질병 예방 관리', description: '정기적인 수의사 검진 및 기록이 관리되고 있는가?', maxScore: 10 }
];

export const Storage = {
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ITEMS)) {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(INITIAL_ITEMS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SELF_ASSESSMENTS)) {
      localStorage.setItem(STORAGE_KEYS.SELF_ASSESSMENTS, JSON.stringify([]));
    }
  },

  // Users
  getUsers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
  },
  saveUser(user) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index > -1) users[index] = user;
    else users.push({ ...user, id: Date.now().toString() });
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },
  deleteUser(userId) {
    const users = this.getUsers().filter(u => u.id !== userId);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  // Inspection Items
  getItems() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ITEMS)) || [];
  },
  saveItem(item) {
    const items = this.getItems();
    const index = items.findIndex(i => i.id === item.id);
    if (index > -1) items[index] = item;
    else items.push({ ...item, id: Date.now().toString() });
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  },
  deleteItem(itemId) {
    const items = this.getItems().filter(i => i.id !== itemId);
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  },

  // Reports (Official)
  getReports() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.REPORTS)) || [];
  },
  saveReport(report) {
    const reports = this.getReports();
    reports.push({ ...report, id: Date.now().toString(), date: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  },

  // Self Assessments (Virtual)
  getSelfAssessments() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SELF_ASSESSMENTS)) || [];
  },
  saveSelfAssessment(assessment) {
    const assessments = this.getSelfAssessments();
    assessments.push({ ...assessment, id: Date.now().toString(), date: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEYS.SELF_ASSESSMENTS, JSON.stringify(assessments));
  }
};
