/**
 * Zimy Core Logic
 * Responsável por Auth, LocalStorage e Simulação de Dados
 */

// --- UTILS ---
const db = {
    save: (key, data) => localStorage.setItem(`zimy_${key}`, JSON.stringify(data)),
    load: (key) => JSON.parse(localStorage.getItem(`zimy_${key}`)) || [],
    getSession: () => JSON.parse(localStorage.getItem('zimy_session')),
    setSession: (user) => localStorage.setItem('zimy_session', JSON.stringify(user)),
    clearSession: () => localStorage.removeItem('zimy_session')
};

// One-time cleanup of legacy fake data (runs once per browser)
if (!localStorage.getItem('zimy_cleaned_v2')) {
    ['zimy_therapists', 'zimy_patients', 'zimy_chats', 'zimy_session_fake', 'therapists', 'zimy_session'].forEach(key => localStorage.removeItem(key));
    localStorage.setItem('zimy_cleaned_v2', 'true');
}

// --- AUTH GUARDS ---
function checkAuth() {
    const session = db.getSession();
    const path = window.location.pathname;
    const isAuthPage = path.includes('login') || path.includes('signup') || path.endsWith('index.html') || path === '/' || path === '';

    if (!session && !isAuthPage) {
        window.location.href = 'login.html';
    }
}

// --- INITIALIZE ---
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();

    // Logout Functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            db.clearSession();
            window.location.href = 'login.html';
        });
    }

    // Mobile Sidebar Toggle
    const toggleBtn = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }
});

// --- EXPORT FOR SPECIFIC PAGES ---
window.Zimy = { db };
