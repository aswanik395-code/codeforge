/* ============================================================
   js/data.js — LocalStorage data layer
   All CRUD operations for users, projects, notifications
   ============================================================ */

const DB = {
  // ── Keys ──────────────────────────────────────────────────
  KEYS: {
    USERS:    'cf_users',
    CURRENT:  'cf_current_user',
    PROJECTS: 'cf_projects',
    NOTIFS:   'cf_notifications',
    REQUESTS: 'cf_requests',
  },

  // ── Helpers ───────────────────────────────────────────────
  get(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch { return []; }
  },
  set(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  },
  getObj(key) {
    try { return JSON.parse(localStorage.getItem(key)) || null; }
    catch { return null; }
  },

  // ── Users ──────────────────────────────────────────────────
  getUsers()    { return this.get(this.KEYS.USERS); },
  saveUsers(u)  { this.set(this.KEYS.USERS, u); },

  getCurrentUser() { return this.getObj(this.KEYS.CURRENT); },
  setCurrentUser(u){ localStorage.setItem(this.KEYS.CURRENT, JSON.stringify(u)); },
  clearCurrentUser(){ localStorage.removeItem(this.KEYS.CURRENT); },

  getUserById(id) {
    return this.getUsers().find(u => u.id === id) || null;
  },
  updateUser(updated) {
    const users = this.getUsers().map(u => u.id === updated.id ? updated : u);
    this.saveUsers(users);
    if (this.getCurrentUser()?.id === updated.id) this.setCurrentUser(updated);
  },
  registerUser(data) {
    const users = this.getUsers();
    if (users.find(u => u.email === data.email)) return { ok: false, msg: 'Email already registered.' };
    const user = {
      id: 'u_' + Date.now(),
      name: data.name,
      email: data.email,
      password: data.password,
      department: data.department || '',
      year: data.year || '',
      bio: data.bio || '',
      skills: data.skills || [],
      avatar: data.avatar || '',
      projects: [],
      joinedProjects: [],
      createdAt: Date.now(),
    };
    users.push(user);
    this.saveUsers(users);
    this.setCurrentUser(user);
    return { ok: true, user };
  },
  loginUser(email, password) {
    const user = this.getUsers().find(u => u.email === email && u.password === password);
    if (!user) return { ok: false, msg: 'Invalid email or password.' };
    this.setCurrentUser(user);
    return { ok: true, user };
  },

  // ── Projects ───────────────────────────────────────────────
  getProjects()   { return this.get(this.KEYS.PROJECTS); },
  saveProjects(p) { this.set(this.KEYS.PROJECTS, p); },

  getProjectById(id) {
    return this.getProjects().find(p => p.id === id) || null;
  },
  createProject(data, creatorId) {
    const projects = this.getProjects();
    const proj = {
      id: 'p_' + Date.now(),
      title: data.title,
      description: data.description,
      category: data.category || 'General',
      requiredSkills: data.requiredSkills || [],
      teamSize: parseInt(data.teamSize) || 4,
      isOpen: true,
      creatorId,
      members: [creatorId],
      pendingRequests: [],
      updates: [],
      tasks: [],
      createdAt: Date.now(),
    };
    projects.push(proj);
    this.saveProjects(projects);
    // link project to user
    const user = this.getUserById(creatorId);
    if (user) {
      user.projects = user.projects || [];
      user.projects.push(proj.id);
      this.updateUser(user);
    }
    return proj;
  },
  updateProject(updated) {
    const projects = this.getProjects().map(p => p.id === updated.id ? updated : p);
    this.saveProjects(projects);
  },
  deleteProject(id) {
    const projects = this.getProjects().filter(p => p.id !== id);
    this.saveProjects(projects);
  },

  // ── Join Requests ──────────────────────────────────────────
  getRequests()   { return this.get(this.KEYS.REQUESTS); },
  saveRequests(r) { this.set(this.KEYS.REQUESTS, r); },

  getRequestsForProject(projectId) {
    return this.getRequests().filter(r => r.projectId === projectId);
  },
  getRequestsByUser(userId) {
    return this.getRequests().filter(r => r.userId === userId);
  },
  createRequest(projectId, userId, message) {
    const requests = this.getRequests();
    const exists = requests.find(r => r.projectId === projectId && r.userId === userId);
    if (exists) return { ok: false, msg: 'You already requested to join this project.' };
    const req = {
      id: 'r_' + Date.now(),
      projectId, userId, message,
      status: 'pending',
      createdAt: Date.now(),
    };
    requests.push(req);
    this.saveRequests(requests);
    // add to project's pendingRequests
    const proj = this.getProjectById(projectId);
    if (proj) {
      proj.pendingRequests = proj.pendingRequests || [];
      proj.pendingRequests.push(req.id);
      this.updateProject(proj);
    }
    return { ok: true, req };
  },
  resolveRequest(reqId, accept) {
    const requests = this.getRequests().map(r => {
      if (r.id !== reqId) return r;
      return { ...r, status: accept ? 'accepted' : 'rejected' };
    });
    this.saveRequests(requests);
    const req = requests.find(r => r.id === reqId);
    if (req && accept) {
      // add user to project members
      const proj = this.getProjectById(req.projectId);
      if (proj) {
        proj.members = proj.members || [];
        if (!proj.members.includes(req.userId)) proj.members.push(req.userId);
        proj.pendingRequests = (proj.pendingRequests || []).filter(id => id !== reqId);
        if (proj.members.length >= proj.teamSize) proj.isOpen = false;
        this.updateProject(proj);
      }
      // add project to user's joinedProjects
      const user = this.getUserById(req.userId);
      if (user) {
        user.joinedProjects = user.joinedProjects || [];
        if (!user.joinedProjects.includes(req.projectId)) user.joinedProjects.push(req.projectId);
        this.updateUser(user);
      }
    }
  },

  // ── Notifications ──────────────────────────────────────────
  getNotifs()   { return this.get(this.KEYS.NOTIFS); },
  saveNotifs(n) { this.set(this.KEYS.NOTIFS, n); },

  getNotifsByUser(userId) {
    return this.getNotifs().filter(n => n.userId === userId).sort((a,b) => b.createdAt - a.createdAt);
  },
  addNotif(userId, message, type = 'info') {
    const notifs = this.getNotifs();
    notifs.push({ id: 'n_' + Date.now(), userId, message, type, read: false, createdAt: Date.now() });
    this.saveNotifs(notifs);
  },
  markNotifRead(id) {
    const notifs = this.getNotifs().map(n => n.id === id ? { ...n, read: true } : n);
    this.saveNotifs(notifs);
  },
  markAllRead(userId) {
    const notifs = this.getNotifs().map(n => n.userId === userId ? { ...n, read: true } : n);
    this.saveNotifs(notifs);
  },

  // ── Compatibility Score ────────────────────────────────────
  compatScore(userSkills, requiredSkills) {
    if (!requiredSkills.length) return 100;
    const userSet = new Set(userSkills.map(s => s.toLowerCase()));
    const matched = requiredSkills.filter(s => userSet.has(s.toLowerCase()));
    return Math.round((matched.length / requiredSkills.length) * 100);
  },
  matchedSkills(userSkills, requiredSkills) {
    const userSet = new Set(userSkills.map(s => s.toLowerCase()));
    return {
      matched: requiredSkills.filter(s => userSet.has(s.toLowerCase())),
      missing: requiredSkills.filter(s => !userSet.has(s.toLowerCase())),
    };
  },

  // ── Seed Demo Data ─────────────────────────────────────────
  seedIfEmpty() {
    if (this.getProjects().length > 0) return;
    const demoUserId = 'u_demo';
    if (!this.getUserById(demoUserId)) {
      const users = this.getUsers();
      users.push({
        id: demoUserId, name: 'Demo User', email: 'demo@codeforge.dev',
        password: 'demo123', department: 'Computer Science', year: '3rd Year',
        bio: 'Passionate builder and open-source contributor.',
        skills: ['React', 'Node.js', 'Python', 'UI/UX'],
        avatar: '', projects: ['p_demo1', 'p_demo2'], joinedProjects: [],
        createdAt: Date.now() - 86400000,
      });
      this.saveUsers(users);
    }
    const projects = [
      {
        id: 'p_demo1', title: 'AI Study Companion',
        description: 'A smart study planner that adapts to your learning style using ML algorithms. Generates personalized quizzes, tracks progress, and suggests optimal study schedules.',
        category: 'AI/ML', requiredSkills: ['Python', 'TensorFlow', 'React', 'Node.js'],
        teamSize: 5, isOpen: true, creatorId: demoUserId,
        members: [demoUserId], pendingRequests: [], updates: [
          { text: 'MVP backend complete!', author: 'Demo User', date: Date.now() - 3600000 }
        ], tasks: [], createdAt: Date.now() - 172800000,
      },
      {
        id: 'p_demo2', title: 'Campus Event App',
        description: 'A mobile-first app for discovering, creating and RSVPing to campus events. Features real-time notifications, maps integration and a social feed.',
        category: 'Mobile', requiredSkills: ['React Native', 'Firebase', 'UX/UI', 'Node.js'],
        teamSize: 4, isOpen: true, creatorId: demoUserId,
        members: [demoUserId], pendingRequests: [], updates: [], tasks: [],
        createdAt: Date.now() - 86400000,
      },
      {
        id: 'p_demo3', title: 'Open Source CLI Tools',
        description: 'A collection of developer productivity tools as CLI commands — git helpers, code scaffolding, deployment shortcuts and more.',
        category: 'DevTools', requiredSkills: ['Python', 'Bash', 'Node.js', 'Go'],
        teamSize: 3, isOpen: true, creatorId: demoUserId,
        members: [demoUserId], pendingRequests: [], updates: [], tasks: [],
        createdAt: Date.now() - 50000000,
      },
    ];
    this.saveProjects(projects);
  },
};