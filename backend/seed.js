require('dotenv').config();
const mongoose = require('mongoose');
const Profession = require('./models/Profession');
const Question = require('./models/Question');

const professions = [
  { name: 'Программист', category: 'it', description: 'Разработка программного обеспечения, веб-сайтов и приложений.', skills: 'Алгоритмы, языки программирования (Python, Java, C++), английский', education: 'ВУЗы: ИТМО, МГУ, СПбПУ; курсы: Яндекс.Практикум', salary_range: '80 000 – 300 000 ₽', demand: 'Высокий' },
  { name: 'Веб-разработчик', category: 'it', description: 'Создание и поддержка сайтов и веб-приложений.', skills: 'HTML, CSS, JavaScript, React, Node.js', education: 'Курсы: Skillbox, Нетология, Яндекс.Практикум', salary_range: '70 000 – 250 000 ₽', demand: 'Очень высокий' },
  { name: 'Data Scientist', category: 'it', description: 'Анализ больших данных, построение моделей машинного обучения.', skills: 'Python, SQL, статистика, математика', education: 'МФТИ, ИТМО, ВШЭ', salary_range: '120 000 – 400 000 ₽', demand: 'Высокий' },
  { name: 'Специалист по кибербезопасности', category: 'it', description: 'Защита компьютерных систем от атак.', skills: 'Сети, криптография, Python, этичный хакинг', education: 'МГТУ им. Баумана, ИТМО, курсы', salary_range: '100 000 – 350 000 ₽', demand: 'Очень высокий' },
  { name: 'Графический дизайнер', category: 'design', description: 'Создание визуального контента: логотипы, баннеры, иллюстрации.', skills: 'Photoshop, Illustrator, креативность', education: 'БВШД, НИУ ВШЭ, онлайн-курсы', salary_range: '50 000 – 150 000 ₽', demand: 'Средний' },
  { name: 'UX/UI дизайнер', category: 'design', description: 'Проектирование удобных и красивых интерфейсов.', skills: 'Figma, аналитика, прототипирование', education: 'Нетология, Skillbox, Coursera', salary_range: '80 000 – 200 000 ₽', demand: 'Высокий' },
  { name: 'SMM-специалист', category: 'design', description: 'Ведение социальных сетей компании, создание контента.', skills: 'Копирайтинг, таргет, аналитика, видео-монтаж', education: 'Курсы: Skillbox, SMM-школы', salary_range: '50 000 – 150 000 ₽', demand: 'Высокий' },
  { name: 'Видеомонтажёр', category: 'design', description: 'Монтаж видео для YouTube, кино, рекламы.', skills: 'Premiere Pro, After Effects, Final Cut', education: 'Видеошколы, YouTube', salary_range: '60 000 – 180 000 ₽', demand: 'Средний' },
  { name: 'Инженер-робототехник', category: 'science', description: 'Разработка и программирование роботов.', skills: 'Физика, математика, C++, электроника', education: 'МГТУ им. Баумана, СПбПУ, МФТИ', salary_range: '90 000 – 250 000 ₽', demand: 'Средний' },
  { name: 'Биотехнолог', category: 'science', description: 'Исследования в области генной инженерии, создание лекарств.', skills: 'Химия, биология, лабораторные навыки', education: 'МГУ, РХТУ, СПбГУ', salary_range: '70 000 – 200 000 ₽', demand: 'Растущий' },
  { name: 'Эколог', category: 'science', description: 'Оценка влияния на окружающую среду, разработка природоохранных мер.', skills: 'Экология, химия, география', education: 'МГУ, РУДН, ТГУ', salary_range: '50 000 – 120 000 ₽', demand: 'Средний' },
  { name: 'Аналитик данных', category: 'it', description: 'Обработка данных, построение отчётов, дашбордов.', skills: 'SQL, Python, Tableau, Excel', education: 'ВШЭ, МГУ, курсы', salary_range: '90 000 – 250 000 ₽', demand: 'Высокий' },
  { name: 'Маркетолог', category: 'business', description: 'Разработка стратегий продвижения товаров и услуг.', skills: 'Аналитика, коммуникабельность, креатив', education: 'ВШЭ, РЭУ им. Плеханова, МГУ', salary_range: '70 000 – 200 000 ₽', demand: 'Высокий' },
  { name: 'Финансовый аналитик', category: 'business', description: 'Анализ финансовых показателей, инвестиции.', skills: 'Математика, Excel, финансовое моделирование', education: 'Финансовый университет, НИУ ВШЭ', salary_range: '100 000 – 300 000 ₽', demand: 'Высокий' },
  { name: 'Предприниматель', category: 'business', description: 'Создание и управление бизнесом.', skills: 'Лидерство, управление рисками, продажи', education: 'Любое высшее, бизнес-школы', salary_range: 'зависит от успеха', demand: 'Всегда нужны' },
  { name: 'HR-специалист', category: 'business', description: 'Подбор персонала, адаптация, развитие сотрудников.', skills: 'Психология, коммуникации, управление', education: 'МГУ, СПбГУ, курсы', salary_range: '60 000 – 150 000 ₽', demand: 'Высокий' }
];

const questions = [
  { text: 'Что тебе нравится делать в свободное время?', options: [{text:'Играть в компьютерные игры, разбираться в гаджетах',cat:'it'},{text:'Рисовать, монтировать видео, вести блог',cat:'design'},{text:'Читать научпоп, смотреть документалки',cat:'science'},{text:'Играть в настольные игры, планировать мероприятия',cat:'business'}] },
  { text: 'Какой школьный предмет тебе интереснее всего?', options: [{text:'Информатика',cat:'it'},{text:'ИЗО, черчение',cat:'design'},{text:'Физика, химия, биология',cat:'science'},{text:'Обществознание, экономика',cat:'business'}] },
  { text: 'Какую задачу ты предпочтёшь на работе?', options: [{text:'Писать код и отлаживать программы',cat:'it'},{text:'Создавать красивый визуал или видео',cat:'design'},{text:'Проводить эксперименты и исследования',cat:'science'},{text:'Убеждать людей, вести переговоры',cat:'business'}] },
  { text: 'Твой идеальный формат работы?', options: [{text:'Удалённо за компьютером',cat:'it'},{text:'В студии / офисе с творческими людьми',cat:'design'},{text:'В лаборатории или на природе',cat:'science'},{text:'В офисе, в команде, с клиентами',cat:'business'}] },
  { text: 'Что важнее в работе?', options: [{text:'Технологичность и инновации',cat:'it'},{text:'Красота и эстетика',cat:'design'},{text:'Точность и новые открытия',cat:'science'},{text:'Финансовый успех и влияние',cat:'business'}] },
  { text: 'Какая сфера тебя больше привлекает?', options: [{text:'Программирование, IT',cat:'it'},{text:'Творчество, дизайн, медиа',cat:'design'},{text:'Наука, исследования, инженерия',cat:'science'},{text:'Бизнес, управление, маркетинг',cat:'business'}] },
  { text: 'Как ты относишься к математике?', options: [{text:'Обожаю, это моё!',cat:'it'},{text:'Нормально, но не главное',cat:'design'},{text:'Люблю, особенно прикладную',cat:'science'},{text:'Терпимо, но нужна для бизнеса',cat:'business'}] },
  { text: 'Что тебе больше подходит: работать одному или в команде?', options: [{text:'Один – могу сосредоточиться',cat:'it'},{text:'Могу и так, и так',cat:'design'},{text:'Люблю обсуждать идеи в команде',cat:'science'},{text:'Обожаю командную работу',cat:'business'}] },
  {
    text: "Какую школьную дисциплину ты бы хотел изучать углублённо?",
    options: [
      { text: "Информатику и программирование", cat: "it" },
      { text: "Искусство, МХК, дизайн", cat: "design" },
      { text: "Физику, химию, биологию", cat: "science" },
      { text: "Экономику и обществознание", cat: "business" }
    ]
  },
  {
    text: "Как ты относишься к решению сложных логических задач?",
    options: [
      { text: "Обожаю, это моя стихия", cat: "it" },
      { text: "Люблю, если есть простор для творчества", cat: "design" },
      { text: "Нравится, особенно если есть чёткий алгоритм", cat: "science" },
      { text: "Нормально, но больше люблю работать с людьми", cat: "business" }
    ]
  },
  {
    text: "Что для тебя важнее в будущей работе?",
    options: [
      { text: "Высокая зарплата и карьерный рост", cat: "business" },
      { text: "Возможность создавать что-то новое", cat: "it" },
      { text: "Творческая самореализация", cat: "design" },
      { text: "Польза для общества и новые открытия", cat: "science" }
    ]
  },
  {
    text: "Какой формат обучения тебе ближе?",
    options: [
      { text: "Онлайн-курсы с самообучением", cat: "it" },
      { text: "Мастер-классы и практикумы", cat: "design" },
      { text: "Университетские лекции и лабораторные", cat: "science" },
      { text: "Бизнес-тренинги и кейсы", cat: "business" }
    ]
  },
  {
    text: "Выбери проект, который тебе интересно реализовать:",
    options: [
      { text: "Разработать мобильное приложение", cat: "it" },
      { text: "Создать дизайн-концепцию для бренда", cat: "design" },
      { text: "Провести научное исследование", cat: "science" },
      { text: "Открыть свой небольшой бизнес", cat: "business" }
    ]
  },
  {
    text: "Как ты обычно проводишь время с друзьями?",
    options: [
      { text: "Играем в компьютерные игры", cat: "it" },
      { text: "Снимаем и монтируем видео", cat: "design" },
      { text: "Обсуждаем научные новости", cat: "science" },
      { text: "Планируем совместные мероприятия", cat: "business" }
    ]
  },
  {
    text: "Что тебя мотивирует учиться новому?",
    options: [
      { text: "Желание понять, как всё устроено", cat: "science" },
      { text: "Стремление создать полезный продукт", cat: "it" },
      { text: "Желание выражать свои идеи красиво", cat: "design" },
      { text: "Возможность заработать и стать лидером", cat: "business" }
    ]
  },
  
  {
  text: "Какой проект тебе был бы интереснее?",
  options: [
    { text: "Создать игру или приложение", cat: "it" },
    { text: "Снять короткий фильм", cat: "design" },
    { text: "Разработать научный эксперимент", cat: "science" },
    { text: "Организовать стартап", cat: "business" }
  ]
},
{
  text: "Как ты предпочитаешь решать проблемы?",
  options: [
    { text: "Искать техническое решение", cat: "it" },
    { text: "Подходить творчески", cat: "design" },
    { text: "Анализировать факты и данные", cat: "science" },
    { text: "Обсуждать с людьми и договариваться", cat: "business" }
  ]
},
{
  text: "Что тебе ближе?",
  options: [
    { text: "Компьютеры и технологии", cat: "it" },
    { text: "Искусство и творчество", cat: "design" },
    { text: "Научные открытия", cat: "science" },
    { text: "Финансы и управление", cat: "business" }
  ]
},
{
  text: "Какая работа кажется тебе наиболее комфортной?",
  options: [
    { text: "За компьютером", cat: "it" },
    { text: "В творческой студии", cat: "design" },
    { text: "В лаборатории", cat: "science" },
    { text: "В офисе с командой", cat: "business" }
  ]
},
{
  text: "Что тебе интереснее изучать?",
  options: [
    { text: "Программирование", cat: "it" },
    { text: "Дизайн и визуал", cat: "design" },
    { text: "Научные теории", cat: "science" },
    { text: "Маркетинг и продажи", cat: "business" }
  ]
},
{
  text: "Какой навык ты хотел бы развить?",
  options: [
    { text: "Написание кода", cat: "it" },
    { text: "Создание графики", cat: "design" },
    { text: "Исследовательское мышление", cat: "science" },
    { text: "Лидерство", cat: "business" }
  ]
},
{
  text: "Что тебе нравится больше всего?",
  options: [
    { text: "Разбираться в системах", cat: "it" },
    { text: "Создавать красивое", cat: "design" },
    { text: "Изучать новое", cat: "science" },
    { text: "Организовывать процессы", cat: "business" }
  ]
},
{
  text: "Какая задача тебе кажется самой интересной?",
  options: [
    { text: "Создать алгоритм", cat: "it" },
    { text: "Разработать фирменный стиль", cat: "design" },
    { text: "Поставить эксперимент", cat: "science" },
    { text: "Разработать бизнес-план", cat: "business" }
  ]
},
{
  text: "Какой формат работы тебе ближе?",
  options: [
    { text: "Удалённая работа", cat: "it" },
    { text: "Свободный творческий график", cat: "design" },
    { text: "Научная практика", cat: "science" },
    { text: "Деловые встречи", cat: "business" }
  ]
},
{
  text: "Что тебе важнее всего в профессии?",
  options: [
    { text: "Технологичность", cat: "it" },
    { text: "Креативность", cat: "design" },
    { text: "Научная ценность", cat: "science" },
    { text: "Доход и статус", cat: "business" }
  ]
},
{
  text: "Что тебе нравится делать в интернете?",
  options: [
    { text: "Изучать технологии", cat: "it" },
    { text: "Смотреть творческий контент", cat: "design" },
    { text: "Читать научные статьи", cat: "science" },
    { text: "Изучать бизнес-кейсы", cat: "business" }
  ]
},
{
  text: "Какая школьная задача тебе интереснее?",
  options: [
    { text: "Написать программу", cat: "it" },
    { text: "Сделать презентацию", cat: "design" },
    { text: "Провести исследование", cat: "science" },
    { text: "Подготовить бизнес-проект", cat: "business" }
  ]
},
{
  text: "Что тебе больше подходит?",
  options: [
    { text: "Техническое мышление", cat: "it" },
    { text: "Творческое мышление", cat: "design" },
    { text: "Аналитическое мышление", cat: "science" },
    { text: "Организаторские способности", cat: "business" }
  ]
},
{
  text: "Какую карьеру ты бы выбрал?",
  options: [
    { text: "Разработчик IT-продуктов", cat: "it" },
    { text: "Креативный директор", cat: "design" },
    { text: "Учёный или инженер", cat: "science" },
    { text: "Руководитель компании", cat: "business" }
  ]
},
{
  text: "Что тебе ближе по духу?",
  options: [
    { text: "Инновации и технологии", cat: "it" },
    { text: "Творчество и вдохновение", cat: "design" },
    { text: "Исследования и открытия", cat: "science" },
    { text: "Управление и стратегия", cat: "business" }
  ]
}
];

async function seed() {
  const existingCount = await Question.countDocuments();
  if (existingCount > 0) {
      console.log(`Seeder: в БД уже ${existingCount} вопросов. Пропускаем заполнение.`);
      process.exit(0);
  }
  await mongoose.connect(process.env.MONGO_URI);
  await Profession.deleteMany();
  await Question.deleteMany();
  await Profession.insertMany(professions);
  await Question.insertMany(questions);
  console.log('Database seeded!');
  process.exit();
}

seed();