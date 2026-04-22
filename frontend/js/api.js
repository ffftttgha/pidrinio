const API_BASE = 'http://localhost:5000/api';

async function request(endpoint, method = 'GET', body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['x-auth-token'] = token;
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  
  const res = await fetch(`${API_BASE}${endpoint}`, options);
  
  if (!res.ok) {
    let errorMsg = 'Ошибка запроса';
    try {
      const errorData = await res.json();
      errorMsg = errorData.msg || errorMsg;
    } catch (e) {
      // Если ответ не JSON, берём текст
      errorMsg = await res.text().catch(() => errorMsg);
    }
    throw new Error(errorMsg);
  }
  
  return res.json();
}

export const api = {
  register: (login, password) => request('/auth/register', 'POST', { login, password }),
  login: (login, password) => request('/auth/login', 'POST', { login, password }),
  getProfile: (token) => request('/auth/profile', 'GET', null, token),
  getProfessions: (category = 'all') => request(`/professions?category=${category}`),
  getProfession: (id) => request(`/professions/${id}`),
  getQuestions: () => request('/questions'),
  submitTestResult: (token, resultCategory) => request('/test/submit', 'POST', { resultCategory }, token),
  getTestHistory: (token) => request('/test/history', 'GET', null, token)
};