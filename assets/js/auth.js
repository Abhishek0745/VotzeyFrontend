// ✅ AUTH.JS COMPLETE

window.API = 'https://votezy-backend-ik9s.onrender.com';

// Save token and user info after login
function saveAuth(data) {
  localStorage.setItem('votezy_token', data.token);

  localStorage.setItem(
    'votezy_user',
    JSON.stringify({
      name: data.name,
      email: data.email,
      role: data.role
    })
  );
}

// Get stored JWT token
function getToken() {
  return localStorage.getItem('votezy_token');
}

// Get logged-in user info
function getUser() {
  const u = localStorage.getItem('votezy_user');
  return u ? JSON.parse(u) : null;
}

// Check if user is logged in
function isLoggedIn() {
  return !!getToken();
}

// Logout
function logout() {
  localStorage.removeItem('votezy_token');
  localStorage.removeItem('votezy_user');

  window.location.href = 'login.html';
}

// JWT Headers
function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + getToken()
  };
}

// Navbar
function updateNavbar() {

  const user = getUser();

  const navExtra =
    document.getElementById('navUserArea');

  const adminNav =
    document.getElementById('adminNav');

  if (!navExtra) return;

  if (user) {

    // ADMIN DASHBOARD BUTTON
    if (adminNav && user.role === 'ADMIN') {

      adminNav.innerHTML = `
        <a href="admin.html" class="nav-link">
          Admin Dashboard
        </a>
      `;

    }

    navExtra.innerHTML = `
      <div class="d-flex align-items-center gap-3">

        <span
          style="
          font-size:0.82rem;
          color:var(--text-secondary);
        ">

          <i class="bi bi-person-circle"></i>

          ${user.name}

          <span class="badge-admin ms-1">
            ${user.role}
          </span>

        </span>

        <button
          onclick="logout()"
          class="btn-danger-sm">

          Logout

        </button>

      </div>
    `;

  } else {

    if (adminNav) {
      adminNav.innerHTML = '';
    }

    navExtra.innerHTML = `
      <a
        href="login.html"
        class="btn-primary-custom"
        style="
          width:auto;
          padding:0.4rem 1rem;
        ">

        Login

      </a>
    `;
  }
}

// Protect pages
function requireLogin() {

  if (!isLoggedIn()) {

    window.location.href =
      'login.html';

  }

}

// Toast
function showToast(
  message,
  type = 'success'
) {

  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: type,
    title: message,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: '#111827',
    color: '#f1f5f9'
  });

}

document.addEventListener(
  'DOMContentLoaded',
  updateNavbar
);