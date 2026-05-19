import { loadQuestions, startTest } from './test.js';
import { loadProfessions } from './professions.js';
import { loadUserFromStorage, updateStatsDisplay } from './auth.js';
import { initModalClosers } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Загрузка данных
    await Promise.all([
        loadQuestions(),
        loadProfessions()
    ]);
    loadUserFromStorage();
    updateStatsDisplay();
    initModalClosers();

    // Кнопки теста
    document.querySelectorAll('#startTestBtn, #startTestBtn2').forEach(btn =>
        btn.addEventListener('click', startTest)
    );

    // Тёмная тема
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
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const headerH = document.querySelector('header')?.offsetHeight || 70;
                const y = target.getBoundingClientRect().top + window.scrollY - headerH;
                window.scrollTo({ top: y, behavior: 'smooth' });
                // Закрываем мобильное меню при клике на ссылку
                closeMobileMenu();
            }
        });
    });

    // Мобильное меню (правильная реализация)
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    const navOverlay = document.getElementById('navOverlay');

    function openMobileMenu() {
        navLinks.classList.add('mobile-open');
        navOverlay.classList.add('open');
        mobileMenuBtn.querySelector('i').className = 'fas fa-times';
        document.body.style.overflow = 'hidden';
    }

    window.closeMobileMenu = function() {
        navLinks.classList.remove('mobile-open');
        navOverlay.classList.remove('open');
        mobileMenuBtn.querySelector('i').className = 'fas fa-bars';
        document.body.style.overflow = '';
    };

    mobileMenuBtn.addEventListener('click', () => {
        if (navLinks.classList.contains('mobile-open')) closeMobileMenu();
        else openMobileMenu();
    });
    navOverlay.addEventListener('click', closeMobileMenu);

    // Активный пункт меню при скролле
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-links a[href^="#"]');
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY + 100;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            if (scrollY >= top && scrollY < top + height) {
                navItems.forEach(a => a.classList.remove('active'));
                const activeLink = document.querySelector(`.nav-links a[href="#${id}"]`);
                if (activeLink) activeLink.classList.add('active');
            }
        });
    });

    // Форма обратной связи
    document.getElementById('feedbackForm').addEventListener('submit', (e) => {
        e.preventDefault();
        import('./utils.js').then(({ showToast }) => showToast('Спасибо! Мы свяжемся с вами.'));
        e.target.reset();
    });
});

function updateThemeButton(theme) {
    const btn = document.getElementById('themeToggle');
    const icon = btn.querySelector('i');
    const span = btn.querySelector('span');
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
        span.textContent = 'Светлая тема';
    } else {
        icon.className = 'fas fa-moon';
        span.textContent = 'Тёмная тема';
    }
}