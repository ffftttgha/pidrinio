import { api } from './api.js';
import { openModal, closeModal, showToast } from './utils.js';

let currentUser = null;
let token = null;

export function getCurrentUser() { return currentUser; }
export function getToken() { return token; }

export function loadUserFromStorage() {
    token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('currentUser');
    if (token && savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
        } catch(e) {
            currentUser = null;
            token = null;
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');
        }
    }
    updateUIForUser();
}

function updateUIForUser() {
    const profileLink = document.getElementById('profileLink');
    if (!profileLink) return;
    if (currentUser) {
        const initials = currentUser.login.substring(0, 2).toUpperCase();
        profileLink.innerHTML = `<i class="fas fa-user-circle"></i> ${currentUser.login}`;
        profileLink.onclick = (e) => { e.preventDefault(); showProfile(); };
    } else {
        profileLink.innerHTML = `<i class="fas fa-user-circle"></i> Личный кабинет`;
        profileLink.onclick = (e) => { e.preventDefault(); openAuthModal(); };
    }
}

export function openAuthModal(defaultTab = 'login') {
    const container = document.getElementById('authContainer');
    container.innerHTML = `
        <h3 style="margin-bottom: 20px; text-align: center;">Добро пожаловать!</h3>
        <div class="auth-tabs">
            <div class="auth-tab ${defaultTab === 'login' ? 'active' : ''}" data-tab="login">Вход</div>
            <div class="auth-tab ${defaultTab === 'register' ? 'active' : ''}" data-tab="register">Регистрация</div>
        </div>
        <div id="loginForm" class="auth-form ${defaultTab === 'login' ? 'active' : ''}">
            <div class="input-group">
                <i class="fas fa-user"></i>
                <input type="text" id="loginUsername" placeholder="Логин" autocomplete="username">
            </div>
            <div class="input-group">
                <i class="fas fa-lock"></i>
                <input type="password" id="loginPassword" placeholder="Пароль" autocomplete="current-password">
            </div>
            <div id="loginError" class="auth-error"></div>
            <button id="loginBtn" class="auth-submit">Войти</button>
            <div class="auth-switch">Нет аккаунта? <a id="switchToRegister">Зарегистрироваться</a></div>
        </div>
        <div id="registerForm" class="auth-form ${defaultTab === 'register' ? 'active' : ''}">
            <div class="input-group">
                <i class="fas fa-user"></i>
                <input type="text" id="regLogin" placeholder="Придумайте логин" autocomplete="username">
            </div>
            <div class="input-group">
                <i class="fas fa-lock"></i>
                <input type="password" id="regPassword" placeholder="Пароль (мин. 6 символов)">
            </div>
            <div class="input-group">
                <i class="fas fa-check-circle"></i>
                <input type="password" id="regConfirmPassword" placeholder="Повторите пароль">
            </div>
            <div id="regError" class="auth-error"></div>
            <button id="registerBtn" class="auth-submit">Зарегистрироваться</button>
            <div class="auth-switch">Уже есть аккаунт? <a id="switchToLogin">Войти</a></div>
        </div>
    `;
    openModal('authModal');

    // Переключение вкладок
    const tabs = container.querySelectorAll('.auth-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            container.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
            container.querySelector(`#${target === 'login' ? 'loginForm' : 'registerForm'}`).classList.add('active');
            clearErrors();
        });
    });

    container.getElementById = (id) => container.querySelector('#' + id);

    document.getElementById('switchToRegister')?.addEventListener('click', (e) => {
        e.preventDefault();
        container.querySelector('.auth-tab[data-tab="register"]').click();
    });
    document.getElementById('switchToLogin')?.addEventListener('click', (e) => {
        e.preventDefault();
        container.querySelector('.auth-tab[data-tab="login"]').click();
    });

    document.getElementById('loginBtn').addEventListener('click', () => login());
    document.getElementById('registerBtn').addEventListener('click', () => register());

    // Enter для отправки
    container.querySelectorAll('input').forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const activeForm = container.querySelector('.auth-form.active');
                if (activeForm?.id === 'loginForm') login();
                else register();
            }
        });
    });

    // Фокус на первое поле
    setTimeout(() => {
        const firstInput = container.querySelector('.auth-form.active input');
        if (firstInput) firstInput.focus();
    }, 100);
}

function clearErrors() {
    ['loginError', 'regError'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.classList.remove('show'); el.innerText = ''; }
    });
}

function showFormError(id, msg) {
    const el = document.getElementById(id);
    if (el) { el.innerText = msg; el.classList.add('show'); }
}

async function login() {
    const loginVal = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    clearErrors();

    if (!loginVal || !password) {
        showFormError('loginError', 'Заполните все поля');
        return;
    }

    const btn = document.getElementById('loginBtn');
    btn.disabled = true;
    btn.textContent = 'Входим...';

    try {
        const data = await api.login(loginVal, password);
        token = data.token;
        currentUser = data.user;
        localStorage.setItem('token', token);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        closeModal('authModal');
        updateUIForUser();
        showToast(`Добро пожаловать, ${currentUser.login}! 👋`);
    } catch (err) {
        showFormError('loginError', err.message || 'Ошибка входа');
        btn.disabled = false;
        btn.textContent = 'Войти';
    }
}

async function register() {
    const loginVal = document.getElementById('regLogin').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirmPassword').value;
    clearErrors();

    if (!loginVal || !password || !confirm) {
        showFormError('regError', 'Заполните все поля');
        return;
    }
    if (loginVal.length < 3) {
        showFormError('regError', 'Логин должен быть не менее 3 символов');
        return;
    }
    if (password.length < 6) {
        showFormError('regError', 'Пароль должен быть не менее 6 символов');
        return;
    }
    if (password !== confirm) {
        showFormError('regError', 'Пароли не совпадают');
        return;
    }

    const btn = document.getElementById('registerBtn');
    btn.disabled = true;
    btn.textContent = 'Регистрируем...';

    try {
        const data = await api.register(loginVal, password);
        token = data.token;
        currentUser = data.user;
        localStorage.setItem('token', token);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        closeModal('authModal');
        updateUIForUser();
        showToast('Регистрация успешна! Добро пожаловать 🎉');
    } catch (err) {
        showFormError('regError', err.message || 'Ошибка регистрации');
        btn.disabled = false;
        btn.textContent = 'Зарегистрироваться';
    }
}

export function logout() {
    currentUser = null;
    token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    updateUIForUser();
    closeModal('profileModal');
    showToast('Вы вышли из аккаунта');
}

export async function showProfile() {
    if (!currentUser) return openAuthModal();

    const container = document.getElementById('profileContainer');
    container.innerHTML = `<div style="text-align:center; padding: 30px; color: var(--gray-color);"><i class="fas fa-spinner fa-spin" style="font-size:28px;"></i></div>`;
    openModal('profileModal');

    try {
        // Пытаемся получить актуальные данные с сервера
        let profile = currentUser;
        try {
            profile = await api.getProfile(token);
            // Обновляем кешированные данные
            currentUser = { ...currentUser, ...profile };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        } catch(e) {
            // Если сервер недоступен — показываем кешированные данные
        }

        // История тестов
        let history = [];
        try {
            history = await api.getTestHistory(token);
        } catch(e) {}

        const catNames = {
            it: 'IT и программирование',
            design: 'Дизайн и медиа',
            science: 'Наука и инженерия',
            business: 'Бизнес и финансы'
        };
        const initials = profile.login.substring(0, 2).toUpperCase();
        const regDate = profile.createdAt
            ? new Date(profile.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
            : 'Неизвестно';

        const historyHTML = history.length > 0
            ? history.slice(0, 5).map(h => `
                <div class="history-item">
                    <span class="cat-badge">${catNames[h.resultCategory] || h.resultCategory}</span>
                    <span class="history-date">${new Date(h.date).toLocaleDateString('ru-RU')}</span>
                </div>
            `).join('')
            : '<p style="color: var(--gray-color); font-size: 14px;">Тесты ещё не пройдены</p>';

        container.innerHTML = `
            <div class="profile-header">
                <div class="profile-avatar">${initials}</div>
                <div class="profile-info">
                    <h3>${profile.login}</h3>
                    <p><i class="fas fa-calendar" style="margin-right:6px;"></i>Зарегистрирован: ${regDate}</p>
                </div>
            </div>
            <div class="profile-stats">
                <div class="profile-stat">
                    <h4>${profile.testsTaken || 0}</h4>
                    <p>Пройдено тестов</p>
                </div>
                <div class="profile-stat">
                    <h4>${profile.lastResult ? catNames[profile.lastResult]?.split(' ')[0] || '—' : '—'}</h4>
                    <p>Последнее направление</p>
                </div>
            </div>
            ${history.length > 0 ? `
            <div class="profile-history">
                <h4><i class="fas fa-history" style="margin-right:8px;"></i>История тестов</h4>
                ${historyHTML}
            </div>` : ''}
            <div class="profile-actions">
                <button id="logoutBtn" class="btn btn-outline">
                    <i class="fas fa-sign-out-alt"></i> Выйти
                </button>
            </div>
        `;

        document.getElementById('logoutBtn').addEventListener('click', logout);

    } catch (err) {
        container.innerHTML = `
            <div style="text-align:center; padding: 30px;">
                <i class="fas fa-exclamation-circle" style="font-size:40px; color:#ef4444; margin-bottom:16px; display:block;"></i>
                <p style="color: var(--gray-color);">Не удалось загрузить профиль</p>
                <button id="logoutBtn" class="btn btn-outline" style="margin-top:16px;">Выйти</button>
            </div>
        `;
        document.getElementById('logoutBtn').addEventListener('click', logout);
    }
}

export async function updateUserStats(category) {
    if (!currentUser) return;
    try {
        await api.submitTestResult(token, category);
        currentUser.testsTaken = (currentUser.testsTaken || 0) + 1;
        currentUser.lastResult = category;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } catch (err) {
        console.error('Не удалось сохранить результат:', err);
        throw err;
    }
}

export async function updateStatsDisplay() {
    // Обновляем счётчик профессий при загрузке — оставляем professions.js
    // Пользователей и тестов можно брать с API если появится такой endpoint
    // Пока показываем заглушки
}