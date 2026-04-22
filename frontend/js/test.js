import { api } from './api.js';
import { openModal, closeModal, showAlert } from './utils.js';
import { getCurrentUser, updateUserStats, openAuthModal, getToken } from './auth.js';

let questions = [];
let currentIndex = 0;
let userAnswers = [];

export async function loadQuestions() {
  questions = await api.getQuestions();
}

export function startTest() {
  const user = getCurrentUser();
  if (!user) {
    if (confirm('Для сохранения результата нужно войти. Пройти тест без сохранения?')) {
      // можно проходить без сохранения
    } else {
      openAuthModal();
      return;
    }
  }
  currentIndex = 0;
  userAnswers = [];
  renderQuestion();
  openModal('testModal');
}

function renderQuestion() {
  const container = document.getElementById('testContainer');
  if (currentIndex >= questions.length) {
    showResult();
    return;
  }
  const q = questions[currentIndex];
  let html = `<div class="question"><p><strong>Вопрос ${currentIndex+1}/${questions.length}</strong><br>${q.text}</p>`;
  q.options.forEach(opt => {
    html += `<label><input type="radio" name="q" value="${opt.cat}"> ${opt.text}</label><br>`;
  });
  html += `<div style="margin-top:20px;"><button id="nextBtn" class="btn btn-primary">Далее</button></div></div>`;
  container.innerHTML = html;
  document.getElementById('nextBtn').addEventListener('click', () => saveAnswer());
}

function saveAnswer() {
  const selected = document.querySelector('input[name="q"]:checked');
  if (!selected) {
    showAlert('Выберите вариант ответа', true);
    return;
  }
  userAnswers.push(selected.value);
  currentIndex++;
  renderQuestion();
}

async function showResult() {
  const counts = { it:0, design:0, science:0, business:0 };
  userAnswers.forEach(cat => counts[cat]++);
  let topCat = Object.keys(counts).reduce((a,b) => counts[a] > counts[b] ? a : b);
  const catNames = { it:'IT и программирование', design:'Дизайн и медиа', science:'Наука и инженерия', business:'Бизнес и финансы' };
  const catName = catNames[topCat];
  // Загрузим профессии для рекомендации
  const professions = await api.getProfessions(topCat);
  const rec = professions.map(p => p.name).join(', ');
  const container = document.getElementById('testContainer');
  container.innerHTML = `
    <div class="result-box">
      <h3>🎉 Твой результат</h3>
      <p><strong>Направление:</strong> ${catName}</p>
      <p><strong>Рекомендуемые профессии:</strong> ${rec}</p>
      <button id="saveResultBtn" class="btn btn-secondary">Сохранить результат</button>
      <button id="restartTestBtn" class="btn btn-primary">Пройти заново</button>
    </div>
  `;
  document.getElementById('saveResultBtn').addEventListener('click', async () => {
    const user = getCurrentUser();
    if (user) {
      await updateUserStats(topCat);
      showAlert('Результат сохранён в личном кабинете!');
      closeModal('testModal');
    } else {
      if (confirm('Сохранить результат можно только после входа. Перейти ко входу?')) {
        closeModal('testModal');
        openAuthModal();
      }
    }
  });
  document.getElementById('restartTestBtn').addEventListener('click', () => startTest());
}