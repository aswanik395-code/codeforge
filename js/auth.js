/* ============================================================
   js/auth.js — Login, Registration, and session management
   ============================================================ */

const Auth = {

  // All available skills for selector
  SKILLS: [
    'HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Svelte',
    'Node.js', 'Express', 'Python', 'Django', 'Flask', 'FastAPI',
    'Java', 'Spring', 'PHP', 'Laravel', 'Go', 'Rust', 'C++', 'C#',
    'React Native', 'Flutter', 'Swift', 'Kotlin',
    'MySQL', 'PostgreSQL', 'MongoDB', 'Firebase', 'Redis',
    'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas',
    'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Linux', 'Bash', 'Git',
    'Figma', 'UX/UI', 'Graphic Design', 'UI Design',
  ],

  DEPARTMENTS: [
    'Computer Science', 'Software Engineering', 'Information Technology',
    'Electrical Engineering', 'Mechanical Engineering', 'Data Science',
    'Mathematics', 'Physics', 'Design', 'Business', 'Other',
  ],

  YEARS: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Masters', 'PhD', 'Alumni'],

  selectedSkills: [],

  // ── Initialise auth pages ──────────────────────────────────
  init() {
    this.selectedSkills = [];
    this.renderLoginForm();
    this.renderRegisterForm();
  },

  renderLoginForm() {
    const el = document.getElementById('loginForm');
    if (!el) return;
    el.innerHTML = `
      <div class="form-group">
        <label>Email</label>
        <input class="form-control" type="email" id="loginEmail" placeholder="you@university.edu" autocomplete="email">
      </div>
      <div class="form-group">
        <label>Password</label>
        <input class="form-control" type="password" id="loginPassword" placeholder="••••••••" autocomplete="current-password">
      </div>
      <button class="btn btn-primary btn-full" onclick="Auth.login()">Sign In</button>
      <div class="divider-text mt-16">or</div>
      <button class="btn btn-ghost btn-full" onclick="Auth.demoLogin()">▷ Try Demo Account</button>
      <p class="text-sm text-muted mt-16" style="text-align:center;">
        No account? <a href="#" onclick="Auth.showRegister()">Create one →</a>
      </p>
    `;
  },

  renderRegisterForm() {
    const el = document.getElementById('registerForm');
    if (!el) return;
    this.selectedSkills = [];
    el.innerHTML = `
      <div class="grid-2">
        <div class="form-group">
          <label>Full Name *</label>
          <input class="form-control" type="text" id="regName" placeholder="Alex Reyes">
        </div>
        <div class="form-group">
          <label>Email *</label>
          <input class="form-control" type="email" id="regEmail" placeholder="you@uni.edu">
        </div>
      </div>
      <div class="grid-2">
        <div class="form-group">
          <label>Password *</label>
          <input class="form-control" type="password" id="regPassword" placeholder="••••••••">
        </div>
        <div class="form-group">
          <label>Department</label>
          <select class="form-control" id="regDept">
            <option value="">Select...</option>
            ${Auth.DEPARTMENTS.map(d => `<option value="${d}">${d}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="grid-2">
        <div class="form-group">
          <label>Year</label>
          <select class="form-control" id="regYear">
            <option value="">Select...</option>
            ${Auth.YEARS.map(y => `<option value="${y}">${y}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Profile Picture URL <span class="text-muted">(optional)</span></label>
          <input class="form-control" type="url" id="regAvatar" placeholder="https://...">
        </div>
      </div>
      <div class="form-group">
        <label>Short Bio</label>
        <textarea class="form-control" id="regBio" placeholder="Tell the community about yourself, your interests, what kind of projects you're looking for..." rows="2"></textarea>
      </div>
      <div class="form-group">
        <label>Your Skills <span class="text-muted">(select all that apply)</span></label>
        <div id="skillChips" class="flex flex-wrap gap-8 mt-8"></div>
      </div>
      <button class="btn btn-primary btn-full mt-8" onclick="Auth.register()">Create Account →</button>
      <p class="text-sm text-muted mt-16" style="text-align:center;">
        Already have an account? <a href="#" onclick="Auth.showLogin()">Sign in →</a>
      </p>
    `;
    UI.renderChipSelector('skillChips', Auth.SKILLS, this.selectedSkills, () => {});
  },

  showRegister() {
    document.getElementById('authLoginPanel').classList.add('hidden');
    document.getElementById('authRegisterPanel').classList.remove('hidden');
    this.renderRegisterForm();
  },
  showLogin() {
    document.getElementById('authRegisterPanel').classList.add('hidden');
    document.getElementById('authLoginPanel').classList.remove('hidden');
  },

  login() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    if (!email || !password) { UI.toast('Please fill in all fields.', 'error'); return; }
    const result = DB.loginUser(email, password);
    if (!result.ok) { UI.toast(result.msg, 'error'); return; }
    App.onLogin(result.user);
  },

  demoLogin() {
    const result = DB.loginUser('demo@codeforge.dev', 'demo123');
    if (!result.ok) { UI.toast('Demo account not found. Seeding...', 'info'); DB.seedIfEmpty(); this.demoLogin(); return; }
    App.onLogin(result.user);
  },

  register() {
    const name     = document.getElementById('regName').value.trim();
    const email    = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const dept     = document.getElementById('regDept').value;
    const year     = document.getElementById('regYear').value;
    const bio      = document.getElementById('regBio').value.trim();
    const avatar   = document.getElementById('regAvatar').value.trim();

    if (!name || !email || !password) { UI.toast('Name, email and password are required.', 'error'); return; }
    if (password.length < 6) { UI.toast('Password must be at least 6 characters.', 'error'); return; }
    if (this.selectedSkills.length === 0) { UI.toast('Please select at least one skill.', 'error'); return; }

    const result = DB.registerUser({ name, email, password, department: dept, year, bio, skills: this.selectedSkills, avatar });
    if (!result.ok) { UI.toast(result.msg, 'error'); return; }
    UI.toast('Account created! Welcome to CodeForge 🎉', 'success');
    App.onLogin(result.user);
  },

  logout() {
    DB.clearCurrentUser();
    App.showAuth();
    UI.toast('Signed out.', 'info');
  },
};