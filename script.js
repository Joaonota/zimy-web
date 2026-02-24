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

// --- DATA INITIALIZATION ---
function initData() {
    if (db.load('patients').length === 0) {
        const initialPatients = [
            { id: 1, name: "Ana Silva", specialty: "Ansiedade", lastMsg: "Olá, me sinto melhor hoje.", status: "online", emoji: "😊" },
            { id: 2, name: "Bruno Souza", specialty: "Depressão", lastMsg: "A semana foi difícil...", status: "offline", emoji: "😔" },
            { id: 3, name: "Carla Lins", specialty: "Burnout", lastMsg: "Consegui terminar as missões!", status: "online", emoji: "🔥" }
        ];
        db.save('patients', initialPatients);
    }

    if (db.load('chats').length === 0) {
        const initialChats = {
            1: [
                { sender: 'patient', text: 'Bom dia doutor, as missões no app me ajudaram muito!', time: '09:00' },
                { sender: 'therapist', text: 'Que ótimo saber, Ana! O que você sentiu de principal mudança?', time: '09:15' },
                { sender: 'patient', text: 'Me sinto mais consciente dos meus gatilhos de ansiedade.', time: '09:20' }
            ],
            2: [
                { sender: 'patient', text: 'Não consegui dormir bem nessas últimas noites.', time: 'Yesterday' }
            ],
            3: [
                { sender: 'therapist', text: 'Parabéns pelas conquistas, Carla!', time: 'Today' }
            ]
        };
        db.save('chats', initialChats);
    }

    if (db.load('therapists').length === 0) {
        const defaultTherapist = [
            {
                name: "Dr. Lucas Alencar",
                email: "terapeuta@zimy.com.br",
                password: "123",
                specialty: "Psicologia Cognitiva",
                regNumber: "CRP 06/154321"
            }
        ];
        db.save('therapists', defaultTherapist);
    }
}

// --- AUTH GUARDS ---
function checkAuth() {
    const session = db.getSession();
    const isAuthPage = window.location.pathname.includes('login') || window.location.pathname.includes('signup') || window.location.pathname.includes('index') || window.location.pathname === '/';

    if (!session && !isAuthPage) {
        window.location.href = 'login.html';
    }
}

// --- INITIALIZE ---
document.addEventListener('DOMContentLoaded', () => {
    initData();
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
