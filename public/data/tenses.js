// Шпаргалка по часам + граматичні теми курсу.
// pos / neg / q — формули; use — коли вживати; markers — слова-маркери.
window.TENSES = [
  {
    id: 'present_simple', name: 'Present Simple', time: 'present', aspect: 'simple', level: 'A1',
    pos: 'I / you / we / they + V1\nhe / she / it + V1 + -s/-es',
    neg: 'do / does + not + V1',
    q: 'Do / Does + subject + V1?',
    use: {
      uk: 'Регулярні дії, звички, факти, розклади.',
      ru: 'Регулярные действия, привычки, факты, расписания.'
    },
    markers: 'always, usually, often, sometimes, never, every day, on Mondays',
    ex: [
      { en: "I work in IT.", uk: "Я працюю в IT.", ru: "Я работаю в IT." },
      { en: "She doesn’t drink coffee.", uk: "Вона не п'є каву.", ru: "Она не пьёт кофе." },
      { en: "Do you speak English?", uk: "Ти розмовляєш англійською?", ru: "Ты говоришь по-английски?" }
    ]
  },
  {
    id: 'present_continuous', name: 'Present Continuous', time: 'present', aspect: 'continuous', level: 'A1',
    pos: 'am / is / are + V-ing',
    neg: 'am / is / are + not + V-ing',
    q: 'Am / Is / Are + subject + V-ing?',
    use: {
      uk: 'Дія відбувається зараз або в цей період; заплановане найближче майбутнє.',
      ru: 'Действие происходит сейчас или в этот период; запланированное ближайшее будущее.'
    },
    markers: 'now, right now, at the moment, today, this week, Look!, Listen!',
    ex: [
      { en: "I am reading now.", uk: "Я зараз читаю.", ru: "Я сейчас читаю." },
      { en: "They aren’t working today.", uk: "Сьогодні вони не працюють.", ru: "Сегодня они не работают." },
      { en: "Are you coming tonight?", uk: "Ти прийдеш сьогодні ввечері?", ru: "Ты придёшь сегодня вечером?" }
    ]
  },
  {
    id: 'present_perfect', name: 'Present Perfect', time: 'present', aspect: 'perfect', level: 'A2',
    pos: 'have / has + V3',
    neg: 'have / has + not + V3',
    q: 'Have / Has + subject + V3?',
    use: {
      uk: 'Результат важливий зараз; досвід у житті; дія почалась у минулому і триває (зі станами). Час не вказаний.',
      ru: 'Результат важен сейчас; опыт в жизни; действие началось в прошлом и длится (с состояниями). Время не указано.'
    },
    markers: 'already, just, yet, ever, never, since, for, recently, so far',
    ex: [
      { en: "I have finished the task.", uk: "Я закінчив завдання.", ru: "Я закончил задачу." },
      { en: "She hasn’t been to London.", uk: "Вона не була в Лондоні.", ru: "Она не была в Лондоне." },
      { en: "Have you ever tried sushi?", uk: "Ти коли-небудь куштував суші?", ru: "Ты когда-нибудь пробовал суши?" }
    ]
  },
  {
    id: 'present_perfect_continuous', name: 'Present Perfect Continuous', time: 'present', aspect: 'perfect_continuous', level: 'B1',
    pos: 'have / has + been + V-ing',
    neg: 'have / has + not + been + V-ing',
    q: 'Have / Has + subject + been + V-ing?',
    use: {
      uk: 'Дія почалась у минулому і триває досі; важлива тривалість або видимий результат процесу.',
      ru: 'Действие началось в прошлом и длится до сих пор; важна длительность или видимый результат процесса.'
    },
    markers: 'for, since, all day, how long, lately, recently',
    ex: [
      { en: "I have been learning English for two years.", uk: "Я вчу англійську вже два роки.", ru: "Я учу английский уже два года." },
      { en: "It has been raining since morning.", uk: "Дощ іде з самого ранку.", ru: "Дождь идёт с самого утра." },
      { en: "How long have you been waiting?", uk: "Скільки ти вже чекаєш?", ru: "Сколько ты уже ждёшь?" }
    ]
  },
  {
    id: 'past_simple', name: 'Past Simple', time: 'past', aspect: 'simple', level: 'A1',
    pos: 'V2 (V-ed / 2nd form)',
    neg: 'did + not + V1',
    q: 'Did + subject + V1?',
    use: {
      uk: 'Завершена дія в минулому, час відомий; послідовність подій.',
      ru: 'Завершённое действие в прошлом, время известно; последовательность событий.'
    },
    markers: 'yesterday, last week, ago, in 2020, when I was a child',
    ex: [
      { en: "I visited Kyiv last year.", uk: "Минулого року я відвідав Київ.", ru: "В прошлом году я посетил Киев." },
      { en: "He didn’t call me yesterday.", uk: "Він не дзвонив мені вчора.", ru: "Он не звонил мне вчера." },
      { en: "Did you see the film?", uk: "Ти бачив цей фільм?", ru: "Ты видел этот фильм?" }
    ]
  },
  {
    id: 'past_continuous', name: 'Past Continuous', time: 'past', aspect: 'continuous', level: 'A2',
    pos: 'was / were + V-ing',
    neg: 'was / were + not + V-ing',
    q: 'Was / Were + subject + V-ing?',
    use: {
      uk: 'Дія тривала в певний момент у минулому; фонова дія, яку перервала інша.',
      ru: 'Действие длилось в определённый момент в прошлом; фоновое действие, которое прервало другое.'
    },
    markers: 'at 5 pm yesterday, while, when, all evening, at that moment',
    ex: [
      { en: "I was sleeping when you called.", uk: "Я спав, коли ти подзвонив.", ru: "Я спал, когда ты позвонил." },
      { en: "They weren’t listening.", uk: "Вони не слухали.", ru: "Они не слушали." },
      { en: "What were you doing at 8?", uk: "Що ти робив о 8-й?", ru: "Что ты делал в 8?" }
    ]
  },
  {
    id: 'past_perfect', name: 'Past Perfect', time: 'past', aspect: 'perfect', level: 'B1',
    pos: 'had + V3',
    neg: 'had + not + V3',
    q: 'Had + subject + V3?',
    use: {
      uk: 'Дія завершилась до іншої дії або моменту в минулому ("передминулий").',
      ru: 'Действие завершилось до другого действия или момента в прошлом ("предпрошедшее").'
    },
    markers: 'before, after, by the time, already, when, by 5 o’clock',
    ex: [
      { en: "The train had left before we arrived.", uk: "Потяг поїхав до того, як ми приїхали.", ru: "Поезд ушёл до того, как мы приехали." },
      { en: "I hadn’t seen him before.", uk: "Я не бачив його раніше.", ru: "Я не видел его раньше." },
      { en: "Had you finished by noon?", uk: "Ти закінчив до полудня?", ru: "Ты закончил к полудню?" }
    ]
  },
  {
    id: 'past_perfect_continuous', name: 'Past Perfect Continuous', time: 'past', aspect: 'perfect_continuous', level: 'B2',
    pos: 'had + been + V-ing',
    neg: 'had + not + been + V-ing',
    q: 'Had + subject + been + V-ing?',
    use: {
      uk: 'Дія тривала якийсь час до певного моменту в минулому.',
      ru: 'Действие длилось какое-то время до определённого момента в прошлом.'
    },
    markers: 'for, since, before, by the time, how long',
    ex: [
      { en: "She had been working for hours before she took a break.", uk: "Вона працювала годинами, перш ніж зробила перерву.", ru: "Она работала часами, прежде чем сделала перерыв." },
      { en: "They hadn’t been waiting long.", uk: "Вони чекали недовго.", ru: "Они ждали недолго." },
      { en: "How long had you been living there?", uk: "Як довго ти там прожив?", ru: "Как долго ты там прожил?" }
    ]
  },
  {
    id: 'future_simple', name: 'Future Simple', time: 'future', aspect: 'simple', level: 'A1',
    pos: 'will + V1',
    neg: 'will + not (won’t) + V1',
    q: 'Will + subject + V1?',
    use: {
      uk: 'Спонтанне рішення, прогноз, обіцянка, факт у майбутньому.',
      ru: 'Спонтанное решение, прогноз, обещание, факт в будущем.'
    },
    markers: 'tomorrow, next week, soon, in 2030, I think, probably',
    ex: [
      { en: "I will help you.", uk: "Я тобі допоможу.", ru: "Я тебе помогу." },
      { en: "It won’t take long.", uk: "Це не займе багато часу.", ru: "Это не займёт много времени." },
      { en: "Will you come tomorrow?", uk: "Ти прийдеш завтра?", ru: "Ты придёшь завтра?" }
    ]
  },
  {
    id: 'going_to', name: 'Be going to', time: 'future', aspect: 'plan', level: 'A2',
    pos: 'am / is / are + going to + V1',
    neg: 'am / is / are + not + going to + V1',
    q: 'Am / Is / Are + subject + going to + V1?',
    use: {
      uk: 'Плани та наміри, вирішені заздалегідь; прогноз на основі того, що бачимо зараз.',
      ru: 'Планы и намерения, решённые заранее; прогноз на основе того, что видим сейчас.'
    },
    markers: 'tomorrow, next month, this summer, Look at the clouds!',
    ex: [
      { en: "I am going to learn Python.", uk: "Я збираюся вивчати Python.", ru: "Я собираюсь изучать Python." },
      { en: "We aren’t going to move.", uk: "Ми не збираємося переїжджати.", ru: "Мы не собираемся переезжать." },
      { en: "Are you going to buy it?", uk: "Ти збираєшся це купити?", ru: "Ты собираешься это купить?" }
    ]
  },
  {
    id: 'future_continuous', name: 'Future Continuous', time: 'future', aspect: 'continuous', level: 'B1',
    pos: 'will + be + V-ing',
    neg: 'will + not + be + V-ing',
    q: 'Will + subject + be + V-ing?',
    use: {
      uk: 'Дія буде тривати в певний момент у майбутньому.',
      ru: 'Действие будет длиться в определённый момент в будущем.'
    },
    markers: 'at this time tomorrow, at 10 am next Monday, all day tomorrow',
    ex: [
      { en: "This time tomorrow I will be flying to Paris.", uk: "Завтра в цей час я летітиму до Парижа.", ru: "Завтра в это время я буду лететь в Париж." },
      { en: "I won’t be working on Sunday.", uk: "У неділю я не працюватиму.", ru: "В воскресенье я не буду работать." },
      { en: "Will you be using the car tonight?", uk: "Ти будеш користуватися машиною ввечері?", ru: "Ты будешь пользоваться машиной вечером?" }
    ]
  },
  {
    id: 'future_perfect', name: 'Future Perfect', time: 'future', aspect: 'perfect', level: 'B2',
    pos: 'will + have + V3',
    neg: 'will + not + have + V3',
    q: 'Will + subject + have + V3?',
    use: {
      uk: 'Дія завершиться до певного моменту в майбутньому.',
      ru: 'Действие завершится к определённому моменту в будущем.'
    },
    markers: 'by tomorrow, by the end of the year, by then, before',
    ex: [
      { en: "I will have finished the report by Friday.", uk: "Я закінчу звіт до п'ятниці.", ru: "Я закончу отчёт к пятнице." },
      { en: "They won’t have arrived by 6.", uk: "Вони не приїдуть до шостої.", ru: "Они не приедут к шести." },
      { en: "Will you have read it by Monday?", uk: "Ти прочитаєш це до понеділка?", ru: "Ты прочитаешь это к понедельнику?" }
    ]
  },
  {
    id: 'future_perfect_continuous', name: 'Future Perfect Continuous', time: 'future', aspect: 'perfect_continuous', level: 'B2',
    pos: 'will + have + been + V-ing',
    neg: 'will + not + have + been + V-ing',
    q: 'Will + subject + have + been + V-ing?',
    use: {
      uk: 'Дія триватиме певний час до моменту в майбутньому.',
      ru: 'Действие будет длиться определённое время к моменту в будущем.'
    },
    markers: 'for, by, by the time, by next year',
    ex: [
      { en: "By June I will have been working here for 5 years.", uk: "У червні буде 5 років, як я тут працюю.", ru: "В июне будет 5 лет, как я здесь работаю." },
      { en: "She won’t have been studying long.", uk: "Вона вчитиметься недовго.", ru: "Она будет учиться недолго." },
      { en: "How long will you have been living here?", uk: "Скільки ти вже житимеш тут на той час?", ru: "Сколько ты уже будешь жить здесь к тому времени?" }
    ]
  }
];

// Структура курсу: рівні CEFR -> уроки (граматична тема кожного уроку)
window.LEVELS = [
  { id: 'A1', name: 'Beginner', lessons: ['present_simple', 'present_continuous', 'past_simple', 'future_simple'] },
  { id: 'A2', name: 'Pre-Intermediate', lessons: ['going_to', 'past_continuous', 'present_perfect', 'mixed'] },
  { id: 'B1', name: 'Intermediate', lessons: ['present_perfect_continuous', 'past_perfect', 'future_continuous', 'mixed'] },
  { id: 'B2', name: 'Upper-Intermediate', lessons: ['past_perfect_continuous', 'future_perfect', 'future_perfect_continuous', 'mixed'] },
  { id: 'C1', name: 'Advanced', lessons: ['mixed', 'mixed', 'mixed', 'mixed'] },
  { id: 'C2', name: 'Proficiency', lessons: ['mixed', 'mixed', 'mixed', 'mixed'] }
];
