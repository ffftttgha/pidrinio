// Анимация счётчиков при загрузке
export async function animateCounters() {
    try {
        const response = await fetch('http://localhost:5000/api/stats');
        const data = await response.json();

        document.getElementById('users-count').innerText = data.users;
        document.getElementById('tests-count').innerText = data.tests;
        document.getElementById('professions-count').innerText = data.professions;
        document.getElementById('partners-count').innerText = '15';

    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
    }
}

animateCounters();