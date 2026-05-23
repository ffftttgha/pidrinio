import { API_BASE } from './api.js';

// Анимация счётчиков при загрузке — только на главной странице
export async function animateCounters() {
    // Если элементов нет на странице — выходим сразу
    const el1 = document.getElementById('users-count');
    const el2 = document.getElementById('tests-count');
    const el3 = document.getElementById('professions-count');
    const el4 = document.getElementById('partners-count');

    if (!el1 && !el2 && !el3 && !el4) return;

    try {
        const response = await fetch(`${API_BASE}/stats`);
        const data = await response.json();

        if (el1) el1.innerText = data.users;
        if (el2) el2.innerText = data.tests;
        if (el3) el3.innerText = data.professions;
        if (el4) el4.innerText = '15';

    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
    }
}

// Запускаем только на главной
if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
    animateCounters();
}