import { api } from './api.js';
import { openModal } from './utils.js';

let professions = [];

export async function loadProfessions() {
  professions = await api.getProfessions('all');
  document.getElementById('professions-count').innerText = professions.length;
  renderProfessions('all');
  initFilters();
}

function renderProfessions(category) {
  const grid = document.getElementById('professionsGrid');
  const filtered = category === 'all' ? professions : professions.filter(p => p.category === category);
  grid.innerHTML = filtered.map(p => `
    <div class="profession-card">
      <div class="profession-header"><h3>${p.name}</h3></div>
      <div class="profession-body">
        <p>${p.description.substring(0,80)}...</p>
        <a href="profession.html?id=${p._id}" class="btn btn-primary" style="display:inline-block; margin-top:10px;">Подробнее</a>
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