/**
 * Frontend Development Frameworks Lab - Authentication Module
 * Handles User Registration, Authentication, LocalStorage persistence,
 * Session validation, Toast notifications, and Form validations.
 */

// Storage Keys
const STORAGE_KEYS = {
  USERS: 'lab_auth_users',
  SESSION: 'lab_current_session',
  REMEMBER: 'lab_remembered_email',
  ACTIVITIES: 'lab_user_activities'
};

// Initial Demo User for College Lab Evaluation
const DEFAULT_DEMO_USER = {
  id: 'usr_demo_101',
  name: 'Alex Morgan',
  email: 'student@lab.edu',
  password: 'Password123!',
  registeredAt: new Date(Date.now() - 86400000 * 2).toISOString() // 2 days ago
};

// -----------------------------------------------------------------------------
// Storage & Session Management
// -----------------------------------------------------------------------------

function initStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const initialUsers = [DEFAULT_DEMO_USER];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialUsers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ACTIVITIES)) {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify([]));
  }
}

function getAllUsers() {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
  } catch (e) {
    console.error('Error parsing users from localStorage:', e);
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

function getCurrentSession() {
  try {
    const sessionData = sessionStorage.getItem(STORAGE_KEYS.SESSION) || localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!sessionData) return null;
    return JSON.parse(sessionData);
  } catch (e) {
    return null;
  }
}

function setCurrentSession(user, remember = false) {
  const sessionObj = {
    id: user.id,
    name: user.name,
    email: user.email,
    loginTime: new Date().toISOString()
  };

  // If user checked Remember Me, persist across browser restarts in localStorage;
  // otherwise, store in sessionStorage.
  if (remember) {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionObj));
    localStorage.setItem(STORAGE_KEYS.REMEMBER, user.email);
  } else {
    sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionObj));
    localStorage.removeItem(STORAGE_KEYS.REMEMBER);
  }

  // Also log activity
  logUserActivity(user.id, `User logged in from web client`);
}

function clearSession() {
  const session = getCurrentSession();
  if (session) {
    logUserActivity(session.id, `User logged out`);
  }
  localStorage.removeItem(STORAGE_KEYS.SESSION);
  sessionStorage.removeItem(STORAGE_KEYS.SESSION);
}

function getRememberedEmail() {
  return localStorage.getItem(STORAGE_KEYS.REMEMBER) || '';
}

function logUserActivity(userId, action) {
  try {
    const activities = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITIES)) || [];
    activities.unshift({
      id: 'act_' + Date.now(),
      userId: userId,
      action: action,
      timestamp: new Date().toISOString()
    });
    // keep last 50
    if (activities.length > 50) activities.length = 50;
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  } catch (e) {
    console.warn('Failed to record activity log', e);
  }
}

function getUserActivities(userId) {
  try {
    const activities = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITIES)) || [];
    return activities.filter(a => a.userId === userId);
  } catch (e) {
    return [];
  }
}

// -----------------------------------------------------------------------------
// Toast Notification System
// -----------------------------------------------------------------------------

function showToast(title, message, type = 'info', duration = 4000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    success: 'fa-solid fa-circle-check',
    danger: 'fa-solid fa-circle-exclamation',
    warning: 'fa-solid fa-triangle-exclamation',
    info: 'fa-solid fa-circle-info'
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="${icons[type] || icons.info} toast-icon"></i>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" aria-label="Close">&times;</button>
  `;

  container.appendChild(toast);

  const removeToast = () => {
    toast.classList.add('toast-exit');
    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 300);
  };

  toast.querySelector('.toast-close').addEventListener('click', removeToast);

  if (duration > 0) {
    setTimeout(removeToast, duration);
  }
}

// -----------------------------------------------------------------------------
// Validation Utilities
// -----------------------------------------------------------------------------

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

function isValidEmail(email) {
  return EMAIL_REGEX.test(email.trim());
}

function checkPasswordStrength(password) {
  let score = 0;
  if (!password) return { score: 0, label: 'None', color: 'transparent' };

  if (password.length >= 6) score += 1;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { score: 1, label: 'Weak', color: '#ef4444' };
  if (score <= 3) return { score: 2, label: 'Medium', color: '#f59e0b' };
  if (score === 4) return { score: 3, label: 'Good', color: '#3b82f6' };
  return { score: 4, label: 'Strong', color: '#10b981' };
}

// -----------------------------------------------------------------------------
// UI Utilities & Event Wireups
// -----------------------------------------------------------------------------

function setupPasswordToggles() {
  const toggleButtons = document.querySelectorAll('.toggle-password');
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;

      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';

      const icon = btn.querySelector('i');
      if (icon) {
        icon.className = isPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
      }
    });
  });
}

function setFieldError(inputEl, feedbackEl, message) {
  if (inputEl) {
    inputEl.classList.add('is-invalid');
    inputEl.classList.remove('is-valid');
  }
  if (feedbackEl) {
    feedbackEl.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${message}`;
    feedbackEl.classList.add('visible');
  }
}

function clearFieldError(inputEl, feedbackEl) {
  if (inputEl) {
    inputEl.classList.remove('is-invalid');
    inputEl.classList.add('is-valid');
  }
  if (feedbackEl) {
    feedbackEl.textContent = '';
    feedbackEl.classList.remove('visible');
  }
}

function resetFieldState(inputEl, feedbackEl) {
  if (inputEl) {
    inputEl.classList.remove('is-invalid', 'is-valid');
  }
  if (feedbackEl) {
    feedbackEl.textContent = '';
    feedbackEl.classList.remove('visible');
  }
}

// -----------------------------------------------------------------------------
// Page Specific Initializers
// -----------------------------------------------------------------------------

/**
 * Signup Page Controller
 */
function initSignupPage() {
  initStorage();
  setupPasswordToggles();

  const form = document.getElementById('signup-form');
  if (!form) return;

  const nameInput = document.getElementById('signup-name');
  const emailInput = document.getElementById('signup-email');
  const passwordInput = document.getElementById('signup-password');
  const confirmPasswordInput = document.getElementById('signup-confirm-password');

  const nameFeedback = document.getElementById('name-feedback');
  const emailFeedback = document.getElementById('email-feedback');
  const passwordFeedback = document.getElementById('password-feedback');
  const confirmFeedback = document.getElementById('confirm-feedback');

  const strengthBars = document.querySelectorAll('.strength-bar');
  const strengthText = document.getElementById('strength-level-text');

  // Real-time password strength meter
  passwordInput.addEventListener('input', () => {
    const val = passwordInput.value;
    const strength = checkPasswordStrength(val);

    strengthBars.forEach((bar, idx) => {
      if (idx < strength.score) {
        bar.style.backgroundColor = strength.color;
      } else {
        bar.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
      }
    });

    if (strengthText) {
      strengthText.textContent = val ? strength.label : 'None';
      strengthText.style.color = strength.color;
    }

    if (val.length >= 6) {
      clearFieldError(passwordInput, passwordFeedback);
    }

    // Also check confirm password match if filled
    if (confirmPasswordInput.value) {
      if (confirmPasswordInput.value !== val) {
        setFieldError(confirmPasswordInput, confirmFeedback, 'Passwords do not match');
      } else {
        clearFieldError(confirmPasswordInput, confirmFeedback);
      }
    }
  });

  // Real-time confirm password match check
  confirmPasswordInput.addEventListener('input', () => {
    if (confirmPasswordInput.value !== passwordInput.value) {
      setFieldError(confirmPasswordInput, confirmFeedback, 'Passwords do not match');
    } else {
      clearFieldError(confirmPasswordInput, confirmFeedback);
    }
  });

  // Real-time email validation
  emailInput.addEventListener('input', () => {
    const emailVal = emailInput.value.trim();
    if (!emailVal) {
      resetFieldState(emailInput, emailFeedback);
    } else if (!isValidEmail(emailVal)) {
      setFieldError(emailInput, emailFeedback, 'Please enter a valid email address');
    } else {
      clearFieldError(emailInput, emailFeedback);
    }
  });

  // Real-time name validation
  nameInput.addEventListener('input', () => {
    if (nameInput.value.trim().length >= 2) {
      clearFieldError(nameInput, nameFeedback);
    }
  });

  // Form Submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    let hasError = false;

    // 1. Prevent signup if fields are empty
    if (!name) {
      setFieldError(nameInput, nameFeedback, 'Full Name is required');
      hasError = true;
    } else if (name.length < 2) {
      setFieldError(nameInput, nameFeedback, 'Name must be at least 2 characters');
      hasError = true;
    }

    if (!email) {
      setFieldError(emailInput, emailFeedback, 'Email address is required');
      hasError = true;
    } else if (!isValidEmail(email)) {
      setFieldError(emailInput, emailFeedback, 'Please enter a valid email format');
      hasError = true;
    }

    if (!password) {
      setFieldError(passwordInput, passwordFeedback, 'Password is required');
      hasError = true;
    } else if (password.length < 6) {
      setFieldError(passwordInput, passwordFeedback, 'Password must be at least 6 characters');
      hasError = true;
    }

    if (!confirmPassword) {
      setFieldError(confirmPasswordInput, confirmFeedback, 'Please confirm your password');
      hasError = true;
    } else if (password !== confirmPassword) {
      setFieldError(confirmPasswordInput, confirmFeedback, 'Passwords do not match');
      hasError = true;
    }

    if (hasError) {
      showToast('Validation Error', 'Please check the required fields highlighted in red.', 'danger');
      return;
    }

    // 2. Check for duplicate registered email
    const users = getAllUsers();
    const existing = users.find(u => u.email.toLowerCase() === email);
    if (existing) {
      setFieldError(emailInput, emailFeedback, 'This email is already registered. Try logging in.');
      showToast('Account Exists', 'An account with this email address already exists.', 'warning');
      return;
    }

    // 3. Create new user record
    const newUser = {
      id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      name: name,
      email: email,
      password: password,
      registeredAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    // Record activity
    logUserActivity(newUser.id, `User account created (${email})`);

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Creating Account...`;
    }

    showToast('Registration Successful!', 'Your account has been created. Redirecting to login...', 'success');

    // Auto redirect to Login page after 1.5 seconds
    setTimeout(() => {
      window.location.href = 'login.html?registered=' + encodeURIComponent(email);
    }, 1500);
  });
}

/**
 * Login Page Controller
 */
function initLoginPage() {
  initStorage();
  setupPasswordToggles();

  const form = document.getElementById('login-form');
  if (!form) return;

  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const rememberCheckbox = document.getElementById('remember-me');
  const emailFeedback = document.getElementById('login-email-feedback');
  const passwordFeedback = document.getElementById('login-password-feedback');

  // Check URL params for feedback (e.g. redirected after signup or unauthorized access)
  const urlParams = new URLSearchParams(window.location.search);
  const registeredEmail = urlParams.get('registered');
  const reason = urlParams.get('reason');

  if (registeredEmail) {
    emailInput.value = registeredEmail;
    showToast('Account Created!', 'You can now log in with your credentials.', 'success');
  } else {
    // Populate Remembered Email if saved
    const savedEmail = getRememberedEmail();
    if (savedEmail) {
      emailInput.value = savedEmail;
      if (rememberCheckbox) rememberCheckbox.checked = true;
    }
  }

  if (reason === 'unauthorized') {
    showToast('Access Denied', 'Please log in to access the Dashboard.', 'warning');
  } else if (reason === 'logged_out') {
    showToast('Logged Out', 'You have been safely logged out.', 'info');
  }

  // Real-time input cleanup
  emailInput.addEventListener('input', () => {
    if (emailInput.value.trim()) {
      clearFieldError(emailInput, emailFeedback);
    }
  });

  passwordInput.addEventListener('input', () => {
    if (passwordInput.value) {
      clearFieldError(passwordInput, passwordFeedback);
    }
  });

  // Login Submit Handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;
    const rememberMe = rememberCheckbox ? rememberCheckbox.checked : false;

    let hasError = false;

    if (!email) {
      setFieldError(emailInput, emailFeedback, 'Email is required');
      hasError = true;
    } else if (!isValidEmail(email)) {
      setFieldError(emailInput, emailFeedback, 'Enter a valid email address');
      hasError = true;
    }

    if (!password) {
      setFieldError(passwordInput, passwordFeedback, 'Password is required');
      hasError = true;
    }

    if (hasError) {
      showToast('Missing Fields', 'Please enter both email and password.', 'danger');
      return;
    }

    // Match credentials in Local Storage
    const users = getAllUsers();
    const matchedUser = users.find(u => u.email.toLowerCase() === email);

    if (!matchedUser) {
      setFieldError(emailInput, emailFeedback, 'No account found with this email.');
      showToast('Login Failed', 'Incorrect email or user not registered.', 'danger');
      return;
    }

    if (matchedUser.password !== password) {
      setFieldError(passwordInput, passwordFeedback, 'Incorrect password. Please try again.');
      showToast('Authentication Error', 'Invalid password. Check credentials.', 'danger');
      return;
    }

    // Successful Login!
    setCurrentSession(matchedUser, rememberMe);

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...`;
    }

    showToast('Login Successful!', `Welcome back, ${matchedUser.name}!`, 'success');

    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1200);
  });

  // Demo Credentials Fill Button
  const fillDemoBtn = document.getElementById('fill-demo-btn');
  if (fillDemoBtn) {
    fillDemoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      emailInput.value = DEFAULT_DEMO_USER.email;
      passwordInput.value = DEFAULT_DEMO_USER.password;
      clearFieldError(emailInput, emailFeedback);
      clearFieldError(passwordInput, passwordFeedback);
      showToast('Demo Credentials Loaded', 'Click "Log In" to proceed with demo account.', 'info');
    });
  }

  // Forgot Password Modal Handlers
  setupForgotPasswordModal();
}

/**
 * Forgot Password Interactive Modal
 */
function setupForgotPasswordModal() {
  const openLink = document.getElementById('forgot-password-link');
  const modal = document.getElementById('forgot-password-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const resetForm = document.getElementById('forgot-password-form');
  const resetEmailInput = document.getElementById('reset-email');
  const newPasswordInput = document.getElementById('reset-new-password');

  if (!openLink || !modal) return;

  const closeModal = () => modal.classList.remove('active');
  const openModal = () => {
    modal.classList.add('active');
    if (resetEmailInput) resetEmailInput.focus();
  };

  openLink.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  if (resetForm) {
    resetForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = resetEmailInput.value.trim().toLowerCase();
      const newPassword = newPasswordInput.value;

      if (!isValidEmail(email)) {
        showToast('Invalid Email', 'Please enter a valid email address.', 'danger');
        return;
      }
      if (!newPassword || newPassword.length < 6) {
        showToast('Password Short', 'New password must be at least 6 characters.', 'danger');
        return;
      }

      const users = getAllUsers();
      const userIndex = users.findIndex(u => u.email.toLowerCase() === email);

      if (userIndex === -1) {
        showToast('Not Found', 'No registered account found with that email address.', 'warning');
        return;
      }

      users[userIndex].password = newPassword;
      saveUsers(users);
      logUserActivity(users[userIndex].id, `User reset password`);

      closeModal();
      resetForm.reset();
      showToast('Password Updated', 'Your password has been reset! You can now log in.', 'success');

      const loginPass = document.getElementById('login-password');
      if (loginPass) loginPass.value = newPassword;
    });
  }
}

/**
 * Guard utility for protected routes (Dashboard)
 */
function requireAuth() {
  const session = getCurrentSession();
  if (!session) {
    window.location.replace('login.html?reason=unauthorized');
    return null;
  }
  return session;
}

// Export / Attach to window
window.LabAuth = {
  initStorage,
  getAllUsers,
  saveUsers,
  getCurrentSession,
  setCurrentSession,
  clearSession,
  getRememberedEmail,
  logUserActivity,
  getUserActivities,
  showToast,
  requireAuth,
  initSignupPage,
  initLoginPage,
  DEFAULT_DEMO_USER
};
