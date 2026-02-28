/* ============================================================
   js/dashboard.js — Project dashboard, team, tasks, requests
   ============================================================ */

const Dashboard = {

  currentProjectId: null,

  render() {
    const user = DB.getCurrentUser();
    if (!user) return;

    const myProjects  = DB.getProjects().filter(p => p.creatorId === user.id);
    const teamProjects = DB.getProjects().filter(p => p.members.includes(user.id) && p.creatorId !== user.id);

    const el = document.getElementById('dashboardContent');
    if (!el) return;

    el.innerHTML = `
      <!-- Section: My Projects -->
      <div class="section-header mb-16">
        <h2><span class="section-title-accent"></span>My Projects</h2>
        <button class="btn btn-primary btn-sm" onclick="Projects.openCreate()">+ New Project</button>
      </div>

      ${myProjects.length === 0
        ? `<div class="card mb-24">${UI.emptyState('You haven\'t created any projects yet.', '⬡')}</div>`
        : `<div class="grid-2 mb-24">${myProjects.map(p => this.myProjectCardHtml(p)).join('')}</div>`
      }

      <!-- Section: Teams I'm In -->
      <div class="section-header mb-16">
        <h2><span class="section-title-accent"></span>Teams I'm In</h2>
      </div>
      ${teamProjects.length === 0
        ? `<div class="card mb-24">${UI.emptyState('You haven\'t joined any teams yet.', '◈')}</div>`
        : `<div class="grid-2 mb-24">${teamProjects.map(p => this.teamProjectCardHtml(p)).join('')}</div>`
      }
    `;
  },

  myProjectCardHtml(proj) {
    const pendingCount = (proj.pendingRequests || []).length;
    return `
      <div class="card" style="cursor:pointer;" onclick="Dashboard.openProject('${proj.id}')">
        <div class="flex-between mb-8">
          <span class="badge ${proj.isOpen ? 'badge-open' : 'badge-full'}">${proj.isOpen ? 'Open' : 'Full'}</span>
          ${pendingCount > 0 ? `<span class="badge badge-draft">⚡ ${pendingCount} pending</span>` : ''}
        </div>
        <h3 style="margin-bottom:6px;">${proj.title}</h3>
        <p class="text-sm text-muted mb-12" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${proj.description}</p>
        <div class="flex flex-wrap gap-8 mb-12">
          ${proj.requiredSkills.slice(0,3).map(s => `<span class="chip chip-muted text-xs">${s}</span>`).join('')}
          ${proj.requiredSkills.length > 3 ? `<span class="chip chip-muted text-xs">+${proj.requiredSkills.length - 3}</span>` : ''}
        </div>
        <div class="flex-between" style="border-top:1px solid var(--border);padding-top:12px;">
          <div class="text-xs text-muted">${proj.members.length}/${proj.teamSize} members</div>
          <span class="text-gold text-xs">Manage →</span>
        </div>
      </div>
    `;
  },

  teamProjectCardHtml(proj) {
    const creator = DB.getUserById(proj.creatorId);
    return `
      <div class="card" style="cursor:pointer;" onclick="Dashboard.openProject('${proj.id}')">
        <span class="badge badge-open mb-8">Member</span>
        <h3 style="margin-bottom:6px;">${proj.title}</h3>
        <p class="text-sm text-muted mb-12" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${proj.description}</p>
        <div class="flex-between" style="border-top:1px solid var(--border);padding-top:12px;">
          <div class="text-xs text-muted">Led by ${creator?.name || 'Unknown'}</div>
          <span class="text-gold text-xs">View →</span>
        </div>
      </div>
    `;
  },

  // ── Open project detail modal ──────────────────────────────
  openProject(projectId) {
    this.currentProjectId = projectId;
    const proj = DB.getProjectById(projectId);
    if (!proj) return;
    const user = DB.getCurrentUser();
    const isCreator = proj.creatorId === user?.id;

    const modal = document.getElementById('projectDetailModal');
    modal.querySelector('.modal-header h3').textContent = proj.title;

    const body = document.getElementById('projectDetailBody');
    body.innerHTML = `
      <!-- Tabs -->
      <div class="flex gap-8 mb-20" style="border-bottom:1px solid var(--border);padding-bottom:0;">
        ${['Overview','Team','Updates','Tasks', isCreator ? 'Requests' : ''].filter(Boolean).map((tab, i) =>
          `<button class="nav-btn proj-tab ${i===0?'active':''}" data-tab="${tab.toLowerCase()}" onclick="Dashboard.switchTab('${tab.toLowerCase()}')">${tab}</button>`
        ).join('')}
      </div>

      <!-- Tab Panels -->
      <div id="tab-overview">${this.renderOverview(proj, user)}</div>
      <div id="tab-team" class="hidden">${this.renderTeam(proj)}</div>
      <div id="tab-updates" class="hidden">${this.renderUpdates(proj, isCreator)}</div>
      <div id="tab-tasks" class="hidden">${this.renderTasks(proj, isCreator)}</div>
      ${isCreator ? `<div id="tab-requests" class="hidden">${this.renderRequests(proj)}</div>` : ''}
    `;

    UI.openModal('projectDetailModal');
  },

  switchTab(tab) {
    document.querySelectorAll('.proj-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    document.querySelectorAll('[id^="tab-"]').forEach(p => p.classList.add('hidden'));
    const panel = document.getElementById('tab-' + tab);
    if (panel) panel.classList.remove('hidden');
  },

  renderOverview(proj, user) {
    const creator = DB.getUserById(proj.creatorId);
    const score = DB.compatScore(user?.skills || [], proj.requiredSkills);
    const { matched, missing } = DB.matchedSkills(user?.skills || [], proj.requiredSkills);
    const isCreator = proj.creatorId === user?.id;
    return `
      <p class="text-sm mb-16" style="line-height:1.75;color:var(--text);">${proj.description}</p>
      <div class="grid-2 mb-16">
        <div>
          <div class="text-xs text-muted mb-6">Required Skills</div>
          <div class="flex flex-wrap gap-8">
            ${proj.requiredSkills.map(s => `<span class="chip ${matched.includes(s) ? 'chip-green' : ''}">${matched.includes(s) ? '✓ ' : ''}${s}</span>`).join('')}
          </div>
        </div>
        <div>
          <div class="text-xs text-muted mb-6">Category</div>
          <span class="chip chip-violet">${proj.category}</span>
          <div class="text-xs text-muted mt-12 mb-6">Team Size</div>
          <span class="chip">${proj.members.length} / ${proj.teamSize}</span>
        </div>
      </div>
      ${user && !isCreator ? `
        <div style="background:var(--surface2);border-radius:var(--radius-sm);padding:14px;margin-bottom:16px;">
          <div class="flex-between mb-6">
            <span class="text-sm" style="font-weight:600;">Your Compatibility</span>
            ${UI.compatHtml(score)}
          </div>
          <div class="compat-bar"><div class="compat-fill" style="width:${score}%"></div></div>
          ${matched.length ? `<div class="text-xs text-muted mt-6">You bring: ${matched.join(', ')}</div>` : ''}
          ${missing.length ? `<div class="text-xs" style="color:var(--red);margin-top:4px;">Missing: ${missing.join(', ')}</div>` : ''}
        </div>
      ` : ''}
      <div class="flex-between">
        <div class="text-xs text-muted">Created by ${creator?.name} · ${UI.timeAgo(proj.createdAt)}</div>
        ${isCreator ? `
          <button class="btn btn-danger btn-sm" onclick="Dashboard.toggleProjectOpen('${proj.id}')">
            ${proj.isOpen ? 'Close Recruiting' : 'Reopen Recruiting'}
          </button>
        ` : ''}
      </div>
    `;
  },

  renderTeam(proj) {
    const user = DB.getCurrentUser();
    const isCreator = proj.creatorId === user?.id;
    return `
      <div>
        ${proj.members.map(uid => {
          const member = DB.getUserById(uid);
          if (!member) return '';
          const isOwner = uid === proj.creatorId;
          return `
            <div class="flex-between mb-12 pb-12" style="border-bottom:1px solid var(--border);">
              <div class="flex gap-12 align-items-center" style="align-items:center;">
                ${UI.avatarHtml(member, 'sm')}
                <div>
                  <div style="font-weight:600;font-size:14px;">${member.name} ${isOwner ? '<span class="badge badge-draft">Creator</span>' : ''}</div>
                  <div class="text-xs text-muted">${member.department || ''} ${member.year ? '· ' + member.year : ''}</div>
                  <div class="flex flex-wrap gap-4 mt-4">
                    ${(member.skills || []).slice(0,4).map(s => `<span class="chip chip-muted text-xs">${s}</span>`).join('')}
                  </div>
                </div>
              </div>
              ${isCreator && !isOwner ? `<button class="btn btn-ghost btn-sm" onclick="Dashboard.removeMember('${proj.id}','${uid}')">Remove</button>` : ''}
            </div>
          `;
        }).join('')}
        ${proj.members.length < proj.teamSize
          ? `<div class="text-muted text-sm" style="text-align:center;padding:16px;">${proj.teamSize - proj.members.length} open spot${proj.teamSize - proj.members.length !== 1 ? 's' : ''} remaining</div>`
          : ''}
      </div>
    `;
  },

  renderUpdates(proj, isCreator) {
    const updates = (proj.updates || []).slice().reverse();
    return `
      ${isCreator ? `
        <div class="mb-16" style="background:var(--surface2);padding:14px;border-radius:var(--radius-sm);">
          <textarea class="form-control" id="newUpdateText" placeholder="Post a project update..." rows="2"></textarea>
          <button class="btn btn-primary btn-sm mt-8" onclick="Dashboard.postUpdate('${proj.id}')">Post Update</button>
        </div>
      ` : ''}
      ${updates.length === 0
        ? UI.emptyState('No updates yet.', '◈')
        : updates.map(u => `
          <div class="mb-12 pb-12" style="border-bottom:1px solid var(--border);">
            <div class="text-sm" style="line-height:1.7;">${u.text}</div>
            <div class="text-xs text-muted mt-4">— ${u.author} · ${UI.timeAgo(u.date)}</div>
          </div>
        `).join('')
      }
    `;
  },

  renderTasks(proj, isCreator) {
    const tasks = proj.tasks || [];
    return `
      ${isCreator ? `
        <div class="mb-16" style="background:var(--surface2);padding:14px;border-radius:var(--radius-sm);">
          <div class="grid-2" style="gap:8px;">
            <input class="form-control" id="newTaskTitle" placeholder="Task title...">
            <select class="form-control" id="newTaskAssignee">
              <option value="">Unassigned</option>
              ${proj.members.map(uid => { const u = DB.getUserById(uid); return u ? `<option value="${uid}">${u.name}</option>` : ''; }).join('')}
            </select>
          </div>
          <button class="btn btn-primary btn-sm mt-8" onclick="Dashboard.addTask('${proj.id}')">Add Task</button>
        </div>
      ` : ''}
      ${tasks.length === 0
        ? UI.emptyState('No tasks yet.', '☐')
        : tasks.map((t, i) => {
          const assignee = t.assigneeId ? DB.getUserById(t.assigneeId) : null;
          return `
            <div class="flex-between mb-10 pb-10" style="border-bottom:1px solid var(--border);">
              <div class="flex gap-12 align-items-center" style="align-items:center;">
                <input type="checkbox" ${t.done ? 'checked' : ''} onchange="Dashboard.toggleTask('${proj.id}', ${i})"
                  style="width:16px;height:16px;accent-color:var(--gold);cursor:pointer;">
                <div>
                  <div class="text-sm ${t.done ? 'text-muted' : ''}" style="${t.done ? 'text-decoration:line-through;' : ''}">${t.title}</div>
                  ${assignee ? `<div class="text-xs text-muted">→ ${assignee.name}</div>` : ''}
                </div>
              </div>
              ${isCreator ? `<button class="btn btn-ghost btn-sm" onclick="Dashboard.deleteTask('${proj.id}', ${i})">✕</button>` : ''}
            </div>
          `;
        }).join('')
      }
    `;
  },

  renderRequests(proj) {
    const requests = DB.getRequestsForProject(proj.id).filter(r => r.status === 'pending');
    if (!requests.length) return UI.emptyState('No pending join requests.', '◉');
    return requests.map(r => {
      const requester = DB.getUserById(r.userId);
      if (!requester) return '';
      const score = DB.compatScore(requester.skills || [], proj.requiredSkills);
      const { matched } = DB.matchedSkills(requester.skills || [], proj.requiredSkills);
      return `
        <div class="card mb-12">
          <div class="flex gap-12 mb-12" style="align-items:flex-start;">
            ${UI.avatarHtml(requester, 'md')}
            <div style="flex:1;">
              <div class="flex-between">
                <div>
                  <div style="font-weight:700;">${requester.name}</div>
                  <div class="text-xs text-muted">${requester.department || ''} ${requester.year ? '· ' + requester.year : ''}</div>
                </div>
                ${UI.compatHtml(score)}
              </div>
              <div class="flex flex-wrap gap-6 mt-8">
                ${(requester.skills || []).map(s => `<span class="chip ${matched.includes(s) ? 'chip-green' : 'chip-muted'} text-xs">${s}</span>`).join('')}
              </div>
              ${r.message ? `<p class="text-sm mt-8" style="font-style:italic;color:var(--text);">"${r.message}"</p>` : ''}
            </div>
          </div>
          <div class="flex gap-8">
            <button class="btn btn-primary btn-sm" onclick="Dashboard.resolveReq('${r.id}', true, '${proj.id}')">Accept</button>
            <button class="btn btn-danger btn-sm" onclick="Dashboard.resolveReq('${r.id}', false, '${proj.id}')">Decline</button>
          </div>
        </div>
      `;
    }).join('');
  },

  // ── Actions ────────────────────────────────────────────────
  resolveReq(reqId, accept, projectId) {
    const req = DB.getRequests().find(r => r.id === reqId);
    if (!req) return;
    DB.resolveRequest(reqId, accept);
    const requester = DB.getUserById(req.userId);
    const proj = DB.getProjectById(projectId);
    if (accept) {
      DB.addNotif(req.userId, `You were accepted into "${proj?.title}"! 🎉`, 'success');
      UI.toast(`${requester?.name} accepted!`, 'success');
    } else {
      DB.addNotif(req.userId, `Your request to join "${proj?.title}" was declined.`, 'error');
      UI.toast(`${requester?.name} declined.`, 'info');
    }
    UI.updateNotifBadge();
    // refresh requests tab
    const panel = document.getElementById('tab-requests');
    if (panel) {
      const updatedProj = DB.getProjectById(projectId);
      panel.innerHTML = this.renderRequests(updatedProj);
    }
    // refresh team tab
    const teamPanel = document.getElementById('tab-team');
    if (teamPanel && accept) {
      const updatedProj = DB.getProjectById(projectId);
      teamPanel.innerHTML = this.renderTeam(updatedProj);
    }
    this.render();
  },

  postUpdate(projectId) {
    const text = document.getElementById('newUpdateText').value.trim();
    if (!text) return;
    const proj = DB.getProjectById(projectId);
    const user = DB.getCurrentUser();
    proj.updates = proj.updates || [];
    proj.updates.push({ text, author: user.name, date: Date.now() });
    DB.updateProject(proj);
    // notify all members
    proj.members.filter(id => id !== user.id).forEach(id => {
      DB.addNotif(id, `New update in "${proj.title}": ${text.slice(0,60)}...`, 'info');
    });
    UI.toast('Update posted!', 'success');
    UI.updateNotifBadge();
    document.getElementById('tab-updates').innerHTML = this.renderUpdates(proj, true);
  },

  addTask(projectId) {
    const title = document.getElementById('newTaskTitle').value.trim();
    const assigneeId = document.getElementById('newTaskAssignee').value;
    if (!title) { UI.toast('Enter a task title.', 'error'); return; }
    const proj = DB.getProjectById(projectId);
    proj.tasks = proj.tasks || [];
    proj.tasks.push({ title, assigneeId, done: false, createdAt: Date.now() });
    DB.updateProject(proj);
    const isCreator = proj.creatorId === DB.getCurrentUser()?.id;
    document.getElementById('tab-tasks').innerHTML = this.renderTasks(proj, isCreator);
    UI.toast('Task added!', 'success');
  },

  toggleTask(projectId, idx) {
    const proj = DB.getProjectById(projectId);
    proj.tasks[idx].done = !proj.tasks[idx].done;
    DB.updateProject(proj);
  },

  deleteTask(projectId, idx) {
    const proj = DB.getProjectById(projectId);
    proj.tasks.splice(idx, 1);
    DB.updateProject(proj);
    const isCreator = proj.creatorId === DB.getCurrentUser()?.id;
    document.getElementById('tab-tasks').innerHTML = this.renderTasks(proj, isCreator);
  },

  removeMember(projectId, userId) {
    if (!confirm('Remove this member from the project?')) return;
    const proj = DB.getProjectById(projectId);
    proj.members = proj.members.filter(id => id !== userId);
    proj.isOpen = true;
    DB.updateProject(proj);
    const user = DB.getUserById(userId);
    if (user) {
      user.joinedProjects = (user.joinedProjects || []).filter(id => id !== projectId);
      DB.updateUser(user);
    }
    DB.addNotif(userId, `You were removed from "${proj.title}".`, 'error');
    UI.toast('Member removed.', 'info');
    document.getElementById('tab-team').innerHTML = this.renderTeam(proj);
    this.render();
  },

  toggleProjectOpen(projectId) {
    const proj = DB.getProjectById(projectId);
    proj.isOpen = !proj.isOpen;
    DB.updateProject(proj);
    UI.toast(proj.isOpen ? 'Recruiting reopened!' : 'Recruiting closed.', 'info');
    this.openProject(projectId);
    this.render();
    Projects.renderList();
  },
};