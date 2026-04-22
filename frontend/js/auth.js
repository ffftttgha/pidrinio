import { api } from './api.js';
import { openModal, closeModal, showAlert } from './utils.js';

let currentUser = null;
let token = null;

export function getCurrentUser() { return currentUser; }
export function getToken() { return token; }

export function loadUserFromStorage() {
  token = localStorage.getItem('token');
  const savedUser = localStorage.getItem('currentUser');
  if (token && savedUser) {
    currentUser = JSON.parse(savedUser);
    updateUIForUser();
  }
  updateStatsDisplay();
}

async function updateUIForUser() {
  const profileLink = document.getElementById('profileLink');
  if (currentUser) {
    profileLink.innerHTML = `👤 ${currentUser.login} (выйти)`;
    profileLink.onclick = (e) => { e.preventDefault(); showProfile(); };
  } else {
    profileLink.innerHTML = 'Личный кабинет';
    profileLink.onclick = (e) => { e.preventDefault(); openAuthModal(); };
  }
}

export function openAuthModal() {
  const container = document.getElementById('authContainer');
  container.innerHTML = `
    <div class="auth-tabs">
      <div class="auth-tab active" data-tab="login">Вход</div>
      <div class="auth-tab" data-tab="register">Регистрация</div>
    </div>
    <div id="loginForm" class="auth-form active">
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
    <div id="registerForm" class="auth-form">
      <div class="input-group">
        <i class="fas fa-user"></i>
        <input type="text" id="regLogin" placeholder="Логин" autocomplete="username">
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
  const tabs = document.querySelectorAll('.auth-tab');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      if (target === 'login') {
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
      } else {
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
      }
      // Очищаем ошибки
      document.getElementById('loginError').classList.remove('show');
      document.getElementById('regError').classList.remove('show');
    });
  });

  // Кнопки переключения внутри форм
  document.getElementById('switchToRegister')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('.auth-tab[data-tab="register"]').click();
  });
  document.getElementById('switchToLogin')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('.auth-tab[data-tab="login"]').click();
  });

  // Обработчики отправки
  document.getElementById('loginBtn').addEventListener('click', () => login());
  document.getElementById('registerBtn').addEventListener('click', () => register());

  // Вход по Enter
  const inputs = document.querySelectorAll('#loginForm input, #registerForm input');
  inputs.forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const activeForm = document.querySelector('.auth-form.active');
        if (activeForm.id === 'loginForm') login();
        else register();
      }
    });
  });
}

async function login() {
  const loginVal = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorDiv = document.getElementById('loginError');
  errorDiv.classList.remove('show');
  errorDiv.innerText = '';

  if (!loginVal || !password) {
    errorDiv.innerText = 'Заполните все поля';
    errorDiv.classList.add('show');
    return;
  }

  try {
    const data = await api.login(loginVal, password);
    token = data.token;
    currentUser = data.user;
    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    closeModal('authModal');
    updateUIForUser();
    updateStatsDisplay();
    showAlert(`Добро пожаловать, ${currentUser.login}!`);
  } catch (err) {
    errorDiv.innerText = err.message || 'Ошибка входа';
    errorDiv.classList.add('show');
  }
}

async function register() {
  const loginVal = document.getElementById('regLogin').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirm = document.getElementById('regConfirmPassword').value;
  const errorDiv = document.getElementById('regError');
  errorDiv.classList.remove('show');
  errorDiv.innerText = '';

  if (!loginVal || !password || !confirm) {
    errorDiv.innerText = 'Заполните все поля';
    errorDiv.classList.add('show');
    return;
  }
  if (password.length < 6) {
    errorDiv.innerText = 'Пароль должен быть не менее 6 символов';
    errorDiv.classList.add('show');
    return;
  }
  if (password !== confirm) {
    errorDiv.innerText = 'Пароли не совпадают';
    errorDiv.classList.add('show');
    return;
  }

  try {
    const data = await api.register(loginVal, password);
    token = data.token;
    currentUser = data.user;
    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    closeModal('authModal');
    updateUIForUser();
    updateStatsDisplay();
    showAlert('Регистрация успешна!');
  } catch (err) {
    errorDiv.innerText = err.message || 'Ошибка регистрации';
    errorDiv.classList.add('show');
  }
}

export function logout() {
  currentUser = null;
  token = null;
  localStorage.removeItem('token');
  localStorage.removeItem('currentUser');
  updateUIForUser();
  updateStatsDisplay();
  showAlert('Вы вышли из аккаунта');
}

async function showProfile() {
  if (!currentUser) return openAuthModal();
  try {
    const profile = await api.getProfile(token);
    const detailDiv = document.getElementById('professionDetail');
    detailDiv.innerHTML = `
      <h3>Личный кабинет</h3>
      <p><strong>Имя:</strong> ${profile.login}</p>
      <p><strong>Пройдено тестов:</strong> ${profile.testsTaken}</p>
      <p><strong>Последний результат:</strong> ${profile.lastResult || 'нет'}</p>
      <button id="logoutBtn" class="btn btn-secondary">Выйти</button>
    `;
    openModal('professionModal');
    document.getElementById('logoutBtn').addEventListener('click', () => {
      logout();
      closeModal('professionModal');
    });
  } catch (err) {
    showAlert('Ошибка загрузки профиля', true);
  }
}

export async function updateUserStats(category) {
  if (!currentUser) return;
  try {
    await api.submitTestResult(token, category);
    currentUser.testsTaken += 1;
    currentUser.lastResult = category;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateStatsDisplay();
  } catch (err) {
    console.error(err);
  }
}

export async function updateStatsDisplay() {
  try {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    document.getElementById('users-count').innerText = users.length;
    const totalTests = users.reduce((s,u) => s + (u.testsTaken||0), 0);
    document.getElementById('tests-count').innerText = totalTests;
  } catch(e) {}
}