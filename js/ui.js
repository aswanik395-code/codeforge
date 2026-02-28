/* ============================================================
   js/ui.js — Reusable UI helpers: toast, modal, chips, etc.
   ============================================================ */

const UI = {

  // ── Toast Notifications ────────────────────────────────────
  toast(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const icons = { success: '✓', error: '✕', info: '◈' };
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span>${icons[type] || '◈'}</span><span>${message}</span>`;
    container.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(30px)'; el.style.transition = '0.3s'; setTimeout(() => el.remove(), 320); }, duration);
  },

  // ── Modal ──────────────────────────────────────────────────
  openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('open');
    document.body.style.overflow = 'hidden';
  },
  closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('open');
    document.body.style.overflow = '';
  },
  closeAllModals() {
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
    document.body.style.overflow = '';
  },

  // ── Chip Selector ──────────────────────────────────────────
  // Renders interactive multi-select chips inside a container
  renderChipSelector(containerId, options, selectedArr, onChange) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = '';
    options.forEach(opt => {
      const chip = document.createElement('span');
      chip.className = 'chip chip-selector' + (selectedArr.includes(opt) ? ' selected' : '');
      chip.textContent = opt;
      chip.addEventListener('click', () => {
        const idx = selectedArr.indexOf(opt);
        if (idx === -1) selectedArr.push(opt);
        else selectedArr.splice(idx, 1);
        chip.classList.toggle('selected', selectedArr.includes(opt));
        if (onChange) onChange(selectedArr);
      });
      el.appendChild(chip);
    });
  },

  // ── Render skill chips (display only) ─────────────────────
  chipHtml(skill, type = '') {
    return `<span class="chip ${type}">${skill}</span>`;
  },

  // ── Compatibility Badge ────────────────────────────────────
  compatHtml(score) {
    let cls = score >= 70 ? 'chip-green' : score >= 40 ? 'chip' : 'chip-red';
    return `<span class="chip ${cls}">${score}% match</span>`;
  },

  // ── Avatar HTML ────────────────────────────────────────────
  avatarHtml(user, size = 'md') {
    const initials = (user.name || '?').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
    const colors = ['#C9A84C','#8793EE','#4ECDC4','#E85D5D','#A78BFA'];
    const color = colors[user.id?.charCodeAt(2) % colors.length] || colors[0];
    if (user.avatar) {
      return `<img src="${user.avatar}" class="avatar avatar-${size}" style="object-fit:cover;" alt="${user.name}">`;
    }
    return `<div class="avatar avatar-${size}" style="background:${color};color:#0E0C0D;">${initials}</div>`;
  },

  // ── Time Ago ───────────────────────────────────────────────
  timeAgo(ts) {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return Math.floor(diff/60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff/3600000) + 'h ago';
    return Math.floor(diff/86400000) + 'd ago';
  },

  // ── Page Navigation ────────────────────────────────────────
  navigate(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page-' + pageId);
    if (target) { target.classList.add('active'); window.scrollTo(0,0); }
    document.querySelectorAll('.nav-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.page === pageId);
    });
    // Trigger render hook
    if (window.Pages && window.Pages[pageId]) window.Pages[pageId]();
  },

  // ── Empty State ────────────────────────────────────────────
  emptyState(msg, icon = '⬡') {
    return `<div style="text-align:center;padding:60px 20px;color:var(--text-muted);">
      <div style="font-size:2.5rem;margin-bottom:12px;opacity:0.4;">${icon}</div>
      <div style="font-size:14px;">${msg}</div>
    </div>`;
  },

  // ── Update notification badge ─────────────────────────────
  updateNotifBadge() {
    const user = DB.getCurrentUser();
    const badge = document.getElementById('notifBadge');
    if (!badge || !user) return;
    const unread = DB.getNotifsByUser(user.id).filter(n => !n.read).length;
    badge.classList.toggle('show', unread > 0);
  },
};

// ── Close modals on overlay click ─────────────────────────────
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) UI.closeAllModals();
});