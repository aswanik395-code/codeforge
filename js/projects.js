/* ============================================================
   js/projects.js — Browse projects, create, join, filter
   ============================================================ */

const Projects = {

  CATEGORIES: ['All', 'AI/ML', 'Web', 'Mobile', 'DevTools', 'Game Dev', 'Data Science', 'Design', 'General'],
  createSkills: [],
  filterCategory: 'All',
  searchQuery: '',

  render() {
    this.renderList();
  },

  // ── Render project list with search/filter ─────────────────
  renderList() {
    const user = DB.getCurrentUser();
    let projects = DB.getProjects();

    // filter
    if (this.filterCategory !== 'All') {
      projects = projects.filter(p => p.category === this.filterCategory);
    }
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      projects = projects.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.requiredSkills.some(s => s.toLowerCase().includes(q))
      );
    }

    // sort newest first
    projects = projects.sort((a,b) => b.createdAt - a.createdAt);

    const listEl = document.getElementById('projectList');
    if (!listEl) return;

    if (!projects.length) {
      listEl.innerHTML = UI.emptyState('No projects found. Try adjusting your filters or <a href="#" onclick="Projects.openCreate()">create a new one</a>.', '⬡');
      return;
    }

    listEl.innerHTML = projects.map(p => this.projectCardHtml(p, user)).join('');
  },

  projectCardHtml(proj, user) {
    const score = DB.compatScore(user?.skills || [], proj.requiredSkills);
    const { matched, missing } = DB.matchedSkills(user?.skills || [], proj.requiredSkills);
    const openSpots = proj.teamSize - proj.members.length;
    const isCreator = proj.creatorId === user?.id;
    const isMember  = proj.members.includes(user?.id);
    const hasRequested = DB.getRequestsByUser(user?.id || '').some(r => r.projectId === proj.id);
    const creator = DB.getUserById(proj.creatorId);

    let actionBtn = '';
    if (isCreator) {
      actionBtn = `<button class="btn btn-ghost btn-sm" onclick="Dashboard.openProject('${proj.id}')">Manage →</button>`;
    } else if (isMember) {
      actionBtn = `<span class="badge badge-open">✓ Joined</span>`;
    } else if (hasRequested) {
      actionBtn = `<span class="badge badge-draft">Request Sent</span>`;
    } else if (!proj.isOpen) {
      actionBtn = `<span class="badge badge-full">Team Full</span>`;
    } else {
      actionBtn = `<button class="btn btn-primary btn-sm" onclick="Projects.openJoinModal('${proj.id}')">Request to Join</button>`;
    }

    return `
      <div class="card mb-16 project-card" style="cursor:default;">
        <div class="flex-between mb-8">
          <div class="flex gap-8 align-items-center" style="align-items:center;">
            <span class="badge ${proj.isOpen ? 'badge-open' : 'badge-full'}">${proj.isOpen ? '● Open' : '⊗ Full'}</span>
            <span class="chip chip-muted text-xs">${proj.category}</span>
          </div>
          <span class="text-xs text-muted">${UI.timeAgo(proj.createdAt)}</span>
        </div>

        <h3 style="margin-bottom:8px;">${proj.title}</h3>
        <p class="text-sm text-muted mb-16" style="line-height:1.65;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;">${proj.description}</p>

        <!-- Skills required -->
        <div class="mb-12">
          <div class="text-xs text-muted mb-4">Required Skills</div>
          <div class="flex flex-wrap gap-8">
            ${proj.requiredSkills.map(s => {
              const has = matched.includes(s);
              return `<span class="chip ${has ? 'chip-green' : 'chip-muted'}">${has ? '✓ ' : ''}${s}</span>`;
            }).join('')}
          </div>
        </div>

        <!-- Compatibility -->
        ${user ? `
          <div class="mb-12">
            <div class="flex-between mb-4">
              <span class="text-xs text-muted">Compatibility</span>
              ${UI.compatHtml(score)}
            </div>
            <div class="compat-bar"><div class="compat-fill" style="width:${score}%"></div></div>
            ${missing.length ? `<div class="text-xs text-muted mt-4">Missing: ${missing.join(', ')}</div>` : ''}
          </div>
        ` : ''}

        <!-- Footer -->
        <div class="flex-between mt-12" style="border-top:1px solid var(--border);padding-top:12px;">
          <div class="flex gap-8 align-items-center" style="align-items:center;">
            ${creator ? UI.avatarHtml(creator, 'sm') : ''}
            <div>
              <div class="text-xs" style="font-weight:600;">${creator?.name || 'Unknown'}</div>
              <div class="text-xs text-muted">${proj.members.length}/${proj.teamSize} members · ${openSpots} spot${openSpots !== 1 ? 's' : ''} left</div>
            </div>
          </div>
          ${actionBtn}
        </div>
      </div>
    `;
  },

  // ── Create Project ─────────────────────────────────────────
  openCreate() {
    this.createSkills = [];
    document.getElementById('createTitle').value = '';
    document.getElementById('createDesc').value = '';
    document.getElementById('createCategory').value = 'General';
    document.getElementById('createTeamSize').value = '4';
    UI.renderChipSelector('createSkillChips', Auth.SKILLS, this.createSkills, () => {});
    UI.openModal('createProjectModal');
  },

  saveCreate() {
    const title    = document.getElementById('createTitle').value.trim();
    const desc     = document.getElementById('createDesc').value.trim();
    const category = document.getElementById('createCategory').value;
    const teamSize = document.getElementById('createTeamSize').value;
    const user     = DB.getCurrentUser();

    if (!title || !desc) { UI.toast('Title and description are required.', 'error'); return; }
    if (this.createSkills.length === 0) { UI.toast('Add at least one required skill.', 'error'); return; }

    const proj = DB.createProject({ title, description: desc, category, requiredSkills: this.createSkills, teamSize }, user.id);
    DB.addNotif(user.id, `Your project "${proj.title}" was created successfully!`, 'success');
    UI.closeModal('createProjectModal');
    UI.toast('Project created! 🎉', 'success');
    this.renderList();
    UI.updateNotifBadge();
  },

  // ── Join Request ───────────────────────────────────────────
  openJoinModal(projectId) {
    const proj = DB.getProjectById(projectId);
    if (!proj) return;
    document.getElementById('joinProjectId').value = projectId;
    document.getElementById('joinProjectTitle').textContent = proj.title;
    document.getElementById('joinMessage').value = '';
    UI.openModal('joinProjectModal');
  },

  submitJoin() {
    const projectId = document.getElementById('joinProjectId').value;
    const message   = document.getElementById('joinMessage').value.trim();
    const user      = DB.getCurrentUser();

    const result = DB.createRequest(projectId, user.id, message);
    if (!result.ok) { UI.toast(result.msg, 'error'); return; }

    const proj = DB.getProjectById(projectId);
    DB.addNotif(proj.creatorId, `${user.name} requested to join "${proj.title}"`, 'info');
    UI.closeModal('joinProjectModal');
    UI.toast('Request sent!', 'success');
    this.renderList();
    UI.updateNotifBadge();
  },

  // ── Filter & Search ────────────────────────────────────────
  setCategory(cat) {
    this.filterCategory = cat;
    document.querySelectorAll('.filter-cat-btn').forEach(b => {
      b.classList.toggle('active-filter', b.dataset.cat === cat);
    });
    this.renderList();
  },

  setSearch(q) {
    this.searchQuery = q;
    this.renderList();
  },
};