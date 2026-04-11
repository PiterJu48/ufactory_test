class AppHeader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const title = this.getAttribute('page-title') || '동물복지 인증 농장 점검 시스템';
    const role = sessionStorage.getItem('awcfis_role') || 'NONE';
    
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
        }
        nav ul {
          display: flex;
          list-style: none;
          gap: 1.5rem;
          margin: 0;
          padding: 0;
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
        .role-badge {
          background: rgba(255,255,255,0.2);
          padding: 0.3rem 0.8rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: bold;
          text-transform: uppercase;
        }
        @media (max-width: 600px) {
          header { padding: 1rem; flex-direction: column; gap: 1rem; }
        }
      </style>
      <header>
        <div class="logo">
          <span>🌿</span> AWCFIS
        </div>
        <nav>
          <ul>
            <li><a href="index.html">홈</a></li>
            ${role === 'ADMIN' ? '<li><a href="admin.html">관리자</a></li>' : ''}
            ${role === 'INSPECTOR' ? '<li><a href="inspector.html">점검자</a></li>' : ''}
            ${role === 'OWNER' ? '<li><a href="owner.html">농장주</a></li>' : ''}
            <li><a href="#" id="logout">로그아웃</a></li>
          </ul>
        </nav>
        <div class="role-badge">${role}</div>
      </header>
    `;

    this.shadowRoot.getElementById('logout').addEventListener('click', (e) => {
      e.preventDefault();
      sessionStorage.removeItem('awcfis_role');
      window.location.href = 'index.html';
    });
  }
}

customElements.define('app-header', AppHeader);
