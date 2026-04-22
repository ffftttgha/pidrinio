import { loadQuestions, startTest } from './test.js';
import { loadProfessions } from './professions.js';
import { loadUserFromStorage, updateStatsDisplay } from './auth.js';
import { initModalClosers } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  await loadQuestions();
  await loadProfessions();
  loadUserFromStorage();
  updateStatsDisplay();
  initModalClosers();

  const startBtns = document.querySelectorAll('#startTestBtn, #startTestBtn2');
  startBtns.forEach(btn => btn.addEventListener('click', startTest));

  // Тёмная тема (как раньше)
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeButton(savedTheme);
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeButton(newTheme);
  });

  // Плавная прокрутка
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Мобильное меню
  const mobileMenu = document.querySelector('.mobile-menu');
  const navLinks = document.querySelector('.nav-links');
  mobileMenu.addEventListener('click', () => {
    if (navLinks.style.display === 'flex') {
      navLinks.style.display = '';
      navLinks.style.position = '';
    } else {
      navLinks.style.display = 'flex';
      navLinks.style.flexDirection = 'column';
      navLinks.style.position = 'absolute';
      navLinks.style.top = '60px';
      navLinks.style.left = '0';
      navLinks.style.width = '100%';
      navLinks.style.background = 'var(--header-bg)';
      navLinks.style.padding = '20px';
      navLinks.style.boxShadow = 'var(--shadow)';
    }
  });

  // Форма обратной связи
  document.getElementById('feedbackForm').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Спасибо за сообщение! Мы свяжемся с вами.');
    e.target.reset();
  });
});

function updateThemeButton(theme) {
  const btn = document.getElementById('themeToggle');
  const icon = btn.querySelector('i');
  const span = btn.querySelector('span');
  if (theme === 'dark') {
    icon.className = 'fas fa-sun';
    span.innerText = 'Светлая тема';
  } else {
    icon.className = 'fas fa-moon';
    span.innerText = 'Тёмная тема';
  }
}