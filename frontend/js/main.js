import { loadQuestions, startTest } from './test.js';
import { loadProfessions } from './professions.js';
import { loadUserFromStorage, updateStatsDisplay } from './auth.js';
import { initModalClosers } from './utils.js';

let currentScroll = 0;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. ЗАГРУЗКА ДАННЫХ И ИНИЦИАЛИЗАЦИЯ
    await Promise.all([
        loadQuestions(),
        loadProfessions()
    ]);
    loadUserFromStorage();
    updateStatsDisplay();
    initModalClosers();

    // 2. КНОПКИ ТЕСТА
    document.querySelectorAll('#startTestBtn, #startTestBtn2').forEach(btn =>
        btn.addEventListener('click', startTest)
    );

    // 3. ТЁМНАЯ ТЕМА
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

    // 4. ПЛАВНАЯ ПРОКРУТКА ССЫЛОК
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
        anchor.addEventListener('click', function (e) {

            e.preventDefault();

            const target = document.querySelector(this.getAttribute('href'));

            if (target) {
                const headerH =
                    document.querySelector('header')?.offsetHeight || 70;

                const y =
                    target.getBoundingClientRect().top +
                    window.scrollY -
                    headerH -
                    20;

                window.scrollTo({
                    top: y,
                    behavior: 'smooth'
                });

                closeMobileMenu();
            }
        });
    });

    // 5. МОБИЛЬНОЕ МЕНЮ
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navCloseBtn = document.getElementById('navCloseBtn');
    const navLinks = document.getElementById('navLinks');
    const navOverlay = document.getElementById('navOverlay');

    function openMobileMenu() {
        navLinks.classList.add('mobile-open');
        navOverlay.classList.add('open');

        const icon = mobileMenuBtn.querySelector('i');

        if (icon) {
            icon.className = 'fas fa-times';
        }

        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        navLinks.classList.remove('mobile-open');
        navOverlay.classList.remove('open');

        const icon = mobileMenuBtn.querySelector('i');

        if (icon) {
            icon.className = 'fas fa-bars';
        }

        document.body.style.overflow = '';
    }

    mobileMenuBtn.addEventListener('click', () => {
        if (navLinks.classList.contains('mobile-open')) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });

    if (navCloseBtn) {
        navCloseBtn.addEventListener('click', closeMobileMenu);
    }

    if (navOverlay) {
        navOverlay.addEventListener('click', closeMobileMenu);
    }

    // 6. АКТИВНЫЙ ПУНКТ МЕНЮ ПРИ СКРОЛЛЕ
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-links a[href^="#"]');

    window.addEventListener('scroll', () => {
        currentScroll = window.scrollY;
        const scrollYWithOffset = currentScroll + 100;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            if (scrollYWithOffset >= top && scrollYWithOffset < top + height) {
                navItems.forEach(a => a.classList.remove('active'));
                const activeLink = document.querySelector(`.nav-links a[href="#${id}"]`);
                if (activeLink) activeLink.classList.add('active');
            }
        });
    });

    // 7. ФОРМА ОБРАТНОЙ СВЯЗИ
    document.getElementById('feedbackForm').addEventListener('submit', (e) => {
        e.preventDefault();
        import('./utils.js').then(({ showToast }) => showToast('Спасибо! Мы свяжемся с вами.'));
        e.target.reset();
    });

    // 8. ИНИЦИАЛИЗАЦИЯ ИНТЕРАКТИВНЫХ ЭФФЕКТОВ
    init3DTilt();
    initParallaxAndMouseEffects();
});

function updateThemeButton(theme) {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    const icon = btn.querySelector('i');
    const span = btn.querySelector('span');
    if (theme === 'dark') {
        if (icon) icon.className = 'fas fa-sun';
        if (span) span.textContent = 'Светлая тема';
    } else {
        if (icon) icon.className = 'fas fa-moon';
        if (span) span.textContent = 'Тёмная тема';
    }
}

// ===== ЭФФЕКТЫ 3D-НАКЛОНА КАРТОЧЕК =====
function init3DTilt() {
    function applyTiltEffect(element) {
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((centerY - y) / centerY) * 12;
            const rotateY = ((x - centerX) / centerX) * 12;
            element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        element.addEventListener('mouseleave', () => {
            element.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
        });
    }

    document.querySelectorAll('.about-card, .step, .team-member').forEach(card => applyTiltEffect(card));

    const gridContainer = document.getElementById('professionsGrid');
    if (gridContainer) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    gridContainer.querySelectorAll('.profession-card').forEach(card => applyTiltEffect(card));
                }
            });
        });
        observer.observe(gridContainer, { childList: true });
    }
}

// ===== ПАРАЛЛАКС И ЭФФЕКТ МЫШИ =====
function initParallaxAndMouseEffects() {
    const layer1 = document.querySelector('.layer-1');
    const layer2 = document.querySelector('.layer-2');
    const layer3 = document.querySelector('.layer-3');
    const sphere1 = document.getElementById('hero-sphere-1');
    const sphere2 = document.getElementById('hero-sphere-2');
    const sphere3 = document.getElementById('hero-sphere-3');

    window.addEventListener('mousemove', (e) => {
        const mouseX = (e.clientX / window.innerWidth) - 0.5;
        const mouseY = (e.clientY / window.innerHeight) - 0.5;

        if (sphere1) {
            sphere1.style.setProperty('--mx', `${mouseX * 60}px`);
            sphere1.style.setProperty('--my', `${mouseY * 60}px`);
        }
        if (sphere2) {
            sphere2.style.setProperty('--mx', `${-mouseX * 80}px`);
            sphere2.style.setProperty('--my', `${-mouseY * 80}px`);
        }
        if (sphere3) {
            sphere3.style.setProperty('--mx', `${mouseX * 50}px`);
            sphere3.style.setProperty('--my', `${-mouseY * 70}px`);
        }
    });

    window.addEventListener('scroll', () => {
        const scrollValue = window.scrollY;

        if (layer1) layer1.style.transform = `translateY(${scrollValue * 0.1}px)`;
        if (layer2) layer2.style.transform = `translateY(${scrollValue * 0.2}px)`;
        if (layer3) layer3.style.transform = `translateY(${scrollValue * 0.3}px)`;

        if (sphere1) sphere1.style.setProperty('--ty', `${scrollValue * 0.15}px`);
        if (sphere2) sphere2.style.setProperty('--ty', `${scrollValue * 0.35}px`);
        if (sphere3) sphere3.style.setProperty('--ty', `${scrollValue * 0.25}px`);
    });
}