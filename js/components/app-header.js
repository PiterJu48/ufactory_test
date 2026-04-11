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
          background-color: #2e7d32;
          color: white;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          font-family: 'Inter', system-ui, sans-serif;
        }
        .logo {
          font-size: 1.5rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }
        nav ul {
          display: flex;
          list-style: none;
          gap: 1.5rem;
          margin: 0;
          padding: 0;
          align-items: center;
        }
        nav a {
          text-decoration: none;
          color: white;
          font-weight: 500;
          opacity: 0.9;
          transition: opacity 0.2s;
          font-size: 0.9rem;
        }
        nav a:hover {
          opacity: 1;
        }
        .role-info {
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }
        .role-badge {
          background: rgba(255,255,255,0.2);
          padding: 0.3rem 0.8rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: bold;
          text-transform: uppercase;
        }
        .user-name {
          font-size: 0.85rem;
          font-weight: 500;
        }
        @media (max-width: 768px) {
          header { padding: 1rem; flex-direction: column; gap: 1rem; }
        }
      </style>
      <header>
        <div class="logo" id="logo">
          <span>🌿</span> AWCFIS
        </div>
        <nav>
          <ul>
            <li><a href="index.html">홈</a></li>
            ${role === 'ADMIN' ? '<li><a href="admin.html">관리</a></li>' : ''}
            ${role === 'INSPECTOR' ? '<li><a href="inspector.html">점검</a></li>' : ''}
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
