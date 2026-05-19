import { api } from './api.js';
import { openModal } from './utils.js';

let professions = [];

export async function loadProfessions() {
    try {
        professions = await api.getProfessions('all');
        const el = document.getElementById('professions-count');
        if (el) el.textContent = professions.length;
        renderProfessions('all');
        initFilters();
    } catch(e) {
        const grid = document.getElementById('professionsGrid');
        if (grid) grid.innerHTML = `<div style="text-align:center; padding:40px; color:var(--gray-color); grid-column:1/-1;">
            <i class="fas fa-exclamation-circle" style="font-size:32px; margin-bottom:12px; display:block;"></i>
            Не удалось загрузить профессии. Проверьте соединение с сервером.
        </div>`;
    }
}

function renderProfessions(category) {
    const grid = document.getElementById('professionsGrid');
    const filtered = category === 'all' ? professions : professions.filter(p => p.category === category);

    if (filtered.length === 0) {
        grid.innerHTML = `<div style="text-align:center; padding:40px; color:var(--gray-color); grid-column:1/-1;">Профессии не найдены</div>`;
        return;
    }

    const catIcons = { it: 'fa-code', design: 'fa-paint-brush', science: 'fa-flask', business: 'fa-chart-bar' };

    grid.innerHTML = filtered.map(p => `
        <div class="profession-card">
            <div class="profession-header">
                <h3><i class="fas ${catIcons[p.category] || 'fa-briefcase'}" style="margin-right:8px;"></i>${p.name}</h3>
            </div>
            <div class="profession-body">
                <p>${p.description.substring(0, 100)}...</p>
                <a href="profession.html?id=${p._id}" class="btn btn-primary" style="display:inline-block; margin-top:4px; padding: 9px 20px; font-size: 14px;">
                    Подробнее <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        </div>
    `).join('');
}

function initFilters() {
    const btns = document.querySelectorAll('.filter-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderProfessions(btn.dataset.cat);
        });
    });
}