import { Storage } from '../storage.js';

class AppHeader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const user = Storage.getUser();
    const role = user ? user.role : 'GUEST';
    const name = user ? user.name : '';
    
    this.shadowRoot.innerHTML = `
      <style>
        header {
          background-color: #ffffff;
          color: #1b3a6d;
          padding: 0 2rem;
          height: 70px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 1px 0 rgba(0,0,0,0.05);
          border-bottom: 3px solid #1b3a6d;
          font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .logo {
          font-size: 1.4rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          cursor: pointer;
          color: #1b3a6d;
          display: flex;
          align-items: center;
        }
        .logo-text {
          border-left: 2px solid #ddd;
          margin-left: 10px;
          padding-left: 10px;
          font-size: 0.9rem;
          font-weight: 500;
          color: #666;
        }
        nav ul {
          display: flex;
          list-style: none;
          gap: 2.5rem;
          margin: 0;
          padding: 0;
          align-items: center;
          height: 70px;
        }
        nav li {
          height: 100%;
          display: flex;
          align-items: center;
        }
        nav a {
          text-decoration: none;
          color: #444;
          font-weight: 600;
          font-size: 0.95rem;
          height: 100%;
          display: flex;
          align-items: center;
          position: relative;
          transition: color 0.2s;
        }
        nav a:hover {
          color: #1b3a6d;
        }
        .role-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .role-badge {
          background: #f8f9fa;
          color: #495057;
          border: 1px solid #dee2e6;
          padding: 0.2rem 0.6rem;
          border-radius: 2px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .user-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: #333;
        }
        @media (max-width: 768px) {
          header { height: auto; padding: 1rem; flex-direction: column; gap: 1rem; }
          nav ul { height: auto; gap: 1rem; }
          nav a { padding: 0.5rem 0; }
        }
      </style>
      <header>
        <div class="logo" id="logo">
          AWCFIS <span class="logo-text">동물복지인증농장 통합관리시스템</span>
        </div>
        <nav>
          <ul>
            <li><a href="index.html">홈</a></li>
            ${role === 'ADMIN' ? '<li><a href="admin.html">시스템관리</a></li>' : ''}
            ${role === 'ADMIN' ? '<li><a href="items.html">평가항목 관리</a></li>' : ''}
            ${role === 'INSPECTOR' ? '<li><a href="inspector.html">현장점검</a></li>' : ''}
            ${role === 'OWNER' ? '<li><a href="owner.html">자가진단</a></li>' : ''}
            ${user ? '<li><a href="#" id="logout">로그아웃</a></li>' : ''}
          </ul>
        </nav>
        <div class="role-info">
          ${name ? `<span class="user-name">${name} 님</span>` : ''}
          <div class="role-badge">${role}</div>
        </div>
      </header>
    `;

    this.shadowRoot.getElementById('logo').onclick = () => window.location.href = 'index.html';
    
    const logoutBtn = this.shadowRoot.getElementById('logout');
    if (logoutBtn) {
      logoutBtn.onclick = (e) => {
        e.preventDefault();
        Storage.logout();
      };
    }
  }
}

customElements.define('app-header', AppHeader);
