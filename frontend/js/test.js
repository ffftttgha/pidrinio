import { api } from './api.js';
import { openModal, closeModal, showToast } from './utils.js';
import { getCurrentUser, updateUserStats, openAuthModal, getToken } from './auth.js';

let questions = [];
let currentIndex = 0;
let userAnswers = [];

export async function loadQuestions() {
    try {
        questions = await api.getQuestions();
    } catch (e) {
        console.error('Не удалось загрузить вопросы:', e);
    }
}

export function startTest() {
    if (questions.length === 0) {
        showToast('Вопросы ещё не загружены. Попробуйте позже.', 'error');
        return;
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
    const progress = Math.round((currentIndex / questions.length) * 100);

    container.innerHTML = `
        <div class="question-progress">
            <div class="question-progress-bar" style="width: ${progress}%"></div>
        </div>
        <div class="question">
            <div class="question-header">
                <p style="font-size: 13px; color: var(--gray-color); margin-bottom: 6px;">
                    Вопрос ${currentIndex + 1} из ${questions.length}
                </p>
                <p>${q.text}</p>
            </div>
            <div class="question-options">
                ${q.options.map((opt, i) => `
                    <label class="option-label">
                        <input type="radio" name="q" value="${opt.cat}">
                        <span>${opt.text}</span>
                    </label>
                `).join('')}
                <label class="option-label" id="otherOptionLabel">
                    <input type="radio" name="q" value="other" id="otherRadio">
                    <span>Другое</span>
                </label>
                <div id="otherInputWrapper" style="display:none; margin-top: 8px; padding: 0 4px;">
                    <input
                        type="text"
                        id="otherText"
                        placeholder="Напишите свой вариант..."
                        style="
                            width: 100%;
                            padding: 10px 14px;
                            border: 1.5px solid var(--border-color);
                            border-radius: 10px;
                            font-size: 14px;
                            font-family: inherit;
                            background: var(--bg-color, #fff);
                            color: inherit;
                            outline: none;
                            box-sizing: border-box;
                            transition: border-color 0.2s;
                        "
                    />
                </div>
            </div>
            <div style="margin-top: 20px; display: flex; gap: 12px; align-items: center;">
                ${currentIndex > 0 ? `<button id="prevBtn" class="btn btn-outline" style="padding: 10px 20px;">← Назад</button>` : ''}
                <button id="nextBtn" class="btn btn-primary" style="flex: 1;">
                    ${currentIndex < questions.length - 1 ? 'Далее →' : 'Завершить'}
                </button>
            </div>
        </div>
    `;

    // Показывать поле ввода при выборе "Другое"
    const otherRadio = document.getElementById('otherRadio');
    const otherInputWrapper = document.getElementById('otherInputWrapper');
    const otherTextInput = document.getElementById('otherText');

    container.querySelectorAll('input[name="q"]').forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'other') {
                otherInputWrapper.style.display = 'block';
                otherTextInput.focus();
            } else {
                otherInputWrapper.style.display = 'none';
                otherTextInput.value = '';
            }
        });
    });

    otherTextInput.addEventListener('focus', () => {
        otherTextInput.style.borderColor = 'var(--primary-color)';
    });
    otherTextInput.addEventListener('blur', () => {
        otherTextInput.style.borderColor = 'var(--border-color)';
    });

    // Восстановить предыдущий ответ при возврате назад
    if (currentIndex < userAnswers.length) {
        const prev = userAnswers[currentIndex];
        if (prev && prev.cat === 'other') {
            otherRadio.checked = true;
            otherInputWrapper.style.display = 'block';
            otherTextInput.value = prev.text || '';
        } else if (prev) {
            const match = container.querySelector(`input[value="${prev.cat}"]`);
            if (match) match.checked = true;
        }
    }

    document.getElementById('nextBtn').addEventListener('click', () => saveAnswer());
    document.getElementById('prevBtn')?.addEventListener('click', () => {
        currentIndex--;
        userAnswers.pop();
        renderQuestion();
    });

    // Двойной клик — мгновенный переход (кроме "Другое")
    container.querySelectorAll('.option-label').forEach(label => {
        label.addEventListener('dblclick', () => {
            const radio = label.querySelector('input[type="radio"]');
            if (radio && radio.value !== 'other') {
                saveAnswer();
            }
        });
    });
}

function saveAnswer() {
    const selected = document.querySelector('input[name="q"]:checked');
    if (!selected) {
        const opts = document.querySelectorAll('.option-label');
        opts.forEach(o => o.style.borderColor = '#ef4444');
        setTimeout(() => opts.forEach(o => o.style.borderColor = ''), 1500);
        showToast('Выберите вариант ответа', 'error');
        return;
    }

    if (selected.value === 'other') {
        const otherText = document.getElementById('otherText')?.value?.trim();
        if (!otherText) {
            const otherInput = document.getElementById('otherText');
            if (otherInput) {
                otherInput.style.borderColor = '#ef4444';
                setTimeout(() => otherInput.style.borderColor = 'var(--border-color)', 1500);
            }
            showToast('Пожалуйста, напишите свой вариант', 'error');
            return;
        }
        userAnswers.push({ cat: 'other', text: otherText });
    } else {
        userAnswers.push({ cat: selected.value, text: null });
    }

    currentIndex++;
    renderQuestion();
}

async function showResult() {
    const counts = { it: 0, design: 0, science: 0, business: 0 };
    userAnswers.forEach(answer => {
        const cat = typeof answer === 'string' ? answer : answer.cat;
        if (counts[cat] !== undefined) counts[cat]++;
        // Ответы "Другое" не учитываются в категориях
    });

    const topCat = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);

    const catNames = {
        it: 'IT и программирование',
        design: 'Дизайн и медиа',
        science: 'Наука и инженерия',
        business: 'Бизнес и финансы'
    };
    const catEmojis = { it: '💻', design: '🎨', science: '🔬', business: '📊' };

    let professions = [];
    try {
        professions = await api.getProfessions(topCat);
    } catch(e) {}

    const profsHTML = professions.length > 0
        ? `<div class="result-professions">
            <h4>Рекомендуемые профессии:</h4>
            <ul>${professions.map(p => `<li>${p.name}</li>`).join('')}</ul>
           </div>`
        : '';

    const countedAnswers = userAnswers.filter(a => (typeof a === 'string' ? a : a.cat) !== 'other');
    const total = countedAnswers.length;

    const barsHTML = Object.entries(catNames).map(([key, name]) => {
        const pct = total > 0 ? Math.round((counts[key] / total) * 100) : 0;
        return `<div style="margin-bottom:8px;">
            <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px;">
                <span>${catEmojis[key]} ${name}</span><span>${pct}%</span>
            </div>
            <div style="height:6px; background:var(--border-color); border-radius:3px; overflow:hidden;">
                <div style="height:100%; width:${pct}%; background:var(--primary-color); border-radius:3px; transition: width 0.6s ease;"></div>
            </div>
        </div>`;
    }).join('');

    const otherAnswers = userAnswers.filter(a => (typeof a === 'string' ? a : a.cat) === 'other');
    const otherHTML = otherAnswers.length > 0
        ? `<div style="margin-top: 16px; padding: 12px 14px; background: var(--border-color, #f3f4f6); border-radius: 10px;">
            <p style="font-size: 13px; color: var(--gray-color); margin-bottom: 8px; font-weight: 600;">Ваши собственные варианты (${otherAnswers.length}):</p>
            <ul style="margin: 0; padding-left: 18px; font-size: 13px;">
                ${otherAnswers.map(a => `<li style="margin-bottom: 4px;">${a.text}</li>`).join('')}
            </ul>
           </div>`
        : '';

    const container = document.getElementById('testContainer');
    container.innerHTML = `
        <div class="result-box">
            <div style="font-size: 48px; margin-bottom: 8px;">${catEmojis[topCat]}</div>
            <h3>Твой результат готов!</h3>
            <div class="result-category">${catNames[topCat]}</div>
            ${profsHTML}
            <div style="margin: 20px 0; text-align: left;">
                <h4 style="margin-bottom: 12px; font-size: 14px; color: var(--gray-color);">Распределение ответов:</h4>
                ${barsHTML}
                ${otherHTML}
            </div>
            <div class="result-actions">
                <button id="saveResultBtn" class="btn btn-secondary">
                    <i class="fas fa-save"></i> Сохранить результат
                </button>
                <button id="restartTestBtn" class="btn btn-outline">
                    <i class="fas fa-redo"></i> Пройти заново
                </button>
            </div>
        </div>
    `;

    document.getElementById('saveResultBtn').addEventListener('click', async () => {
        const user = getCurrentUser();
        if (user) {
            try {
                await updateUserStats(topCat);
                showToast('Результат сохранён в личном кабинете! 🎉');
                document.getElementById('saveResultBtn').disabled = true;
                document.getElementById('saveResultBtn').textContent = '✓ Сохранено';
            } catch(e) {
                showToast('Не удалось сохранить результат', 'error');
            }
        } else {
            closeModal('testModal');
            openAuthModal('register');
            showToast('Зарегистрируйтесь, чтобы сохранить результат');
        }
    });

    document.getElementById('restartTestBtn').addEventListener('click', () => {
        currentIndex = 0;
        userAnswers = [];
        renderQuestion();
    });
}