// Слова уроків. Ключ: напрям_рівень_номерУроку. Рядок: слово | транскрипція | укр | рус
// Уроки без статичних слів генеруються ІІ і кешуються у профілі користувача.
window.WORDS_RAW = `
# general_A1_1 Family and people
mother|ˈmʌðə|мати|мать
father|ˈfɑːðə|батько|отец
brother|ˈbrʌðə|брат|брат
sister|ˈsɪstə|сестра|сестра
child|tʃaɪld|дитина|ребёнок
friend|frend|друг|друг
husband|ˈhʌzbənd|чоловік (у шлюбі)|муж
wife|waɪf|дружина|жена
neighbour|ˈneɪbə|сусід|сосед
people|ˈpiːpl|люди|люди
# general_A1_2 Daily routine
wake up|weɪk ʌp|прокидатися|просыпаться
get up|ɡet ʌp|вставати|вставать
breakfast|ˈbrekfəst|сніданок|завтрак
shower|ˈʃaʊə|душ|душ
work|wɜːk|працювати; робота|работать; работа
lunch|lʌntʃ|обід|обед
dinner|ˈdɪnə|вечеря|ужин
evening|ˈiːvnɪŋ|вечір|вечер
usually|ˈjuːʒuəli|зазвичай|обычно
sleep|sliːp|спати|спать
# general_A1_3 Home and city
house|haʊs|будинок|дом
flat|flæt|квартира|квартира
kitchen|ˈkɪtʃɪn|кухня|кухня
bedroom|ˈbedruːm|спальня|спальня
street|striːt|вулиця|улица
shop|ʃɒp|магазин|магазин
park|pɑːk|парк|парк
station|ˈsteɪʃn|вокзал, станція|вокзал, станция
near|nɪə|поруч, близько|рядом, близко
far|fɑː|далеко|далеко
# general_A1_4 Food and drinks
bread|bred|хліб|хлеб
water|ˈwɔːtə|вода|вода
milk|mɪlk|молоко|молоко
cheese|tʃiːz|сир|сыр
chicken|ˈtʃɪkɪn|курка|курица
vegetables|ˈvedʒtəblz|овочі|овощи
fruit|fruːt|фрукти|фрукты
tasty|ˈteɪsti|смачний|вкусный
hungry|ˈhʌŋɡri|голодний|голодный
cook|kʊk|готувати|готовить
# general_A2_1 Work and jobs
job|dʒɒb|робота, посада|работа, должность
salary|ˈsæləri|зарплата|зарплата
colleague|ˈkɒliːɡ|колега|коллега
boss|bɒs|начальник|начальник
office|ˈɒfɪs|офіс|офис
experience|ɪkˈspɪəriəns|досвід|опыт
skill|skɪl|навичка|навык
interview|ˈɪntəvjuː|співбесіда|собеседование
apply|əˈplaɪ|подавати заявку|подавать заявку
responsible|rɪˈspɒnsəbl|відповідальний|ответственный
# general_A2_2 Travel
journey|ˈdʒɜːni|подорож, поїздка|путешествие, поездка
ticket|ˈtɪkɪt|квиток|билет
luggage|ˈlʌɡɪdʒ|багаж|багаж
passport|ˈpɑːspɔːt|паспорт|паспорт
abroad|əˈbrɔːd|за кордоном|за границей
sightseeing|ˈsaɪtsiːɪŋ|огляд пам'яток|осмотр достопримечательностей
book|bʊk|бронювати|бронировать
delay|dɪˈleɪ|затримка|задержка
destination|ˌdestɪˈneɪʃn|пункт призначення|пункт назначения
souvenir|ˌsuːvəˈnɪə|сувенір|сувенир
# general_A2_3 Health
health|helθ|здоров'я|здоровье
doctor|ˈdɒktə|лікар|врач
medicine|ˈmedsn|ліки|лекарство
headache|ˈhedeɪk|головний біль|головная боль
cold|kəʊld|застуда|простуда
pain|peɪn|біль|боль
healthy|ˈhelθi|здоровий|здоровый
exercise|ˈeksəsaɪz|фізичні вправи|физические упражнения
rest|rest|відпочинок|отдых
recover|rɪˈkʌvə|одужувати|выздоравливать
# general_A2_4 Shopping and money
price|praɪs|ціна|цена
cheap|tʃiːp|дешевий|дешёвый
expensive|ɪkˈspensɪv|дорогий|дорогой
discount|ˈdɪskaʊnt|знижка|скидка
receipt|rɪˈsiːt|чек|чек
cash|kæʃ|готівка|наличные
size|saɪz|розмір|размер
try on|traɪ ɒn|приміряти|примерять
return|rɪˈtɜːn|повертати|возвращать
afford|əˈfɔːd|дозволити собі|позволить себе
# general_B1_1 Opinions and communication
opinion|əˈpɪnjən|думка|мнение
agree|əˈɡriː|погоджуватися|соглашаться
disagree|ˌdɪsəˈɡriː|не погоджуватися|не соглашаться
argue|ˈɑːɡjuː|сперечатися|спорить
convince|kənˈvɪns|переконувати|убеждать
suggest|səˈdʒest|пропонувати|предлагать
point of view|pɔɪnt əv vjuː|точка зору|точка зрения
obviously|ˈɒbviəsli|очевидно|очевидно
however|haʊˈevə|однак|однако
in my view|ɪn maɪ vjuː|на мій погляд|на мой взгляд
# general_B1_2 Environment and society
environment|ɪnˈvaɪrənmənt|довкілля|окружающая среда
pollution|pəˈluːʃn|забруднення|загрязнение
recycle|ˌriːˈsaɪkl|переробляти|перерабатывать
waste|weɪst|відходи; марнувати|отходы; тратить впустую
climate|ˈklaɪmət|клімат|климат
society|səˈsaɪəti|суспільство|общество
government|ˈɡʌvənmənt|уряд|правительство
issue|ˈɪʃuː|проблема, питання|проблема, вопрос
improve|ɪmˈpruːv|покращувати|улучшать
reduce|rɪˈdjuːs|зменшувати|уменьшать
# it_A1_1 Computer basics
computer|kəmˈpjuːtə|комп'ютер|компьютер
keyboard|ˈkiːbɔːd|клавіатура|клавиатура
screen|skriːn|екран|экран
file|faɪl|файл|файл
folder|ˈfəʊldə|папка|папка
save|seɪv|зберігати|сохранять
delete|dɪˈliːt|видаляти|удалять
download|ˌdaʊnˈləʊd|завантажувати|скачивать
password|ˈpɑːswɜːd|пароль|пароль
update|ˌʌpˈdeɪt|оновлення; оновлювати|обновление; обновлять
# it_A1_2 Internet
website|ˈwebsaɪt|вебсайт|веб-сайт
link|lɪŋk|посилання|ссылка
browser|ˈbraʊzə|браузер|браузер
search|sɜːtʃ|шукати; пошук|искать; поиск
account|əˈkaʊnt|обліковий запис|учётная запись
log in|lɒɡ ɪn|увійти в систему|войти в систему
email|ˈiːmeɪl|електронна пошта|электронная почта
app|æp|застосунок|приложение
network|ˈnetwɜːk|мережа|сеть
connection|kəˈnekʃn|з'єднання|соединение
# it_A2_1 Software development
code|kəʊd|код|код
developer|dɪˈveləpə|розробник|разработчик
bug|bʌɡ|помилка в програмі|баг, ошибка
fix|fɪks|виправляти|исправлять
feature|ˈfiːtʃə|функція, фіча|функция, фича
release|rɪˈliːs|реліз, випуск|релиз, выпуск
database|ˈdeɪtəbeɪs|база даних|база данных
server|ˈsɜːvə|сервер|сервер
deploy|dɪˈplɔɪ|розгортати|развёртывать
requirement|rɪˈkwaɪəmənt|вимога|требование
# it_A2_2 Teamwork and Agile
team|tiːm|команда|команда
task|tɑːsk|завдання|задача
deadline|ˈdedlaɪn|дедлайн, кінцевий термін|дедлайн, крайний срок
estimate|ˈestɪmeɪt|оцінювати; оцінка|оценивать; оценка
sprint|sprɪnt|спринт|спринт
stand-up|ˈstænd ʌp|щоденна коротка зустріч|ежедневная короткая встреча
priority|praɪˈɒrəti|пріоритет|приоритет
blocker|ˈblɒkə|перешкода, блокер|препятствие, блокер
assign|əˈsaɪn|призначати|назначать
progress|ˈprəʊɡres|прогрес|прогресс
# it_B1_1 Architecture and integration
integration|ˌɪntɪˈɡreɪʃn|інтеграція|интеграция
request|rɪˈkwest|запит|запрос
response|rɪˈspɒns|відповідь|ответ
queue|kjuː|черга|очередь
endpoint|ˈendpɔɪnt|кінцева точка API|конечная точка API
scalable|ˈskeɪləbl|масштабований|масштабируемый
reliable|rɪˈlaɪəbl|надійний|надёжный
latency|ˈleɪtənsi|затримка|задержка
dependency|dɪˈpendənsi|залежність|зависимость
approach|əˈprəʊtʃ|підхід|подход
# it_B1_2 Testing and support
test|test|тестувати; тест|тестировать; тест
environment|ɪnˈvaɪrənmənt|середовище|окружение, среда
issue|ˈɪʃuː|проблема, задача|проблема, задача
reproduce|ˌriːprəˈdjuːs|відтворювати|воспроизводить
expected|ɪkˈspektɪd|очікуваний|ожидаемый
actual|ˈæktʃuəl|фактичний|фактический
investigate|ɪnˈvestɪɡeɪt|досліджувати|расследовать, изучать
root cause|ruːt kɔːz|першопричина|первопричина
workaround|ˈwɜːkəraʊnd|обхідне рішення|обходное решение
rollback|ˈrəʊlbæk|відкат|откат
# travel_A1_1 At the airport
airport|ˈeəpɔːt|аеропорт|аэропорт
flight|flaɪt|рейс, політ|рейс, полёт
boarding pass|ˈbɔːdɪŋ pɑːs|посадковий талон|посадочный талон
gate|ɡeɪt|вихід на посадку|выход на посадку
check in|tʃek ɪn|реєструватися|регистрироваться
suitcase|ˈsuːtkeɪs|валіза|чемодан
departure|dɪˈpɑːtʃə|відправлення|отправление
arrival|əˈraɪvl|прибуття|прибытие
seat|siːt|місце|место
window|ˈwɪndəʊ|вікно|окно
# travel_A1_2 At the hotel
hotel|həʊˈtel|готель|отель
room|ruːm|номер, кімната|номер, комната
key|kiː|ключ|ключ
reception|rɪˈsepʃn|рецепція|ресепшн
reservation|ˌrezəˈveɪʃn|бронювання|бронирование
single room|ˈsɪŋɡl ruːm|одномісний номер|одноместный номер
towel|ˈtaʊəl|рушник|полотенце
floor|flɔː|поверх; підлога|этаж; пол
lift|lɪft|ліфт|лифт
stay|steɪ|зупинятися, перебувати|останавливаться, пребывать
# travel_A2_1 In the city
map|mæp|мапа|карта
turn left|tɜːn left|повернути ліворуч|повернуть налево
straight on|streɪt ɒn|прямо|прямо
corner|ˈkɔːnə|ріг, кут|угол
crossroads|ˈkrɒsrəʊdz|перехрестя|перекрёсток
museum|mjuˈziːəm|музей|музей
square|skweə|площа|площадь
bridge|brɪdʒ|міст|мост
lost|lɒst|загублений; заблукати|потерянный; заблудиться
downtown|ˌdaʊnˈtaʊn|центр міста|центр города
# business_A1_1 Office
desk|desk|робочий стіл|рабочий стол
meeting|ˈmiːtɪŋ|зустріч, нарада|встреча, совещание
manager|ˈmænɪdʒə|менеджер|менеджер
company|ˈkʌmpəni|компанія|компания
client|ˈklaɪənt|клієнт|клиент
phone call|fəʊn kɔːl|телефонний дзвінок|телефонный звонок
schedule|ˈʃedjuːl|розклад|расписание
document|ˈdɒkjumənt|документ|документ
busy|ˈbɪzi|зайнятий|занятой
day off|deɪ ɒf|вихідний|выходной
# business_A2_1 Meetings
agenda|əˈdʒendə|порядок денний|повестка дня
discuss|dɪˈskʌs|обговорювати|обсуждать
decision|dɪˈsɪʒn|рішення|решение
attend|əˈtend|відвідувати, бути присутнім|посещать, присутствовать
postpone|pəˈspəʊn|відкладати|откладывать
summary|ˈsʌməri|підсумок|резюме, итог
follow up|ˈfɒləʊ ʌp|подальші дії; нагадати|последующие действия; напомнить
participant|pɑːˈtɪsɪpənt|учасник|участник
presentation|ˌpreznˈteɪʃn|презентація|презентация
feedback|ˈfiːdbæk|зворотний зв'язок|обратная связь
# business_B1_1 Sales and negotiations
negotiate|nɪˈɡəʊʃieɪt|вести переговори|вести переговоры
offer|ˈɒfə|пропозиція; пропонувати|предложение; предлагать
deal|diːl|угода|сделка
contract|ˈkɒntrækt|контракт|контракт
supplier|səˈplaɪə|постачальник|поставщик
revenue|ˈrevənjuː|дохід, виручка|доход, выручка
profit|ˈprɒfɪt|прибуток|прибыль
competitor|kəmˈpetɪtə|конкурент|конкурент
terms|tɜːmz|умови|условия
compromise|ˈkɒmprəmaɪz|компроміс|компромисс
`;

window.WORD_LESSONS = {};
(function () {
  var cur = null;
  window.WORDS_RAW.trim().split('\n').forEach(function (l) {
    if (l.charAt(0) === '#') {
      var m = l.slice(2).split(' ');
      cur = m[0];
      window.WORD_LESSONS[cur] = { title: m.slice(1).join(' '), words: [] };
    } else if (cur) {
      var p = l.split('|');
      window.WORD_LESSONS[cur].words.push({ w: p[0], ipa: p[1], uk: p[2], ru: p[3] });
    }
  });
})();

window.TRACKS = [
  { id: 'general', icon: '🌍', uk: 'Загальна англійська', ru: 'Общий английский' },
  { id: 'it', icon: '💻', uk: 'IT', ru: 'IT' },
  { id: 'travel', icon: '✈️', uk: 'Подорожі', ru: 'Путешествия' },
  { id: 'business', icon: '💼', uk: 'Бізнес', ru: 'Бизнес' }
];
