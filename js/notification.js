/* ============================================================
   js/notifications.js — Notification panel rendering
   ============================================================ */

const Notifications = {

  isOpen: false,

  toggle() {
    const panel = document.getElementById('notifPanel');
    this.isOpen = !this.isOpen;
    panel.classList.toggle('open', this.isOpen);
    if (this.isOpen) {
      this.render();
      // close on outside click
      setTimeout(() => document.addEventListener('click', Notifications.outsideClick), 50);
    } else {
      document.removeEventListener('click', Notifications.outsideClick);
    }
  },

  outsideClick(e) {
    const panel = document.getElementById('notifPanel');
    const btn   = document.getElementById('notifBtn');
    if (!panel.contains(e.target) && !btn.contains(e.target)) {
      Notifications.close();
    }
  },

  close() {
    document.getElementById('notifPanel').classList.remove('open');
    this.isOpen = false;
    document.removeEventListener('click', Notifications.outsideClick);
  },

  render() {
    const user = DB.getCurrentUser();
    if (!user) return;
    const notifs = DB.getNotifsByUser(user.id);
    const list = document.getElementById('notifList');
    if (!list) return;

    if (!notifs.length) {
      list.innerHTML = `<div class="notif-empty">✦ All caught up!</div>`;
      return;
    }

    list.innerHTML = notifs.map(n => `
      <div class="notif-item ${n.read ? '' : 'unread'}" onclick="Notifications.markRead('${n.id}')">
        <div>${n.message}</div>
        <div class="notif-time">${UI.timeAgo(n.createdAt)}</div>
      </div>
    `).join('');
  },

  markRead(id) {
    DB.markNotifRead(id);
    UI.updateNotifBadge();
    this.render();
  },

  markAllRead() {
    const user = DB.getCurrentUser();
    DB.markAllRead(user.id);
    UI.updateNotifBadge();
    this.render();
  },
};