// Анимация счётчиков при загрузке
export function animateCounters() {
    const counters = [
        { id: 'users-count', target: 0 }, // будет обновлено из auth
        { id: 'tests-count', target: 0 },
        { id: 'professions-count', target: 0 },
        { id: 'partners-count', target: 15 }
    ];
    // реальные значения подставятся позже, а пока просто показываем финальные цифры
    setTimeout(() => {
        document.getElementById('partners-count').innerText = '15';
    }, 500);
}