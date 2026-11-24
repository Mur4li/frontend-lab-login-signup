# Frontend Development Frameworks Lab: Login & Signup Web Application

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![LocalStorage](https://img.shields.io/badge/Storage-LocalStorage-blueviolet?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

---

## 🎯 Experiment Overview
- **Course / Subject:** Frontend Development Frameworks Lab
- **Experiment Title:** Implementation of Client-Side Authentication, Form Validation, and Session Management with Local Storage
- **Student / Developer:** Mur4li
- **Status:** Complete &amp; Tested

This project delivers a responsive **Login and Signup Web Application** developed strictly using pure web technologies (HTML5, CSS3, JavaScript ES6+, and the Web Storage API). It features client-side validation, password security meters, session route guarding, real-time toast feedback, and persistent user registration stored locally in the browser.

---

## ✨ Features Implemented

### 1. User Registration (`signup.html`)
- **Full Name:** Text field with minimum character validation.
- **Email ID:** Email pattern regex validation (`name@domain.ext`) and duplicate detection against existing registered accounts.
- **Password:** Minimum 6-character length validation with a dynamic visual 4-tier security strength meter (Weak, Medium, Good, Strong).
- **Confirm Password:** Real-time matching check against the main password field.
- **Empty Field Prevention:** Interactive highlighting and error toasts if any mandatory fields are missing.
- **Password Visibility Toggle:** Show / hide password buttons for both password fields.
- **Persistence:** New users are automatically saved into `localStorage` under `lab_auth_users`.
- **Auto-Redirect:** Upon successful registration, the user is redirected to `login.html` with their email pre-filled.

### 2. User Authentication (`login.html`)
- **Email & Password Authentication:** Checks credentials against all users stored in `localStorage`.
- **Remember Me Checkbox:** If checked, retains the user's email across browser sessions via `localStorage`.
- **Password Visibility Toggle:** Eye icon to toggle between masked and plain text.
- **Forgot Password Modal:** Interactive modal allowing registered users to reset their demo password without external servers.
- **One-Click Demo Helper:** Pre-seeds and auto-fills a demo student account (`student@lab.edu` / `Password123!`) for quick lab viva evaluation.
- **Feedback & Toasts:** Toast notifications for incorrect credentials, empty fields, and successful logins.
- **Navigation Links:** Seamless navigation to `signup.html`.

### 3. Student Dashboard & Protected Route (`dashboard.html`)
- **Route Guard / Auth Protection:** Unauthenticated users attempting to access `dashboard.html` directly are immediately redirected to `login.html?reason=unauthorized`.
- **Personalized Header & Welcome Banner:** Displays student initials avatar, full name, email, user ID, and registration date.
- **Live Active Session Timer:** Dynamic ticking clock showing the active session duration in minutes and seconds.
- **Real-Time Audit Activity Log:** Logs account creation, user logins, password resets, and session terminations.
- **Storage Inspector (Lab Viva Demo):** Built-in modal that renders formatted JSON of the actual `localStorage` data for examination grading.
- **Safe Logout:** Clears current active session data and redirects safely to the login screen.

---

## 📁 Project Structure

```text
frontend-lab-login-signup/
├── index.html            # Main entry point with automated route redirector
├── login.html            # Login page with demo helper & forgot-password modal
├── signup.html           # Registration page with live validation & strength meter
├── dashboard.html        # Protected student dashboard with live session timer
├── css/
│   └── style.css         # Modern glassmorphism & responsive gradient styling
├── js/
│   ├── auth.js           # Core authentication, storage, validation & toast logic
│   └── dashboard.js      # Dashboard controller, route guard & session timer
├── assets/               # Static assets & icons
├── .gitignore            # Git ignore file
└── README.md             # Project documentation and lab experiment report
```

---

## 💾 Local Storage Schema

The application uses standard browser `localStorage` and `sessionStorage` keys:

| Key | Storage Type | Description | Sample Structure |
|---|---|---|---|
| `lab_auth_users` | `localStorage` | Array of all registered user objects | `[ { id, name, email, password, registeredAt } ]` |
| `lab_current_session` | `sessionStorage` / `localStorage` | Current active user session | `{ id, name, email, loginTime }` |
| `lab_remembered_email` | `localStorage` | Stored email when "Remember Me" is enabled | `"student@lab.edu"` |
| `lab_user_activities` | `localStorage` | Audit history of user actions | `[ { id, userId, action, timestamp } ]` |

---

## 🚀 How to Run the Project Locally

No build tools or server dependencies (such as Node.js or Python) are strictly required, but you can run it using any method below:

### Method 1: Direct File Launch (Simplest)
1. Navigate to the project directory:
   ```bash
   cd C:\Users\mural\.gemini\antigravity\scratch\frontend-lab-login-signup
   ```
2. Double-click `index.html` or `login.html` to open it in Google Chrome, Microsoft Edge, Firefox, or Safari.

### Method 2: Local HTTP Server (Recommended)
You can use any lightweight local web server:

- **Using Python 3:**
  ```bash
  python -m http.server 3000
  ```
  Then open [http://localhost:3000](http://localhost:3000) in your browser.

- **Using Node.js (`npx serve` or `live-server`):**
  ```bash
  npx serve .
  ```

---

## 🧪 Pre-configured Demo Credentials

For quick evaluation during college lab viva:
- **Email:** `student@lab.edu`
- **Password:** `Password123!`

*(You can also click the **"Auto Fill"** button directly on the login card to instantly populate these credentials).*

---

## 📱 Responsive UI & Design Details
- **Glassmorphism Theme:** Backdrop filters with dark slate background (`#0f172a`) and multi-layer radial gradient mesh.
- **Cross-Platform Fonts:** Inter typography via Google Fonts with system fallback stack.
- **Vector Icons:** Font Awesome 6.5.1 for crisp rendering across all DPR screens.
- **Mobile First & Flexible:** Fully tested and responsive across mobile (320px+), tablet (768px+), and desktop (1024px+).
