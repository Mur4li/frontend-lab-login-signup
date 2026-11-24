/**
 * Frontend Development Frameworks Lab - Dashboard Controller
 * Enforces Auth Guard, displays user profile, session timer, stats,
 * and handles Logout.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Auth Guard: Prevent unauthorized access to Dashboard
  const session = window.LabAuth.requireAuth();
  if (!session) return; // Immediate redirect initiated by requireAuth()

  // 2. Fetch full user object from localStorage
  const users = window.LabAuth.getAllUsers();
  const currentUser = users.find(u => u.id === session.id) || {
    id: session.id,
    name: session.name,
    email: session.email,
    registeredAt: session.loginTime
  };

  // 3. Populate User Data on UI
  renderUserInfo(currentUser, users);

  // 4. Start Live Active Session Timer
  initSessionTimer(session.loginTime);

  // 5. Populate Activity Log
  renderActivities(currentUser.id);

  // 6. Setup Logout Handlers
  setupLogoutHandlers();

  // 7. Setup Interactive Data Inspector Modal for Lab Viva Demo
  setupInspectorModal();
});

function renderUserInfo(user, allUsers) {
  // Elements
  const headerName = document.getElementById('user-header-name');
  const avatarSmall = document.getElementById('user-avatar-sm');
  const avatarBig = document.getElementById('user-avatar-lg');
  const welcomeName = document.getElementById('welcome-user-name');
  const detailName = document.getElementById('detail-user-name');
  const detailEmail = document.getElementById('detail-user-email');
  const detailId = document.getElementById('detail-user-id');
  const detailJoined = document.getElementById('detail-user-joined');
  const statUsersCount = document.getElementById('stat-total-users');
  const statLastLogin = document.getElementById('stat-last-login');

  const initials = getInitials(user.name);

  if (headerName) headerName.textContent = user.name;
  if (avatarSmall) avatarSmall.textContent = initials;
  if (avatarBig) avatarBig.textContent = initials;
  if (welcomeName) welcomeName.textContent = user.name;
  if (detailName) detailName.textContent = user.name;
  if (detailEmail) detailEmail.textContent = user.email;
  if (detailId) detailId.textContent = user.id;

  const joinDate = user.registeredAt ? new Date(user.registeredAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }) : 'Today';
  if (detailJoined) detailJoined.textContent = joinDate;

  if (statUsersCount) statUsersCount.textContent = allUsers.length;
  if (statLastLogin) {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    statLastLogin.textContent = timeStr;
  }
}

function getInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function initSessionTimer(loginTimeISO) {
  const timerEl = document.getElementById('stat-session-timer');
  if (!timerEl) return;

  const startTime = loginTimeISO ? new Date(loginTimeISO).getTime() : Date.now();

  function updateTimer() {
    const now = Date.now();
    const elapsedSeconds = Math.max(0, Math.floor((now - startTime) / 1000));
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    timerEl.textContent = `${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

function renderActivities(userId) {
  const listEl = document.getElementById('activity-list');
  if (!listEl) return;

  const activities = window.LabAuth.getUserActivities(userId);
  if (!activities || activities.length === 0) {
    listEl.innerHTML = `
      <div class="activity-item">
        <div class="activity-icon-badge"><i class="fa-solid fa-info"></i></div>
        <div>
          <div class="activity-desc">No recent activity recorded yet.</div>
          <div class="activity-time">Fresh session</div>
        </div>
      </div>
    `;
    return;
  }

  listEl.innerHTML = activities.slice(0, 6).map(act => {
    const time = new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = new Date(act.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
    return `
      <div class="activity-item">
        <div class="activity-icon-badge"><i class="fa-solid fa-clock-rotate-left"></i></div>
        <div>
          <div class="activity-desc">${escapeHtml(act.action)}</div>
          <div class="activity-time">${date} at ${time}</div>
        </div>
      </div>
    `;
  }).join('');
}

function setupLogoutHandlers() {
  const logoutButtons = document.querySelectorAll('.action-logout');
  logoutButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Are you sure you want to log out from this session?')) {
        window.LabAuth.clearSession();
        window.LabAuth.showToast('Logged Out', 'Session ended safely. Redirecting...', 'info');
        setTimeout(() => {
          window.location.replace('login.html?reason=logged_out');
        }, 500);
      }
    });
  });
}

function setupInspectorModal() {
  const inspectBtn = document.getElementById('btn-inspect-storage');
  const modal = document.getElementById('inspector-modal');
  const closeBtn = document.getElementById('inspector-close-btn');
  const jsonView = document.getElementById('storage-json-view');
  const clearAllBtn = document.getElementById('btn-clear-all-demo');

  if (!inspectBtn || !modal) return;

  const refreshJson = () => {
    const data = {
      currentUserSession: window.LabAuth.getCurrentSession(),
      allRegisteredUsers: window.LabAuth.getAllUsers(),
      rememberedEmail: window.LabAuth.getRememberedEmail(),
      activityLog: JSON.parse(localStorage.getItem('lab_user_activities') || '[]')
    };
    if (jsonView) {
      jsonView.textContent = JSON.stringify(data, null, 2);
    }
  };

  inspectBtn.addEventListener('click', () => {
    refreshJson();
    modal.classList.add('active');
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      if (confirm('Reset LocalStorage to default factory demo user?')) {
        localStorage.clear();
        sessionStorage.clear();
        window.LabAuth.initStorage();
        window.location.replace('login.html');
      }
    });
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
