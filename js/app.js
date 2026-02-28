/* ============================================================
   js/app.js — Application bootstrap and main controller
   ============================================================ */

const App = {

  init() {
    // Seed demo data if first run
    DB.seedIfEmpty();

    // Check if user is logged in
    const user = DB.getCurrentUser();
    if (user) {
      this.onLogin(user);
    } else {
      this.showAuth();
    }
  },

  onLogin(user) {
    // Hide auth screen, show main app
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    this.updateNavAvatar();
    UI.updateNotifBadge();
    Auth.init(); // re-init auth forms if needed later
    UI.navigate('home');
  },

  showAuth() {
    document.getElementById('mainApp').classList.add('hidden');
    document.getElementById('authScreen').classList.remove('hidden');
    document.getElementById('authLoginPanel').classList.remove('hidden');
    document.getElementById('authRegisterPanel').classList.add('hidden');
    Auth.init();
  },

  updateNavAvatar() {
    const user = DB.getCurrentUser();
    const el = document.getElementById('navAvatar');
    if (!el || !user) return;
    const initials = user.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
    el.textContent = initials;
  },
};

// ── Page render hooks ──────────────────────────────────────────
window.Pages = {
  home() {
    const user = DB.getCurrentUser();
    const projects = DB.getProjects();
    const el = document.getElementById('homeContent');
    if (!el || !user) return;

    // Summary stats
    const totalProjects = projects.length;
    const openProjects  = projects.filter(p => p.isOpen).length;
    const myProjects    = projects.filter(p => p.creatorId === user.id).length;
    const topProjects   = projects.filter(p => p.isOpen && p.creatorId !== user.id)
                                  .sort((a,b) => DB.compatScore(user.skills, b.requiredSkills) - DB.compatScore(user.skills, a.requiredSkills))
                                  .slice(0, 3);

    el.innerHTML = `
      <!-- Hero greeting -->
      <div class="card mb-24" style="background: linear-gradient(135deg, #1A1718 0%, #1e1520 50%, #1A1718 100%); border-color: var(--gold-dim); position:relative; overflow:hidden;">
        <div style="position:absolute;top:-40px;right:-40px;width:160px;height:160px;background:var(--gold-soft);border-radius:50%;filter:blur(60px);pointer-events:none;"></div>
        <div style="position:relative;">
          <div class="text-muted text-sm mb-4">Welcome back,</div>
          <h1 style="font-size:clamp(1.5rem,3vw,2.2rem);margin-bottom:8px;">${user.name} <span class="text-gold">✦</span></h1>
          <p class="text-muted text-sm" style="max-width:480px;">Find your next project, build something great, and grow your skills alongside talented people.</p>
          <div class="flex gap-8 mt-16 flex-wrap">
            <button class="btn btn-primary" onclick="UI.navigate('projects')">Browse Projects</button>
            <button class="btn btn-outline" onclick="Projects.openCreate()">+ Create Project</button>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid-3 mb-24">
        <div class="stat-card">
          <div class="stat-num">${totalProjects}</div>
          <div class="stat-label">TOTAL PROJECTS</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">${openProjects}</div>
          <div class="stat-label">OPEN FOR TEAMS</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">${myProjects}</div>
          <div class="stat-label">MY PROJECTS</div>
        </div>
      </div>

      <!-- Best Matches -->
      <div class="section-header mb-16">
        <h2><span class="section-title-accent"></span>Best Matches for You</h2>
        <a href="#" onclick="UI.navigate('projects')" class="text-gold text-sm">See all →</a>
      </div>
      ${topProjects.length === 0
        ? `<div class="card">${UI.emptyState('No open projects yet. Be the first to <a href="#" onclick="Projects.openCreate()">create one</a>!', '⬡')}</div>`
        : topProjects.map(p => Projects.projectCardHtml(p, user)).join('')
      }
    `;
  },

  projects() {
    Projects.render();
  },

  dashboard() {
    Dashboard.render();
  },

  profile() {
    Profile.render();
  },
};

// ── Boot ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => App.init());