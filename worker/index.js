/**
 * EnglishUp — Cloudflare Worker
 *  - роздає статику Mini App (папка public через [assets])
 *  - POST /api/ai   — Claude API (розмова, граматика, перевірка перекладу/есе, генерація слів)
 *  - POST /api/stt  — розпізнавання голосу (Workers AI Whisper)
 *  - POST /api/tts  — озвучка, коли в WebView немає speechSynthesis (Workers AI MeloTTS)
 *  - POST /webhook  — бот: /start з кнопкою відкриття Mini App
 *  - GET  /setup?key=WEBHOOK_SECRET — реєструє webhook і кнопку меню
 *
 * Secrets: BOT_TOKEN, WEBHOOK_SECRET, ANTHROPIC_API_KEY (опційно: без нього працює безкоштовний Workers AI)
 * Vars:    MODEL (Claude), CF_MODEL (Workers AI), APP_URL, DAILY_AI_LIMIT, DEV_MODE
 * Bindings: AI (Workers AI), LIMITS (KV, опційно — для денного ліміту)
 */

const LEVEL_NAMES = { A1: 'A1 Beginner', A2: 'A2 Pre-Intermediate', B1: 'B1 Intermediate', B2: 'B2 Upper-Intermediate', C1: 'C1 Advanced', C2: 'C2 Proficiency' };
const LANG_NAMES = { uk: 'Ukrainian', ru: 'Russian' };
const TRACKS = { general: 'general everyday English', it: 'IT / software development', travel: 'travel', business: 'business and office' };
const SCENARIOS = {
  job: 'The user tells you about their job. Ask friendly follow-up questions about their role, tasks, team, a typical day, what they like and what is hard.',
  interview: 'You are an HR interviewer at an international company. Run a realistic job interview: one question at a time (experience, strengths, a difficult situation, motivation, salary expectations).',
  standup: 'You are a team lead running a daily stand-up. Ask what the user did yesterday, what they plan today and whether they have blockers. Then discuss details.',
  airport: 'You are an airline check-in agent, then a passport control officer. Role-play realistic airport situations.',
  restaurant: 'You are a waiter in a restaurant. Greet the user, take the order, answer questions about the menu, bring the bill.',
  smalltalk: 'You are a friendly colleague at a coffee break. Make small talk: weekend, weather, hobbies, plans.',
  free: 'Free conversation. Ask the user what they want to talk about and keep the conversation going with interesting questions.'
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    try {
      if (request.method === 'OPTIONS') return cors(new Response(null, { status: 204 }));
      if (url.pathname === '/api/ai' && request.method === 'POST') return cors(await handleAI(request, env));
      if (url.pathname === '/api/stt' && request.method === 'POST') return cors(await handleSTT(request, env));
      if (url.pathname === '/api/tts' && request.method === 'POST') return cors(await handleTTS(request, env));
      if (url.pathname === '/api/donate' && request.method === 'POST') return cors(await handleDonate(request, env));
      if (url.pathname === '/api/ping' && request.method === 'POST') return cors(await handlePing(request, env));
      if (url.pathname === '/api/admin/stats' && request.method === 'POST') return cors(await handleAdminStats(request, env));
      if (url.pathname === '/webhook' && request.method === 'POST') return await handleWebhook(request, env);
      if (url.pathname === '/setup') return await handleSetup(url, env);
      if (url.pathname === '/health') return json({ ok: true });
      if (env.ASSETS) return env.ASSETS.fetch(request);
      return new Response('Not found', { status: 404 });
    } catch (e) {
      console.error(e);
      return cors(json({ error: e.message || 'Server error' }, e.status || 500));
    }
  }
};

// ---------------- helpers ----------------
function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
function cors(res) {
  const h = new Headers(res.headers);
  h.set('Access-Control-Allow-Origin', '*');
  h.set('Access-Control-Allow-Headers', 'Content-Type, X-Init-Data');
  h.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  return new Response(res.body, { status: res.status, headers: h });
}
function httpError(msg, status) { const e = new Error(msg); e.status = status; return e; }
const enc = new TextEncoder();
async function hmac(key, data) {
  const k = await crypto.subtle.importKey('raw', typeof key === 'string' ? enc.encode(key) : key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', k, enc.encode(data)));
}
const hex = (buf) => [...buf].map((b) => b.toString(16).padStart(2, '0')).join('');

// Перевірка підпису Telegram initData (https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app)
async function auth(request, env) {
  const initData = request.headers.get('X-Init-Data') || '';
  if (!initData) {
    if (env.DEV_MODE === '1') return { id: 'dev', user: { id: 'dev', first_name: 'Dev' } };
    throw httpError('Open the app from Telegram', 401);
  }
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  params.delete('hash');
  const dcs = [...params.entries()].map(([k, v]) => `${k}=${v}`).sort().join('\n');
  const secret = await hmac('WebAppData', env.BOT_TOKEN);
  const check = hex(await hmac(secret, dcs));
  if (check !== hash) throw httpError('Bad signature', 401);
  const authDate = parseInt(params.get('auth_date') || '0', 10);
  if (Date.now() / 1000 - authDate > 86400 * 7) throw httpError('Session expired, reopen the app', 401);
  const user = JSON.parse(params.get('user') || '{}');
  return { id: String(user.id || 'unknown'), user };
}

async function rateLimit(env, uid) {
  if (!env.LIMITS) return;
  const limit = parseInt(env.DAILY_AI_LIMIT || '150', 10);
  const key = `rl:${uid}:${new Date().toISOString().slice(0, 10)}`;
  const n = parseInt((await env.LIMITS.get(key)) || '0', 10);
  if (n >= limit) throw httpError('Daily AI limit reached. Try again tomorrow.', 429);
  await env.LIMITS.put(key, String(n + 1), { expirationTtl: 90000 });
}

// Якщо задано ANTHROPIC_API_KEY — Claude, інакше безкоштовний Workers AI
async function llm(env, system, messages, maxTokens = 900) {
  if (env.ANTHROPIC_API_KEY) return claude(env, system, messages, maxTokens);
  return workersAI(env, system, messages, maxTokens);
}
const CF_MODELS = ['@cf/meta/llama-3.3-70b-instruct-fp8-fast', '@cf/meta/llama-3.1-8b-instruct-fast'];
async function workersAI(env, system, messages, maxTokens) {
  if (!env.AI) throw httpError('Workers AI binding "AI" is not configured', 500);
  const models = env.CF_MODEL ? [env.CF_MODEL].concat(CF_MODELS) : CF_MODELS;
  let lastErr;
  for (const model of models) {
    try {
      const res = await env.AI.run(model, { messages: [{ role: 'system', content: system }].concat(messages), max_tokens: maxTokens, temperature: 0.4 });
      const out = res && res.response;
      if (out == null) throw new Error('empty response');
      return typeof out === 'string' ? out.trim() : JSON.stringify(out);
    } catch (e) { lastErr = e; console.error('Workers AI', model, e.message); }
  }
  throw httpError('AI error: ' + (lastErr && lastErr.message), 502);
}
async function claude(env, system, messages, maxTokens = 900) {
  if (!env.ANTHROPIC_API_KEY) throw httpError('ANTHROPIC_API_KEY is not set', 500);
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: env.MODEL || 'claude-haiku-4-5', max_tokens: maxTokens, system, messages })
  });
  const j = await r.json();
  if (!r.ok) throw httpError('Claude API: ' + ((j.error && j.error.message) || r.status), 502);
  return (j.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('').trim();
}
function parseJSON(text) {
  text = String(text || '');
  const s = text.replace(/```(?:json)?/g, '');
  const a = s.indexOf('{'), b = s.lastIndexOf('}');
  const a2 = s.indexOf('['), b2 = s.lastIndexOf(']');
  let chunk = a >= 0 && (a2 < 0 || a < a2) ? s.slice(a, b + 1) : s.slice(a2, b2 + 1);
  try { return JSON.parse(chunk); } catch (e) { throw httpError('AI returned invalid JSON', 502); }
}
const clip = (s, n) => String(s || '').slice(0, n);
function cleanHistory(h, maxItems = 20) {
  const out = (Array.isArray(h) ? h : []).slice(-maxItems)
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && m.content)
    .map((m) => ({ role: m.role, content: clip(m.content, 1500) }));
  // Claude вимагає, щоб перше повідомлення було від user
  if (out.length && out[0].role !== 'user') out.unshift({ role: 'user', content: '(Start the conversation.)' });
  return fixAlternation(out);
}

// ---------------- /api/ai ----------------
async function handleAI(request, env) {
  const user = await auth(request, env);
  const body = await request.json();
  await rateLimit(env, user.id);
  await bumpUsage(env, 'ai_' + String(body.mode || '').slice(0, 20));
  const lang = LANG_NAMES[body.lang] || 'Ukrainian';
  const level = LEVEL_NAMES[body.level] || 'A2 Pre-Intermediate';
  const track = TRACKS[body.track] || TRACKS.general;

  switch (body.mode) {
    case 'chat': {
      const scen = SCENARIOS[body.scenario] || SCENARIOS.free;
      const system = `You are a friendly English conversation partner in a language-learning app. Student level: ${level}. Student's native language: ${lang}. Learning focus: ${track}.
Scenario: ${scen}
Rules:
- Speak only English in "reply". Match the student's level: short sentences and simple words for A1-A2, richer language for B2+.
- Keep "reply" to 1-3 sentences and usually end with ONE question to keep the dialog going.
- If the student's last message has grammar/vocabulary mistakes, put the corrected version in "better" and a very short explanation in ${lang} in "correction". If it's correct or there is no student message yet, set "better" and "correction" to "".
- "tr" = translation of your reply into ${lang}.
Return ONLY JSON: {"reply":"...","tr":"...","better":"...","correction":"..."}`;
      let messages = cleanHistory(body.history);
      if (!messages.length) messages = [{ role: 'user', content: '(Start the conversation. Greet me and ask the first question.)' }];
      return json(parseJSON(await llm(env, system, messages, 350)));
    }
    case 'grammar_qa': {
      const system = `You are an experienced English grammar teacher. Answer the student's question in ${lang}. Student level: ${level}.
Be short and clear: a rule in 1-3 sentences, a formula if relevant, 2-4 English examples with ${lang} translation, and a typical mistake. Use simple markdown (**bold**, lists). If the question is not about English, politely bring it back to English learning.`;
      const messages = cleanHistory(body.history, 6);
      messages.push({ role: 'user', content: clip(body.question, 1000) });
      return json({ answer: await llm(env, system, fixAlternation(messages), 900) });
    }
    case 'check_translation': {
      const dirText = body.direction === 'to_en' ? `from ${lang} into English` : `from English into ${lang}`;
      const system = `You check a language learner's translation ${dirText}. Level: ${level}. Accept any natural, grammatically correct translation that keeps the meaning, even if it differs from the reference. Ignore punctuation and capitalization.
Return ONLY JSON: {"correct":true|false,"score":0-100,"corrected":"best corrected version of the student's translation in the target language","explanation":"1-2 short sentences in ${lang}: what is wrong or why it's good"}`;
      const msg = `Source: ${clip(body.source, 500)}\nReference: ${clip(body.reference, 500)}\nStudent: ${clip(body.answer, 500)}`;
      return json(parseJSON(await llm(env, system, [{ role: 'user', content: msg }], 400)));
    }
    case 'check_essay': {
      const system = `You are an English teacher checking a student's essay. Expected level: ${level}. Write explanations in ${lang}.
Return ONLY JSON:
{"score":0-100,"level":"estimated CEFR level like B1","summary":"2-3 sentences in ${lang}: overall impression, structure, vocabulary, relevance to the topic","mistakes":[{"orig":"wrong fragment","fix":"corrected fragment","why":"short reason in ${lang}"}],"corrected":"the full corrected essay in English","tips":["2-4 short tips in ${lang}"]}
List up to 12 most important mistakes.`;
      const msg = `Topic: ${clip(body.topic, 200)}\n\nEssay:\n${clip(body.text, 6000)}`;
      return json(parseJSON(await llm(env, system, [{ role: 'user', content: msg }], 2500)));
    }
    case 'lesson_words': {
      const count = Math.min(15, Math.max(10, parseInt(body.count, 10) || 12));
      const exclude = (Array.isArray(body.exclude) ? body.exclude : []).slice(-250).map((w) => clip(w, 40)).join(', ');
      const system = `You create vocabulary lessons for an English learning app.
Return ONLY JSON: {"title":"short English topic name","words":[{"w":"English word or short phrase","ipa":"British IPA without slashes","uk":"Ukrainian translation","ru":"Russian translation"}]}`;
      const msg = `Create lesson #${parseInt(body.lesson, 10) || 1} for level ${level}, focus: ${track}. Pick one coherent topic suitable for this lesson number (later lessons = more advanced topics). Give exactly ${count} useful words/phrases of this level.
Do NOT use these words: ${exclude || '-'}`;
      return json(parseJSON(await llm(env, system, [{ role: 'user', content: msg }], 1500)));
    }
    case 'word_info': {
      const system = `You are an English-Ukrainian-Russian dictionary. Return ONLY JSON: {"w":"the English word/phrase (fix spelling if needed)","ipa":"British IPA without slashes","uk":"1-3 main Ukrainian translations","ru":"1-3 main Russian translations"}. If the input is in Ukrainian or Russian, translate it to English and fill "w" with the English word.`;
      return json(parseJSON(await llm(env, system, [{ role: 'user', content: clip(body.word, 80) }], 200)));
    }
    default:
      throw httpError('Unknown mode', 400);
  }
}
function fixAlternation(msgs) { // зливає підряд однакові ролі
  const out = [];
  for (const m of msgs) {
    if (out.length && out[out.length - 1].role === m.role) out[out.length - 1].content += '\n' + m.content;
    else out.push({ ...m });
  }
  return out;
}

// ---------------- /api/stt ----------------
async function handleSTT(request, env) {
  const user = await auth(request, env);
  await rateLimit(env, user.id);
  await bumpUsage(env, 'stt');
  if (!env.AI) throw httpError('Workers AI binding "AI" is not configured', 500);
  const buf = await request.arrayBuffer();
  if (buf.byteLength > 8 * 1024 * 1024) throw httpError('Audio too long', 413);
  const audio = [...new Uint8Array(buf)];
  let res = null;
  // спершу швидка англійська модель, якщо вона не впоралась — повна Whisper
  try { res = await env.AI.run('@cf/openai/whisper-tiny-en', { audio }); } catch (e) { console.error('whisper-tiny-en', e.message); }
  if (!res || !res.text || !res.text.trim()) res = await env.AI.run('@cf/openai/whisper', { audio });
  return json({ text: (res && res.text) || '' });
}

// ---------------- /api/tts ----------------
async function handleTTS(request, env) {
  await auth(request, env);
  if (!env.AI) throw httpError('Workers AI binding "AI" is not configured', 500);
  const { text } = await request.json();
  const res = await env.AI.run('@cf/myshell-ai/melotts', { prompt: clip(text, 400), lang: 'en' });
  const b64 = res && (res.audio || res);
  if (typeof b64 !== 'string') return new Response(res, { headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'public, max-age=604800' } });
  const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return new Response(bin, { headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'public, max-age=604800' } });
}

// ---------------- Статистика (D1) ----------------
let schemaReady = false;
async function ensureSchema(env) {
  if (schemaReady || !env.DB) return;
  await env.DB.batch([
    env.DB.prepare('CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, first_name TEXT, username TEXT, tg_lang TEXT, lang TEXT, cefr TEXT, track TEXT, xp INTEGER DEFAULT 0, lessons INTEGER DEFAULT 0, words INTEGER DEFAULT 0, streak INTEGER DEFAULT 0, donated INTEGER DEFAULT 0, opens INTEGER DEFAULT 0, first_seen INTEGER, last_seen INTEGER)'),
    env.DB.prepare('CREATE TABLE IF NOT EXISTS activity (user_id TEXT, day TEXT, PRIMARY KEY (user_id, day))'),
    env.DB.prepare('CREATE TABLE IF NOT EXISTS donations (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT, name TEXT, username TEXT, amount INTEGER, charge_id TEXT, ts INTEGER)'),
    env.DB.prepare('CREATE TABLE IF NOT EXISTS usage (day TEXT, kind TEXT, n INTEGER DEFAULT 0, PRIMARY KEY (day, kind))')
  ]);
  schemaReady = true;
}
const dayStr = (ms) => new Date(ms === undefined ? Date.now() : ms).toISOString().slice(0, 10);
async function bumpUsage(env, kind) {
  if (!env.DB) return;
  try {
    await ensureSchema(env);
    await env.DB.prepare('INSERT INTO usage (day, kind, n) VALUES (?1, ?2, 1) ON CONFLICT(day, kind) DO UPDATE SET n = n + 1').bind(dayStr(), kind).run();
  } catch (e) { console.error('usage', e.message); }
}
async function recordDonation(env, f, p) {
  if (!env.DB) return;
  try {
    await ensureSchema(env);
    const name = [f.first_name, f.last_name].filter(Boolean).join(' ');
    await env.DB.batch([
      env.DB.prepare('INSERT INTO donations (user_id, name, username, amount, charge_id, ts) VALUES (?1, ?2, ?3, ?4, ?5, ?6)').bind(String(f.id), name, f.username || '', p.total_amount, p.telegram_payment_charge_id || '', Date.now()),
      env.DB.prepare('UPDATE users SET donated = donated + ?2 WHERE id = ?1').bind(String(f.id), p.total_amount)
    ]);
  } catch (e) { console.error('donation', e.message); }
}
const isAdmin = (env, user) => !!env.ADMIN_ID && String(user.id) === String(env.ADMIN_ID);

// Відкриття застосунку / завершення уроку: оновлюємо профіль і денну активність
async function handlePing(request, env) {
  const a = await auth(request, env);
  const b = await request.json().catch(() => ({}));
  if (env.DB) {
    try {
      await ensureSchema(env);
      const u = a.user || {}, now = Date.now(), num = (x) => Math.max(0, Math.floor(Number(x) || 0));
      await env.DB.batch([
        env.DB.prepare(`INSERT INTO users (id, first_name, username, tg_lang, lang, cefr, track, xp, lessons, words, streak, opens, first_seen, last_seen)
          VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?13)
          ON CONFLICT(id) DO UPDATE SET first_name = excluded.first_name, username = excluded.username, tg_lang = excluded.tg_lang, lang = excluded.lang,
            cefr = excluded.cefr, track = excluded.track, xp = excluded.xp, lessons = excluded.lessons, words = excluded.words, streak = excluded.streak,
            opens = users.opens + excluded.opens, last_seen = excluded.last_seen`)
          .bind(a.id, clip(u.first_name, 64), clip(u.username, 64), clip(u.language_code, 8), clip(b.lang, 4), clip(b.cefr, 4), clip(b.track, 16),
            num(b.xp), num(b.lessons), num(b.words), num(b.streak), b.open ? 1 : 0, now),
        env.DB.prepare('INSERT OR IGNORE INTO activity (user_id, day) VALUES (?1, ?2)').bind(a.id, dayStr(now))
      ]);
    } catch (e) { console.error('ping', e.message); }
  }
  return json({ ok: true, admin: isAdmin(env, a) });
}

// Статистика: доступна лише ADMIN_ID
async function handleAdminStats(request, env) {
  const a = await auth(request, env);
  if (!isAdmin(env, a)) throw httpError('Forbidden', 403);
  if (!env.DB) throw httpError('D1 binding "DB" is not configured', 500);
  await ensureSchema(env);
  const DAY = 86400000, now = Date.now(), today = dayStr(now);
  const d7 = dayStr(now - 6 * DAY), d14 = dayStr(now - 13 * DAY), d30 = dayStr(now - 29 * DAY);
  const q = (sql, ...args) => env.DB.prepare(sql).bind(...args);
  const r = await env.DB.batch([
    q('SELECT COUNT(*) AS n FROM users'),
    q('SELECT COUNT(*) AS n FROM users WHERE first_seen >= ?1', now - DAY),
    q('SELECT COUNT(*) AS n FROM users WHERE first_seen >= ?1', now - 7 * DAY),
    q('SELECT COUNT(*) AS n FROM users WHERE first_seen >= ?1', now - 30 * DAY),
    q('SELECT COUNT(*) AS n FROM activity WHERE day = ?1', today),
    q('SELECT COUNT(DISTINCT user_id) AS n FROM activity WHERE day >= ?1', d7),
    q('SELECT COUNT(DISTINCT user_id) AS n FROM activity WHERE day >= ?1', d30),
    q('SELECT day, COUNT(*) AS n FROM activity WHERE day >= ?1 GROUP BY day ORDER BY day', d14),
    q("SELECT strftime('%Y-%m-%d', first_seen / 1000, 'unixepoch') AS day, COUNT(*) AS n FROM users WHERE first_seen >= ?1 GROUP BY day ORDER BY day", now - 14 * DAY),
    q('SELECT COALESCE(SUM(lessons),0) AS lessons, COALESCE(SUM(words),0) AS words, COALESCE(ROUND(AVG(xp)),0) AS avg_xp, COALESCE(SUM(opens),0) AS opens FROM users'),
    q("SELECT COALESCE(cefr,'?') AS k, COUNT(*) AS n FROM users GROUP BY k ORDER BY k"),
    q("SELECT COALESCE(lang,'?') AS k, COUNT(*) AS n FROM users GROUP BY k ORDER BY n DESC"),
    q("SELECT COALESCE(track,'?') AS k, COUNT(*) AS n FROM users GROUP BY k ORDER BY n DESC"),
    q('SELECT COUNT(*) AS n, COALESCE(SUM(amount),0) AS sum, COUNT(DISTINCT user_id) AS donors FROM donations'),
    q('SELECT COUNT(*) AS n, COALESCE(SUM(amount),0) AS sum FROM donations WHERE ts >= ?1', now - 30 * DAY),
    q('SELECT name, username, amount, ts FROM donations ORDER BY ts DESC LIMIT 10'),
    q('SELECT first_name, username, cefr, xp, lessons, streak, donated, last_seen FROM users ORDER BY xp DESC LIMIT 10'),
    q('SELECT first_name, username, cefr, first_seen FROM users ORDER BY first_seen DESC LIMIT 10'),
    q('SELECT kind, n FROM usage WHERE day = ?1 ORDER BY n DESC', today),
    q('SELECT kind, SUM(n) AS n FROM usage WHERE day >= ?1 GROUP BY kind ORDER BY n DESC', d30)
  ]);
  const rows = (i) => r[i].results || [], one = (i) => rows(i)[0] || {};
  return json({
    users: { total: one(0).n, new1: one(1).n, new7: one(2).n, new30: one(3).n },
    active: { dau: one(4).n, wau: one(5).n, mau: one(6).n, byDay: rows(7), newByDay: rows(8) },
    learning: one(9),
    split: { cefr: rows(10), lang: rows(11), track: rows(12) },
    donations: { all: one(13), d30: one(14), recent: rows(15) },
    topUsers: rows(16), newUsers: rows(17),
    usage: { today: rows(18), d30: rows(19) },
    generated: now
  });
}

// ---------------- /api/donate (Telegram Stars) ----------------
async function handleDonate(request, env) {
  const user = await auth(request, env);
  const body = await request.json();
  const n = Math.floor(Number(body.amount));
  if (!(n >= 1 && n <= 10000)) throw httpError('Amount must be 1-10000 Stars', 400);
  const ru = body.lang === 'ru';
  const r = await tgApi(env, 'createInvoiceLink', {
    title: ru ? 'Поддержать EnglishUp' : 'Підтримати EnglishUp',
    description: ru ? `Благодарность автору: ${n} ⭐. Спасибо, что помогаешь развивать приложение!` : `Подяка автору: ${n} ⭐. Дякую, що допомагаєш розвивати застосунок!`,
    payload: `donate:${user.id}:${n}:${Date.now()}`,
    currency: 'XTR',
    prices: [{ label: ru ? 'Донат' : 'Донат', amount: n }]
  });
  if (!r.ok) throw httpError('Telegram: ' + (r.description || 'invoice error'), 502);
  return json({ link: r.result });
}

// ---------------- Telegram bot ----------------
async function tgApi(env, method, payload) {
  const r = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload)
  });
  return r.json();
}
async function handleWebhook(request, env) {
  if (env.WEBHOOK_SECRET && request.headers.get('X-Telegram-Bot-Api-Secret-Token') !== env.WEBHOOK_SECRET) return new Response('forbidden', { status: 403 });
  const update = await request.json();
  // Оплата Stars: Telegram чекає підтвердження протягом 10 секунд
  if (update.pre_checkout_query) {
    await tgApi(env, 'answerPreCheckoutQuery', { pre_checkout_query_id: update.pre_checkout_query.id, ok: true });
    return new Response('ok');
  }
  const msg = update.message;
  if (msg && msg.successful_payment) {
    const p = msg.successful_payment, f = msg.from || {};
    await recordDonation(env, f, p);
    const ruP = f.language_code === 'ru';
    await tgApi(env, 'sendMessage', { chat_id: msg.chat.id, text: ruP ? `💛 Спасибо за поддержку! Получено ${p.total_amount} ⭐` : `💛 Дякую за підтримку! Отримано ${p.total_amount} ⭐` });
    if (env.ADMIN_ID) {
      const who = [f.first_name, f.last_name].filter(Boolean).join(' ') + (f.username ? ` (@${f.username})` : '') + `, id ${f.id}`;
      await tgApi(env, 'sendMessage', { chat_id: env.ADMIN_ID, text: `⭐ Донат ${p.total_amount} Stars від ${who}\ncharge: ${p.telegram_payment_charge_id}` });
    }
    return new Response('ok');
  }
  if (msg && msg.text && msg.text.startsWith('/paysupport')) {
    const ruS = (msg.from && msg.from.language_code) === 'ru';
    await tgApi(env, 'sendMessage', { chat_id: msg.chat.id, text: ruS ? 'Донаты добровольные. Если возникла проблема с оплатой, опиши её ответным сообщением, автор свяжется с тобой.' : 'Донати добровільні. Якщо виникла проблема з оплатою, опиши її у відповідь, автор зв\'яжеться з тобою.' });
    if (env.ADMIN_ID) await tgApi(env, 'sendMessage', { chat_id: env.ADMIN_ID, text: `🆘 /paysupport від id ${msg.from && msg.from.id} (@${(msg.from && msg.from.username) || '-'})` });
    return new Response('ok');
  }
  if (msg && msg.text && msg.text.startsWith('/start')) {
    const ru = (msg.from && msg.from.language_code) === 'ru';
    await tgApi(env, 'sendMessage', {
      chat_id: msg.chat.id,
      text: ru
        ? '👋 Привет! Это EnglishUp — уроки, грамматика, словарь, карточки и разговор с ИИ.\nНажми кнопку, чтобы начать.'
        : '👋 Привіт! Це EnglishUp — уроки, граматика, словник, картки і розмова з ІІ.\nНатисни кнопку, щоб почати.',
      reply_markup: { inline_keyboard: [[{ text: ru ? '🚀 Открыть EnglishUp' : '🚀 Відкрити EnglishUp', web_app: { url: env.APP_URL } }]] }
    });
  }
  return new Response('ok');
}
async function handleSetup(url, env) {
  if (!env.WEBHOOK_SECRET || url.searchParams.get('key') !== env.WEBHOOK_SECRET) return new Response('forbidden', { status: 403 });
  const base = `${url.protocol}//${url.host}`;
  const appUrl = env.APP_URL || base + '/';
  const a = await tgApi(env, 'setWebhook', { url: base + '/webhook', secret_token: env.WEBHOOK_SECRET, allowed_updates: ['message', 'pre_checkout_query'] });
  const b = await tgApi(env, 'setChatMenuButton', { menu_button: { type: 'web_app', text: 'EnglishUp', web_app: { url: appUrl } } });
  const c = await tgApi(env, 'setMyCommands', { commands: [{ command: 'start', description: 'Open EnglishUp' }, { command: 'paysupport', description: 'Payment support' }] });
  return json({ webhook: a, menu: b, commands: c, appUrl });
}
