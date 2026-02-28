/* ============================================================
   js/profile.js — User profile view and edit
   ============================================================ */

const Profile = {

  editSkills: [],

  render() {
    const user = DB.getCurrentUser();
    if (!user) return;

    // ── Stats ──────────────────────────────────────────────
    const myProjects = DB.getProjects().filter(p => p.creatorId === user.id);
    const joinedProjects = DB.getProjects().filter(p => p.members.includes(user.id) && p.creatorId !== user.id);
    const pendingRequests = DB.getRequestsByUser(user.id).filter(r => r.status === 'pending');

    document.getElementById('profileContent').innerHTML = `
      <!-- Profile Header -->
      <div class="card mb-24" style="background: linear-gradient(135deg, var(--surface) 0%, #1e1820 100%);">
        <div class="flex gap-16 align-items-start" style="align-items:flex-start;">
          ${UI.avatarHtml(user, 'lg')}
          <div style="flex:1;">
            <div class="flex-between flex-wrap gap-8">
              <div>
                <h2 style="margin-bottom:4px;">${user.name}</h2>
                <div class="text-muted text-sm">${user.email}</div>
              </div>
              <button class="btn btn-outline btn-sm" onclick="Profile.openEdit()">✎ Edit Profile</button>
            </div>
            <div class="flex gap-8 mt-8 flex-wrap">
              ${user.department ? `<span class="chip chip-muted">🏛 ${user.department}</span>` : ''}
              ${user.year ? `<span class="chip chip-muted">📅 ${user.year}</span>` : ''}
            </div>
            ${user.bio ? `<p class="mt-8 text-sm" style="color:var(--text);max-width:500px;line-height:1.7;">${user.bio}</p>` : ''}
          </div>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="grid-3 mb-24">
        <div class="stat-card">
          <div class="stat-num">${myProjects.length}</div>
          <div class="stat-label">PROJECTS CREATED</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">${joinedProjects.length}</div>
          <div class="stat-label">TEAMS JOINED</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">${pendingRequests.length}</div>
          <div class="stat-label">PENDING REQUESTS</div>
        </div>
      </div>

      <div class="grid-2">
        <!-- Skills -->
        <div class="card">
          <h3 class="mb-16"><span class="section-title-accent"></span>My Skills</h3>
          ${user.skills.length
            ? `<div class="flex flex-wrap gap-8">${user.skills.map(s => UI.chipHtml(s)).join('')}</div>`
            : `<p class="text-muted text-sm">No skills added yet.</p>`
          }
        </div>

        <!-- Projects I Created -->
        <div class="card">
          <h3 class="mb-16"><span class="section-title-accent"></span>Projects I Created</h3>
          ${myProjects.length === 0
            ? `<p class="text-muted text-sm">No projects yet. <a href="#" onclick="UI.navigate('projects')">Create one →</a></p>`
            : myProjects.map(p => `
              <div class="flex-between mb-8 pb-8" style="border-bottom:1px solid var(--border);">
                <div>
                  <div class="text-sm" style="font-weight:600;">${p.title}</div>
                  <div class="text-xs text-muted">${p.members.length}/${p.teamSize} members</div>
                </div>
                <span class="badge ${p.isOpen ? 'badge-open' : 'badge-full'}">${p.isOpen ? 'Open' : 'Full'}</span>
              </div>
            `).join('')
          }
        </div>
      </div>

      <!-- My Teams -->
      ${joinedProjects.length > 0 ? `
        <div class="card mt-24">
          <h3 class="mb-16"><span class="section-title-accent"></span>Teams I'm In</h3>
          <div class="grid-2">
            ${joinedProjects.map(p => `
              <div style="padding:14px;background:var(--surface2);border-radius:var(--radius-sm);">
                <div style="font-weight:600;font-size:14px;">${p.title}</div>
                <div class="text-xs text-muted mt-4">${p.category} · ${p.members.length} members</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Join Requests Sent -->
      <div id="myRequestsSection" class="card mt-24">
        <h3 class="mb-16"><span class="section-title-accent"></span>Join Requests Sent</h3>
        ${Profile.renderMyRequests(user.id)}
      </div>
    `;
  },

  renderMyRequests(userId) {
    const requests = DB.getRequestsByUser(userId);
    if (!requests.length) return `<p class="text-muted text-sm">No requests sent yet.</p>`;
    return requests.map(r => {
      const proj = DB.getProjectById(r.projectId);
      if (!proj) return '';
      const statusClass = { pending: 'badge-draft', accepted: 'badge-open', rejected: 'badge-full' }[r.status];
      return `
        <div class="flex-between mb-8 pb-8" style="border-bottom:1px solid var(--border);">
          <div>
            <div class="text-sm" style="font-weight:600;">${proj.title}</div>
            <div class="text-xs text-muted">${UI.timeAgo(r.createdAt)}</div>
          </div>
          <span class="badge ${statusClass}">${r.status}</span>
        </div>
      `;
    }).join('');
  },

  openEdit() {
    const user = DB.getCurrentUser();
    this.editSkills = [...(user.skills || [])];
    document.getElementById('editName').value = user.name;
    document.getElementById('editBio').value = user.bio || '';
    document.getElementById('editDept').value = user.department || '';
    document.getElementById('editYear').value = user.year || '';
    document.getElementById('editAvatar').value = user.avatar || '';
    UI.renderChipSelector('editSkillChips', Auth.SKILLS, this.editSkills, () => {});
    UI.openModal('editProfileModal');
  },

  saveEdit() {
    const user = DB.getCurrentUser();
    const name = document.getElementById('editName').value.trim();
    if (!name) { UI.toast('Name is required.', 'error'); return; }
    if (this.editSkills.length === 0) { UI.toast('Select at least one skill.', 'error'); return; }
    const updated = {
      ...user,
      name,
      bio: document.getElementById('editBio').value.trim(),
      department: document.getElementById('editDept').value,
      year: document.getElementById('editYear').value,
      avatar: document.getElementById('editAvatar').value.trim(),
      skills: this.editSkills,
    };
    DB.updateUser(updated);
    UI.closeModal('editProfileModal');
    UI.toast('Profile updated!', 'success');
    this.render();
    App.updateNavAvatar();
  },
};