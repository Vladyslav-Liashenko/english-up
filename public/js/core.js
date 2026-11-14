/* EnglishUp — ядро: Telegram, стан, збереження, геймифікація, звук, API */
(function () {
  'use strict';
  var tg = window.Telegram && window.Telegram.WebApp;
  var inTg = !!(tg && tg.initData);
  var API = window.API_BASE || '';

  // ---------- utils ----------
  var U = {};
  U.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  U.pad = function (n) { return (n < 10 ? '0' : '') + n; };
  U.today = function (d) {
    d = d || new Date();
    return d.getFullYear() + '-' + U.pad(d.getMonth() + 1) + '-' + U.pad(d.getDate());
  };
  U.yesterday = function () { var d = new Date(); d.setDate(d.getDate() - 1); return U.today(d); };
  U.week = function () { // ISO week key, тиждень з понеділка
    var d = new Date(); d.setHours(0, 0, 0, 0);
    var day = (d.getDay() + 6) % 7; d.setDate(d.getDate() - day);
    return 'W' + U.today(d);
  };
  U.hash = function (s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  U.rng = function (seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  U.shuffle = function (arr, rnd) { rnd = rnd || Math.random; var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; } return a; };
  U.pick = function (arr, n, rnd) { return U.shuffle(arr, rnd).slice(0, n); };
  U.md = function (s) { // мінімальний markdown -> html
    var h = U.esc(s || '');
    h = h.replace(/```([\s\S]*?)```/g, '<pre>$1</pre>');
    h = h.replace(/`([^`]+)`/g, '<code>$1</code>');
    h = h.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
    h = h.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<i>$2</i>');
    h = h.replace(/^#{1,4} (.*)$/gm, '<b>$1</b>');
    h = h.replace(/^\s*[-•] (.*)$/gm, '<div class="li">• $1</div>');
    h = h.replace(/\n/g, '<br>');
    h = h.replace(/<\/div><br>/g, '</div>');
    return h;
  };
  // Нормалізація відповіді: регістр, апострофи, скорочення, пунктуація
  U.norm = function (s) {
    s = String(s || '').toLowerCase().replace(/[’‘`´]/g, "'");
    s = s.replace(/\bwon't\b/g, 'will not').replace(/\bcan't\b/g, 'cannot').replace(/\bshan't\b/g, 'shall not');
    s = s.replace(/n't\b/g, ' not').replace(/'m\b/g, ' am').replace(/'re\b/g, ' are').replace(/'ve\b/g, ' have')
      .replace(/'ll\b/g, ' will').replace(/'d\b/g, ' would').replace(/\b(he|she|it|that|what|who|there|here)'s\b/g, '$1 is');
    s = s.replace(/\bcan not\b/g, 'cannot');
    s = s.replace(/[^a-z0-9'\s]/g, ' ').replace(/\s+/g, ' ').trim();
    return s;
  };
  U.sameAnswer = function (a, b) {
    var na = U.norm(a), nb = U.norm(b);
    if (na === nb) return true;
    // "has" / "is" після he/she/it у скороченнях неоднозначні — пробуємо обидва
    return na.replace(/\b(is|has)\b/g, '_') === nb.replace(/\b(is|has)\b/g, '_') && na.split(' ').length === nb.split(' ').length;
  };

  // ---------- i18n ----------
  var I18N = window.I18N;
  function t(key, vars) {
    var lang = (State.p && State.p.lang) || 'uk';
    var s = (I18N[lang] && I18N[lang][key]) || I18N.uk[key] || key;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  }
  function tr(obj) { // переклад об'єкта {uk, ru}
    if (!obj) return '';
    var lang = (State.p && State.p.lang) || 'uk';
    return obj[lang] || obj.uk || '';
  }

  // ---------- Storage (Telegram CloudStorage + localStorage) ----------
  var CHUNK = 3800;
  var hasCloud = inTg && tg.isVersionAtLeast && tg.isVersionAtLeast('6.9') && tg.CloudStorage;
  var uid = (inTg && tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.id) || 'local';
  var lsPrefix = 'eu_' + uid + '_';

  function lsGet(k) { try { return localStorage.getItem(lsPrefix + k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(lsPrefix + k, v); } catch (e) { } }
  function lsDel(k) { try { localStorage.removeItem(lsPrefix + k); } catch (e) { } }

  function cloudGet(keys) {
    return new Promise(function (res) {
      if (!hasCloud || !keys.length) return res({});
      try { tg.CloudStorage.getItems(keys, function (err, vals) { res(err ? {} : (vals || {})); }); } catch (e) { res({}); }
    });
  }
  function cloudSet(k, v) {
    return new Promise(function (res) {
      if (!hasCloud) return res();
      try { tg.CloudStorage.setItem(k, v, function () { res(); }); } catch (e) { res(); }
    });
  }
  function cloudDel(keys) {
    return new Promise(function (res) {
      if (!hasCloud || !keys.length) return res();
      try { tg.CloudStorage.removeItems(keys, function () { res(); }); } catch (e) { res(); }
    });
  }
  var chunkCounts = {};
  async function cloudGetBig(key) {
    var head = await cloudGet([key + '_n']);
    var n = parseInt(head[key + '_n'], 10);
    if (!n) return null;
    chunkCounts[key] = n;
    var keys = []; for (var i = 0; i < n; i++) keys.push(key + '_' + i);
    var parts = await cloudGet(keys);
    var s = ''; for (var j = 0; j < n; j++) { if (parts[key + '_' + j] == null) return null; s += parts[key + '_' + j]; }
    return s;
  }
  async function cloudSetBig(key, str) {
    var n = Math.max(1, Math.ceil(str.length / CHUNK));
    for (var i = 0; i < n; i++) await cloudSet(key + '_' + i, str.slice(i * CHUNK, (i + 1) * CHUNK));
    await cloudSet(key + '_n', String(n));
    var old = chunkCounts[key] || 0, extra = [];
    for (var j = n; j < old; j++) extra.push(key + '_' + j);
    if (extra.length) await cloudDel(extra);
    chunkCounts[key] = n;
  }

  var Store = {
    async loadKey(key, def) {
      var local = lsGet(key), cloud = null;
      try { cloud = await cloudGetBig(key); } catch (e) { }
      var a = null, b = null;
      try { a = local ? JSON.parse(local) : null; } catch (e) { }
      try { b = cloud ? JSON.parse(cloud) : null; } catch (e) { }
      // беремо новішу версію
      var best = a && b ? ((b.ts || 0) >= (a.ts || 0) ? b : a) : (a || b);
      return best || def;
    },
    timers: {},
    save(key, obj, now) {
      obj.ts = Date.now();
      var str = JSON.stringify(obj);
      lsSet(key, str);
      clearTimeout(this.timers[key]);
      var run = function () { cloudSetBig(key, str); };
      if (now) run(); else this.timers[key] = setTimeout(run, 1200);
    },
    async getCache(key) {
      var v = lsGet(key);
      if (!v) { try { v = await cloudGetBig(key); } catch (e) { } if (v) lsSet(key, v); }
      try { return v ? JSON.parse(v) : null; } catch (e) { return null; }
    },
    setCache(key, obj) { var s = JSON.stringify(obj); lsSet(key, s); cloudSetBig(key, s); },
    async wipe() {
      ['p', 'd', 'l'].forEach(lsDel);
      if (hasCloud) await new Promise(function (res) { tg.CloudStorage.getKeys(function (e, keys) { if (keys && keys.length) tg.CloudStorage.removeItems(keys, function () { res(); }); else res(); }); });
      try { Object.keys(localStorage).forEach(function (k) { if (k.indexOf(lsPrefix) === 0) localStorage.removeItem(k); }); } catch (e) { }
    }
  };

  // ---------- State ----------
  function defaultProfile() {
    return {
      v: 1, lang: 'uk', track: 'general', cefr: 'A1', onboarded: false,
      xp: 0, streak: 0, bestStreak: 0, lastActive: null, days: [],
      lessons: {}, grammar: {},
      stats: { words: 0, dict: 0, lessons: 0, translate: 0, gap: 0, essay: 0, speak: 0, question: 0, cards: 0, verbs: 0, exams: 0 },
      daily: null, weekly: null, ach: {},
      rate: 0.9, autoplay: true, cardFront: 'en', dir: 'mixed',
      essays: []
    };
  }
  var State = { p: null, dict: { items: [] }, learned: { items: [] } };

  State.load = async function () {
    var p = await Store.loadKey('p', null);
    State.p = Object.assign(defaultProfile(), p || {});
    State.p.stats = Object.assign(defaultProfile().stats, State.p.stats || {});
    State.dict = await Store.loadKey('d', { items: [] });
    State.learned = await Store.loadKey('l', { items: [] });
    Game.refreshQuests();
  };
  State.save = function (now) { Store.save('p', State.p, now); };
  State.saveDict = function () { Store.save('d', State.dict); };
  State.saveLearned = function () { Store.save('l', State.learned); };

  // ---------- Dictionary ----------
  var Dict = {
    has: function (w) { var k = w.toLowerCase(); return State.dict.items.some(function (x) { return x.w.toLowerCase() === k; }); },
    isLearned: function (w) { return State.learned.items.indexOf(w.toLowerCase()) >= 0; },
    add: function (word) {
      if (Dict.has(word.w)) return false;
      var item = { w: word.w, ipa: word.ipa || '', uk: word.uk || '', ru: word.ru || '', box: 0, added: Date.now() };
      if (word.kind) { item.kind = word.kind; item.sid = word.sid; item.t = word.t; } // kind 's' = речення з помилкою
      State.dict.items.unshift(item);
      State.saveDict();
      Game.track('dict', 1);
      return true;
    },
    remove: function (w) {
      State.dict.items = State.dict.items.filter(function (x) { return x.w !== w; });
      State.saveDict();
    },
    learn: function (w) { // ✓ вивчено: слово покидає словник
      var it = State.dict.items.find(function (x) { return x.w === w; });
      Dict.remove(w);
      if (it && it.kind === 's') { Game.addXP(5); return; }
      var k = w.toLowerCase();
      if (State.learned.items.indexOf(k) < 0) { State.learned.items.push(k); State.saveLearned(); }
      Game.track('words', 1);
      Game.addXP(5);
    }
  };

  // ---------- Gamification ----------
  var DAILY_POOL = [
    { id: 'dict', target: 5 }, { id: 'words', target: 3 }, { id: 'lesson', target: 1 },
    { id: 'gap', target: 5 }, { id: 'translate', target: 3 }, { id: 'cards', target: 10 },
    { id: 'verbs', target: 5 }, { id: 'speak', target: 3 }, { id: 'question', target: 1 }
  ];
  var WEEKLY = [
    { id: 'lesson', target: 5 }, { id: 'words', target: 20 }, { id: 'days', target: 5 },
    { id: 'essay', target: 1 }, { id: 'speak', target: 15 }
  ];
  var ACH = [
    { id: 'first_lesson', icon: '🎯', test: function (p) { return p.stats.lessons >= 1; } },
    { id: 'streak3', icon: '🔥', test: function (p) { return p.bestStreak >= 3; } },
    { id: 'streak7', icon: '🔥', test: function (p) { return p.bestStreak >= 7; } },
    { id: 'streak30', icon: '🏆', test: function (p) { return p.bestStreak >= 30; } },
    { id: 'words50', icon: '📚', test: function (p) { return p.stats.words >= 50; } },
    { id: 'words200', icon: '🧠', test: function (p) { return p.stats.words >= 200; } },
    { id: 'essay1', icon: '✍️', test: function (p) { return p.stats.essay >= 1; } },
    { id: 'speak50', icon: '🎙', test: function (p) { return p.stats.speak >= 50; } },
    { id: 'verbs100', icon: '⚡', test: function (p) { return p.stats.verbs >= 100; } },
    { id: 'grammar_all', icon: '⏳', test: function (p) { return Object.keys(p.grammar).length >= window.TENSES.length; } },
    { id: 'level_up', icon: '🚀', test: function (p) { return p.stats.exams >= 1; } },
    { id: 'xp1000', icon: '💎', test: function (p) { return p.xp >= 1000; } }
  ];
  var Game = {
    DAILY_XP: 20, DAILY_BONUS: 50, WEEKLY_XP: 100, ACH: ACH,
    levelOf: function (xp) { var l = 0; while (50 * (l + 1) * (l + 2) <= xp) l++; return l + 1; },
    levelRange: function (lvl) { return [50 * (lvl - 1) * lvl, 50 * lvl * (lvl + 1)]; },
    addXP: function (n) {
      if (!n) return;
      var before = Game.levelOf(State.p.xp);
      State.p.xp += n;
      var after = Game.levelOf(State.p.xp);
      UI.toast('+' + n + ' XP');
      if (after > before) setTimeout(function () { UI.toast('🎉 ' + t('level_up', { n: after }), 2500); UI.haptic('success'); }, 700);
      Game.checkAch();
      State.save();
    },
    touchDay: function () {
      var p = State.p, today = U.today();
      if (p.lastActive === today) return;
      p.streak = p.lastActive === U.yesterday() ? p.streak + 1 : 1;
      p.bestStreak = Math.max(p.bestStreak || 0, p.streak);
      p.lastActive = today;
      p.days = (p.days || []).concat(today).slice(-30);
      Game.bump('days', 1);
    },
    refreshQuests: function () {
      var p = State.p, today = U.today(), wk = U.week();
      if (!p.daily || p.daily.date !== today) {
        var rnd = U.rng(U.hash(today + uid));
        p.daily = { date: today, bonus: false, quests: U.pick(DAILY_POOL, 3, rnd).map(function (q) { return { id: q.id, target: q.target, n: 0, done: false }; }) };
      }
      if (!p.weekly || p.weekly.week !== wk) {
        p.weekly = { week: wk, quests: WEEKLY.map(function (q) { return { id: q.id, target: q.target, n: 0, done: false }; }) };
        if (p.lastActive === today) p.weekly.quests.forEach(function (q) { if (q.id === 'days') q.n = 1; });
      }
    },
    bump: function (ev, n) {
      var p = State.p, gained = 0;
      [['daily', Game.DAILY_XP], ['weekly', Game.WEEKLY_XP]].forEach(function (pair) {
        var box = p[pair[0]]; if (!box) return;
        box.quests.forEach(function (q) {
          if (q.id !== ev || q.done) return;
          q.n = Math.min(q.target, q.n + n);
          if (q.n >= q.target) { q.done = true; gained += pair[1]; UI.toast('✅ ' + t('quest_done') + ': ' + Game.questLabel(q), 2200); }
        });
      });
      if (p.daily && !p.daily.bonus && p.daily.quests.every(function (q) { return q.done; })) {
        p.daily.bonus = true; gained += Game.DAILY_BONUS;
        setTimeout(function () { UI.toast('🎁 ' + t('daily_chest'), 2500); }, 900);
      }
      if (gained) setTimeout(function () { Game.addXP(gained); }, 400);
    },
    track: function (ev, n) {
      n = n || 1;
      Game.refreshQuests();
      Game.touchDay();
      if (State.p.stats[ev] != null) State.p.stats[ev] += n;
      Game.bump(ev, n);
      Game.checkAch();
      State.save();
    },
    questLabel: function (q) { return t('q_' + q.id, { n: q.target }); },
    checkAch: function () {
      var p = State.p;
      ACH.forEach(function (a) {
        if (!p.ach[a.id] && a.test(p)) { p.ach[a.id] = Date.now(); setTimeout(function () { UI.toast(a.icon + ' ' + t('ach_unlocked') + ': ' + t('ach_' + a.id), 2600); UI.haptic('success'); }, 1200); }
      });
    }
  };

  // ---------- UI helpers ----------
  var UI = {
    toast: function (msg, ms) {
      var box = document.getElementById('toasts');
      var el = document.createElement('div'); el.className = 'toast'; el.textContent = msg;
      box.appendChild(el);
      setTimeout(function () { el.classList.add('out'); }, ms || 1500);
      setTimeout(function () { el.remove(); }, (ms || 1500) + 400);
    },
    haptic: function (type) {
      try {
        if (!inTg) return;
        if (type === 'success' || type === 'error' || type === 'warning') tg.HapticFeedback.notificationOccurred(type);
        else tg.HapticFeedback.impactOccurred(type || 'light');
      } catch (e) { }
    },
    confirm: function (msg) {
      return new Promise(function (res) {
        if (inTg && tg.isVersionAtLeast('6.2')) tg.showConfirm(msg, function (ok) { res(!!ok); });
        else res(window.confirm(msg));
      });
    }
  };

  // ---------- Speech: TTS ----------
  var audioCache = {};
  var curAudio = null;
  function enVoice() {
    if (!('speechSynthesis' in window)) return null;
    var vs = speechSynthesis.getVoices() || [];
    var en = vs.filter(function (v) { return /^en[-_]/i.test(v.lang) || v.lang === 'en'; });
    return en.find(function (v) { return /en[-_]US/i.test(v.lang) && /samantha|google|natural|premium|enhanced/i.test(v.name); }) ||
      en.find(function (v) { return /en[-_](US|GB)/i.test(v.lang); }) || en[0] || null;
  }
  function waitVoices() {
    return new Promise(function (res) {
      if (!('speechSynthesis' in window)) return res(null);
      var v = enVoice(); if (v) return res(v);
      var done = false;
      speechSynthesis.onvoiceschanged = function () { if (!done) { done = true; res(enVoice()); } };
      setTimeout(function () { if (!done) { done = true; res(enVoice()); } }, 400);
    });
  }
  var Speech = {
    async speak(text) {
      text = String(text || '').replace(/\s*–\s*/g, ', ').replace(/\//g, ', ');
      if (!text) return;
      try { if (curAudio) { curAudio.pause(); curAudio = null; } if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch (e) { }
      var v = await waitVoices();
      if (v) {
        var u = new SpeechSynthesisUtterance(text);
        u.voice = v; u.lang = v.lang; u.rate = State.p.rate || 0.9;
        speechSynthesis.speak(u);
        return;
      }
      // Фолбек: озвучка на сервері (Workers AI)
      try {
        var url = audioCache[text];
        if (!url) {
          var r = await fetch(API + '/api/tts', { method: 'POST', headers: Api.headers(), body: JSON.stringify({ text: text }) });
          if (!r.ok) throw new Error('tts');
          url = URL.createObjectURL(await r.blob());
          audioCache[text] = url;
        }
        curAudio = new Audio(url);
        curAudio.playbackRate = Math.max(0.7, State.p.rate || 0.9);
        await curAudio.play();
      } catch (e) { UI.toast(t('tts_fail')); }
    }
  };

  // ---------- Speech: STT (запис голосу) ----------
  var Rec = {
    supported: function () { return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder); },
    rec: null, chunks: [], stream: null,
    async start() {
      Rec.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      var mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'].find(function (m) { return MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m); });
      Rec.rec = new MediaRecorder(Rec.stream, mime ? { mimeType: mime } : undefined);
      Rec.chunks = [];
      Rec.rec.ondataavailable = function (e) { if (e.data && e.data.size) Rec.chunks.push(e.data); };
      Rec.rec.start();
    },
    stop() {
      return new Promise(function (res) {
        if (!Rec.rec) return res(null);
        Rec.rec.onstop = function () {
          var type = (Rec.rec && Rec.rec.mimeType) || 'audio/webm';
          var blob = new Blob(Rec.chunks, { type: type });
          if (Rec.stream) Rec.stream.getTracks().forEach(function (tk) { tk.stop(); });
          Rec.rec = null; Rec.stream = null;
          res(blob);
        };
        Rec.rec.stop();
      });
    },
    async transcribe(blob) {
      var r = await fetch(API + '/api/stt', { method: 'POST', headers: { 'Content-Type': blob.type || 'audio/webm', 'X-Init-Data': inTg ? tg.initData : '' }, body: blob });
      if (!r.ok) throw new Error('stt ' + r.status);
      var j = await r.json();
      return (j.text || '').trim();
    }
  };

  // ---------- API (Cloudflare Worker -> Claude) ----------
  var Api = {
    headers: function () { return { 'Content-Type': 'application/json', 'X-Init-Data': inTg ? tg.initData : '' }; },
    async ai(mode, payload) {
      var body = Object.assign({ mode: mode, lang: State.p.lang, level: State.p.cefr, track: State.p.track }, payload);
      var r = await fetch(API + '/api/ai', { method: 'POST', headers: Api.headers(), body: JSON.stringify(body) });
      var j = null; try { j = await r.json(); } catch (e) { }
      if (!r.ok) {
        var err = new Error((j && j.error) || ('HTTP ' + r.status)); err.code = r.status; throw err;
      }
      return j;
    }
  };

  // ---------- Content helpers ----------
  var Content = {
    tense: function (id) { return window.TENSES.find(function (x) { return x.id === id; }); },
    levelIdx: function (id) { return window.LEVELS.findIndex(function (l) { return l.id === id; }); },
    sentence: function (s) { // з квадратних дужок -> текст і відповіді
      var answers = []; var text = s.raw.replace(/\[([^\]]+)\]/g, function (m, a) { answers.push(a); return a; });
      return { text: text, answers: answers, parts: s.raw.split(/\[[^\]]+\]/) };
    },
    tensesUpTo: function (cefr) {
      var li = Content.levelIdx(cefr);
      var ids = window.TENSES.filter(function (x) { return Content.levelIdx(x.level) <= li; }).map(function (x) { return x.id; });
      return ids.length ? ids : ['present_simple'];
    },
    sentencesFor: function (tenseIds) {
      return window.SENTENCES.filter(function (s) { return tenseIds.indexOf(s.t) >= 0; });
    },
    async lessonWords(track, level, n) {
      var key = track + '_' + level + '_' + n;
      if (window.WORD_LESSONS[key]) return window.WORD_LESSONS[key];
      var cacheKey = 'g_' + key;
      var cached = await Store.getCache(cacheKey);
      if (cached && cached.words && cached.words.length) return cached;
      // Генерація ІІ: виключаємо вже відомі слова
      var exclude = State.learned.items.slice(-150);
      Object.keys(window.WORD_LESSONS).forEach(function (k) { if (k.indexOf(track + '_') === 0) window.WORD_LESSONS[k].words.forEach(function (w) { exclude.push(w.w); }); });
      var res = await Api.ai('lesson_words', { lesson: n, exclude: exclude.slice(-250), count: 12 });
      var out = { title: res.title || (level + ' #' + n), words: (res.words || []).filter(function (w) { return w && w.w; }).slice(0, 15) };
      if (out.words.length) Store.setCache(cacheKey, out);
      return out;
    }
  };

  window.EU = { tg: tg, inTg: inTg, U: U, t: t, tr: tr, Store: Store, State: State, Dict: Dict, Game: Game, UI: UI, Speech: Speech, Rec: Rec, Api: Api, Content: Content };
})();
