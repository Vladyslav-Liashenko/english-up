/* EnglishUp — екрани та навігація */
(function () {
  'use strict';
  var E = window.EU, tg = E.tg, U = E.U, t = E.t, tr = E.tr, State = E.State, Dict = E.Dict, Game = E.Game,
    UI = E.UI, Speech = E.Speech, Rec = E.Rec, Api = E.Api, Content = E.Content;
  var esc = U.esc;
  var root = document.getElementById('app');
  var nav = { tab: 'home', stack: [], sub: { course: 'levels', dict: 'words' } };
  var reg = {}; var regN = 0; // реєстр об'єктів для кнопок
  function R(obj) { var id = 'r' + (++regN); reg[id] = obj; return id; }
  function L() { return State.p.lang; }

  // ---------- навігація ----------
  function render(keepScroll) {
    var y = window.scrollY;
    reg = {}; regN = 0;
    var html;
    if (!State.p.onboarded) html = Onboarding();
    else if (nav.stack.length) { var pg = nav.stack[nav.stack.length - 1]; html = '<div class="page">' + Pages[pg.type](pg) + '</div>'; }
    else html = '<div class="tabview">' + Tabs[nav.tab]() + '</div>' + NavBar();
    root.innerHTML = html;
    if (keepScroll) window.scrollTo(0, y);
    afterRender();
  }
  function afterRender() {
    var hasBack = State.p.onboarded && nav.stack.length > 0;
    try { if (E.inTg && tg.isVersionAtLeast('6.1')) { hasBack ? tg.BackButton.show() : tg.BackButton.hide(); } } catch (e) { }
    var top = nav.stack[nav.stack.length - 1];
    if (top && top.type === 'chat' || top && top.type === 'qa') { var m = document.getElementById('msgs'); if (m) m.scrollTop = m.scrollHeight; window.scrollTo(0, document.body.scrollHeight); }
  }
  function push(pg) { nav.stack.push(pg); render(); window.scrollTo(0, 0); }
  function pop() { if (Rec.rec) Rec.stop(); nav.stack.pop(); render(); window.scrollTo(0, 0); }
  function replaceTop(pg) { nav.stack[nav.stack.length - 1] = pg; render(); window.scrollTo(0, 0); }
  function rerender() { render(true); }
  function top() { return nav.stack[nav.stack.length - 1]; }

  function NavBar() {
    var items = [['home', '🏠'], ['course', '🎓'], ['tenses', '⏳'], ['dict', '📖'], ['practice', '💪']];
    return '<nav class="navbar">' + items.map(function (it) {
      return '<button class="nav-btn' + (nav.tab === it[0] ? ' on' : '') + '" data-act="tab" data-v="' + it[0] + '"><span>' + it[1] + '</span><small>' + t('tab_' + it[0]) + '</small></button>';
    }).join('') + '</nav>';
  }
  function head(title, sub) {
    return '<div class="phead">' + (E.inTg ? '' : '<button class="back" data-act="back">‹</button>') + '<div><h2>' + esc(title) + '</h2>' + (sub ? '<div class="muted">' + esc(sub) + '</div>' : '') + '</div></div>';
  }
  function seg(name, opts, cur) {
    return '<div class="seg">' + opts.map(function (o) { return '<button class="' + (o[0] === cur ? 'on' : '') + '" data-act="seg" data-k="' + name + '" data-v="' + o[0] + '">' + esc(o[1]) + '</button>'; }).join('') + '</div>';
  }
  function bar(v, max) { var p = max ? Math.min(100, Math.round(v / max * 100)) : 0; return '<div class="bar"><i style="width:' + p + '%"></i></div>'; }
  function wordTr(w) { return w[L()] || w.uk || w.ru || ''; }
  function levelName(id) { var l = window.LEVELS.find(function (x) { return x.id === id; }); return l ? l.name : ''; }
  function user() { return (E.inTg && tg.initDataUnsafe && tg.initDataUnsafe.user) || { first_name: 'Student' }; }
  function avatar(size) {
    var u = user();
    if (u.photo_url) return '<img class="ava" style="width:' + size + 'px;height:' + size + 'px" src="' + esc(u.photo_url) + '" alt="">';
    return '<div class="ava ph" style="width:' + size + 'px;height:' + size + 'px">' + esc((u.first_name || 'S').charAt(0)) + '</div>';
  }
  function spinner(text) { return '<div class="loading"><div class="spin"></div><div class="muted">' + esc(text || t('loading')) + '</div></div>'; }
  function wordRow(w, opts) {
    opts = opts || {};
    var id = R(w), inDict = Dict.has(w.w);
    var right = '';
    if (opts.dict) right = '<button class="icon ok" data-act="learn" data-r="' + id + '" title="✓">✓</button><button class="icon del" data-act="dict-del" data-r="' + id + '">✕</button>';
    else right = '<button class="icon ' + (inDict ? 'on' : '') + '" data-act="dict-add" data-r="' + id + '">' + (inDict ? '✓' : '+') + '</button>';
    return '<div class="word"><button class="icon speak" data-act="speak" data-r="' + id + '">🔊</button>' +
      '<div class="wbody"><div>' + (w.kind === 's' ? esc(w.w) : '<b>' + esc(w.w) + '</b>') + (w.ipa ? ' <span class="ipa">[' + esc(w.ipa) + ']</span>' : '') + '</div><div class="muted">' + esc(wordTr(w)) + (w.kind === 's' && w.t && Content.tense(w.t) ? ' <span class="badge">' + Content.tense(w.t).name + '</span>' : '') + '</div></div>' + right + '</div>';
  }

  // ---------- Onboarding ----------
  function Onboarding() {
    var p = State.p;
    return '<div class="page onb"><div class="logo">🇬🇧</div><h1>EnglishUp</h1><p class="muted">' + t('onb_sub') + '</p>' +
      '<h3>' + t('set_lang') + '</h3>' + seg('lang', [['uk', 'Українська'], ['ru', 'Русский']], p.lang) +
      '<h3>' + t('onb_level') + '</h3><div class="grid3">' + window.LEVELS.map(function (l) {
        return '<button class="chip' + (p.cefr === l.id ? ' on' : '') + '" data-act="onb-level" data-v="' + l.id + '"><b>' + l.id + '</b><small>' + l.name + '</small></button>';
      }).join('') + '</div>' +
      '<h3>' + t('onb_track') + '</h3><div class="grid2">' + window.TRACKS.map(function (tk) {
        return '<button class="chip' + (p.track === tk.id ? ' on' : '') + '" data-act="onb-track" data-v="' + tk.id + '">' + tk.icon + ' ' + esc(tk[L()]) + '</button>';
      }).join('') + '</div>' +
      '<button class="btn big" data-act="onb-done">' + t('onb_start') + '</button></div>';
  }

  // ---------- Tabs ----------
  var Tabs = {};
  Tabs.home = function () {
    var p = State.p, u = user(), lvl = Game.levelOf(p.xp), rg = Game.levelRange(lvl);
    Game.refreshQuests();
    var next = nextLesson();
    var h = '<div class="hero" data-act="open" data-v="profile">' + avatar(56) +
      '<div class="hinfo"><div class="hname">' + esc(u.first_name || '') + '</div>' +
      '<div><span class="badge cefr">' + p.cefr + ' · ' + levelName(p.cefr) + '</span> <span class="badge">' + t('lvl') + ' ' + lvl + '</span></div>' +
      bar(p.xp - rg[0], rg[1] - rg[0]) + '<div class="muted small">' + p.xp + ' / ' + rg[1] + ' XP</div></div>' +
      '<div class="streak">🔥<b>' + (p.lastActive === U.today() || p.lastActive === U.yesterday() ? p.streak : 0) + '</b></div></div>';
    if (next) {
      h += '<div class="card cta" data-act="' + (next.exam ? 'exam' : 'lesson') + '" data-l="' + next.level + '" data-n="' + (next.n || 0) + '"><div class="muted small">' + t('continue') + '</div>' +
        '<div class="cta-t">' + (next.exam ? '🏁 ' + t('exam') + ' ' + next.level : next.level + ' · ' + t('lesson') + ' ' + next.n + ' · ' + esc(lessonTitle(next.level, next.n))) + '</div><div class="arrow">›</div></div>';
    }
    h += '<h3>' + t('daily') + ' <span class="muted small">+' + Game.DAILY_XP + ' XP</span></h3><div class="card">' + p.daily.quests.map(questRow).join('') +
      '<div class="chest ' + (p.daily.bonus ? 'done' : '') + '">🎁 ' + t('daily_chest_hint', { n: Game.DAILY_BONUS }) + '</div></div>';
    h += '<h3>' + t('weekly') + ' <span class="muted small">+' + Game.WEEKLY_XP + ' XP</span></h3><div class="card">' + p.weekly.quests.map(questRow).join('') + '</div>';
    h += '<h3>' + t('quick') + '</h3><div class="grid2">' +
      tile('tab', 'tenses', '⏳', t('tenses_sheet')) + tile('dictsub', 'verbs', '⚡', t('irregular')) +
      tile('dictsub', 'cards', '🃏', t('cards') + ' (' + State.dict.items.length + ')') + tile('open', 'qa', '❓', t('ask')) + '</div>' +
      '<button class="card donate-cta" data-act="open" data-v="donate"><span>⭐</span><div><b>' + t('donate') + '</b><div class="muted small">' + t('donate_sub') + '</div></div><span class="arrow">›</span></button>';
    return h;
  };
  function tile(act, v, icon, label, desc) {
    return '<button class="tile" data-act="' + act + '" data-v="' + v + '"><span class="ti">' + icon + '</span><b>' + esc(label) + '</b>' + (desc ? '<small class="muted">' + esc(desc) + '</small>' : '') + '</button>';
  }
  function questRow(q) {
    return '<div class="quest' + (q.done ? ' done' : '') + '"><div class="qt">' + (q.done ? '✅ ' : '') + esc(Game.questLabel(q)) + '<span class="muted small">' + q.n + '/' + q.target + '</span></div>' + bar(q.n, q.target) + '</div>';
  }
  function lessonKey(level, n) { return level + '_' + n; }
  function lessonTense(level, n) { var lv = window.LEVELS.find(function (x) { return x.id === level; }); return lv.lessons[n - 1]; }
  function lessonTitle(level, n) { var id = lessonTense(level, n); return id === 'mixed' ? t('mixed') : Content.tense(id).name; }
  function nextLesson() {
    var p = State.p, lv = window.LEVELS.find(function (x) { return x.id === p.cefr; });
    for (var i = 1; i <= lv.lessons.length; i++) if (!(p.lessons[lessonKey(p.cefr, i)] || {}).done) return { level: p.cefr, n: i };
    if (p.cefr !== 'C2') return { level: p.cefr, exam: true };
    return { level: p.cefr, n: 1 + Math.floor(Math.random() * 4) };
  }
  function lessonUnlocked(level, n) {
    var p = State.p, li = Content.levelIdx(level), ci = Content.levelIdx(p.cefr);
    if (li < ci) return true; if (li > ci) return false;
    return n === 1 || (p.lessons[lessonKey(level, n - 1)] || {}).done;
  }

  Tabs.course = function () {
    var p = State.p, sub = nav.sub.course;
    var h = '<h2 class="title">' + t('tab_course') + '</h2>' + seg('course', [['levels', t('levels')], ['grammar', t('grammar')]], sub);
    if (sub === 'levels') {
      var ci = Content.levelIdx(p.cefr);
      window.LEVELS.forEach(function (lv, li) {
        var state = li < ci ? 'done' : li === ci ? 'cur' : 'lock';
        h += '<div class="card lvl ' + state + '"><div class="lvl-h"><span class="badge cefr">' + lv.id + '</span> <b>' + lv.name + '</b> <span class="muted small">' + (state === 'done' ? '✓ ' + t('passed') : state === 'lock' ? '🔒' : t('current')) + '</span></div>';
        if (state !== 'lock') {
          lv.lessons.forEach(function (tid, i) {
            var n = i + 1, rec = p.lessons[lessonKey(lv.id, n)] || {}, open = lessonUnlocked(lv.id, n);
            h += '<button class="lrow' + (open ? '' : ' locked') + '" data-act="lesson" data-l="' + lv.id + '" data-n="' + n + '"><span class="ln">' + (rec.done ? '✓' : open ? n : '🔒') + '</span><span class="lt">' + t('lesson') + ' ' + n + ' · ' + esc(lessonTitle(lv.id, n)) + '</span>' + (rec.best != null ? '<span class="muted small">' + Math.round(rec.best * 100) + '%</span>' : '') + '</button>';
          });
          if (state === 'cur' && lv.id !== 'C2') {
            var all = lv.lessons.every(function (x, i) { return (p.lessons[lessonKey(lv.id, i + 1)] || {}).done; });
            h += '<button class="lrow exam' + (all ? '' : ' locked') + '" data-act="exam" data-l="' + lv.id + '"><span class="ln">🏁</span><span class="lt">' + t('exam') + ' → ' + window.LEVELS[li + 1].id + '</span><span class="muted small">' + (all ? '' : t('exam_lock')) + '</span></button>';
          }
        }
        h += '</div>';
      });
      h += '<p class="muted small center">' + t('level_hint') + '</p>';
    } else {
      window.LEVELS.slice(0, 4).forEach(function (lv) {
        var list = window.TENSES.filter(function (x) { return x.level === lv.id; });
        if (!list.length) return;
        h += '<h3>' + lv.id + ' · ' + lv.name + '</h3><div class="card">' + list.map(function (x) {
          return '<button class="lrow" data-act="tense" data-v="' + x.id + '"><span class="ln">' + (p.grammar[x.id] ? '✓' : '⏳') + '</span><span class="lt">' + x.name + '</span><span class="muted small">' + esc(x.pos.split('\n')[0]) + '</span></button>';
        }).join('') + '</div>';
      });
    }
    return h;
  };

  Tabs.tenses = function () {
    var times = ['present', 'past', 'future'], aspects = ['simple', 'continuous', 'perfect', 'perfect_continuous'];
    var h = '<h2 class="title">' + t('tenses_sheet') + '</h2><p class="muted small">' + t('tenses_hint') + '</p><div class="tgrid"><div></div>' +
      times.map(function (x) { return '<div class="th">' + x.charAt(0).toUpperCase() + x.slice(1) + '</div>'; }).join('');
    aspects.forEach(function (a) {
      h += '<div class="th side">' + a.replace('_', ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); }) + '</div>';
      times.forEach(function (tm) {
        var x = window.TENSES.find(function (z) { return z.time === tm && z.aspect === a; });
        h += '<button class="tcell ' + tm + '" data-act="tense" data-v="' + x.id + '"><b>' + x.name.replace(/^(Present|Past|Future) /, '') + '</b><small>' + esc(x.pos.split('\n')[0]) + '</small></button>';
      });
    });
    h += '</div><button class="card lrow" data-act="tense" data-v="going_to"><span class="ln">🎯</span><span class="lt">Be going to</span><span class="muted small">am/is/are going to + V1</span></button>';
    h += '<h3>' + t('cheat_quick') + '</h3><div class="card small">' + t('cheat_text') + '</div>';
    return h;
  };

  Tabs.dict = function () {
    var sub = nav.sub.dict, h = '<h2 class="title">' + t('tab_dict') + '</h2>' +
      seg('dict', [['words', t('my_words') + ' (' + State.dict.items.length + ')'], ['cards', t('cards')], ['verbs', t('irregular')]], sub);
    if (sub === 'words') {
      h += '<div class="addrow"><input id="newword" placeholder="' + t('add_word_ph') + '" autocomplete="off"><button class="btn" data-act="word-lookup">+</button></div>';
      if (!State.dict.items.length) h += '<div class="empty">📭<p>' + t('dict_empty') + '</p></div>';
      else {
        var sents = State.dict.items.filter(function (x) { return x.kind === 's'; }), words = State.dict.items.filter(function (x) { return x.kind !== 's'; });
        if (words.length) h += '<h3>' + t('words_h') + ' (' + words.length + ')</h3><div class="card">' + words.map(function (w) { return wordRow(w, { dict: true }); }).join('') + '</div>';
        if (sents.length) h += '<h3>' + t('sent_h') + ' (' + sents.length + ')</h3><button class="btn sec" data-act="sent-train">🧩 ' + t('sent_train') + '</button><div class="card" style="margin-top:8px">' + sents.map(function (w) { return wordRow(w, { dict: true }); }).join('') + '</div>';
        h += '<p class="muted small center">' + t('dict_hint') + '</p>';
      }
      h += '<p class="muted small center">' + t('learned_total', { n: State.learned.items.length }) + '</p>';
    } else if (sub === 'cards') {
      var n = State.dict.items.length;
      h += '<div class="card center"><div class="ti big">🃏</div><p>' + t('cards_desc') + '</p>' +
        '<div class="muted small">' + t('card_front') + '</div>' + seg('front', [['en', 'English'], ['tr', L() === 'uk' ? 'Українська' : 'Русский']], State.p.cardFront) +
        '<button class="btn big" data-act="cards-start" ' + (n ? '' : 'disabled') + '>' + t('start') + ' (' + Math.min(n, 20) + ')</button>' + (n ? '' : '<p class="muted small">' + t('dict_empty') + '</p>') + '</div>';
    } else {
      var q = (nav.verbQ || '').toLowerCase();
      var list = window.VERBS.filter(function (v) { return !q || (v.v1 + ' ' + v.v2 + ' ' + v.v3 + ' ' + v[L()]).toLowerCase().indexOf(q) >= 0; });
      h += '<div class="addrow"><input id="vsearch" placeholder="' + t('search') + '" value="' + esc(nav.verbQ || '') + '" autocomplete="off"><button class="btn" data-act="verbs-quiz">' + t('train') + '</button></div>';
      h += '<div class="card vlist"><div class="vrow vh"><span>V1</span><span>V2</span><span>V3</span><span></span></div>' + list.map(function (v) {
        var id = R(v);
        return '<div class="vrow"><span><b>' + v.v1 + '</b></span><span>' + v.v2 + '</span><span>' + v.v3 + '</span><span class="vbtn"><button class="icon speak" data-act="verb-speak" data-r="' + id + '">🔊</button><button class="icon" data-act="verb-add" data-r="' + id + '">' + (Dict.has(v.v1 + ' – ' + v.v2 + ' – ' + v.v3) ? '✓' : '+') + '</button></span><span class="vtr muted">' + esc(v[L()]) + '</span></div>';
      }).join('') + '</div>';
    }
    return h;
  };

  Tabs.practice = function () {
    return '<h2 class="title">' + t('tab_practice') + '</h2><div class="grid2">' +
      tile('practice', 'translate', '🔁', t('p_translate'), t('p_translate_d')) +
      tile('practice', 'gaps', '🧩', t('p_gaps'), t('p_gaps_d')) +
      tile('open', 'essay', '✍️', t('p_essay'), t('p_essay_d')) +
      tile('open', 'speak', '🎙', t('p_speak'), t('p_speak_d')) +
      tile('open', 'qa', '❓', t('ask'), t('ask_d')) +
      tile('verbs-quiz', '', '⚡', t('irregular'), t('verbs_d')) + '</div>' +
      '<h3>' + t('tr_dir') + '</h3>' + seg('dir', [['mixed', t('dir_mixed')], ['to_en', t('dir_to_en')], ['from_en', t('dir_from_en')]], State.p.dir);
  };

  // ---------- Pages ----------
  var Pages = {};

  Pages.profile = function () {
    var p = State.p, u = user(), lvl = Game.levelOf(p.xp), s = p.stats;
    var h = head(t('profile')) + '<div class="card center">' + avatar(84) + '<h2>' + esc((u.first_name || '') + ' ' + (u.last_name || '')) + '</h2>' +
      '<div><span class="badge cefr">' + p.cefr + ' · ' + levelName(p.cefr) + '</span> <span class="badge">' + t('lvl') + ' ' + lvl + '</span> <span class="badge">' + p.xp + ' XP</span></div>' +
      '<div class="cefr-scale">' + window.LEVELS.map(function (l, i) { return '<span class="' + (i <= Content.levelIdx(p.cefr) ? 'on' : '') + '">' + l.id + '</span>'; }).join('') + '</div></div>';
    h += '<div class="stats">' + [
      ['🔥', p.streak, t('st_streak')], ['🏅', p.bestStreak || 0, t('st_best')], ['🎓', s.lessons, t('st_lessons')], ['🧠', s.words, t('st_words')],
      ['🔁', s.translate, t('st_translate')], ['🧩', s.gap, t('st_gaps')], ['✍️', s.essay, t('st_essays')], ['🎙', s.speak, t('st_speak')]
    ].map(function (x) { return '<div class="stat"><span>' + x[0] + '</span><b>' + x[1] + '</b><small>' + x[2] + '</small></div>'; }).join('') + '</div>';
    h += '<h3>' + t('achievements') + '</h3><div class="ach">' + Game.ACH.map(function (a) {
      return '<div class="a' + (p.ach[a.id] ? ' on' : '') + '"><span>' + a.icon + '</span><small>' + esc(t('ach_' + a.id)) + '</small></div>';
    }).join('') + '</div>';
    if (p.essays.length) h += '<h3>' + t('essays_hist') + '</h3><div class="card">' + p.essays.slice(0, 10).map(function (e) { return '<div class="lrow static"><span class="ln">' + e.score + '</span><span class="lt">' + esc(e.topic) + '</span><span class="muted small">' + e.date + '</span></div>'; }).join('') + '</div>';
    h += '<button class="btn big" data-act="open" data-v="donate">⭐ ' + t('donate') + '</button>';
    h += '<button class="btn sec big" data-act="open" data-v="settings">⚙️ ' + t('settings') + '</button>';
    return h;
  };

  // ----- Донат зірками Telegram -----
  var DONATE_PRESETS = [100, 500, 1000];
  Pages.donate = function (pg) {
    var p = State.p, n = pg.amount || 0;
    return head(t('donate'), t('donate_sub')) +
      '<div class="card center"><div class="ti big">💛</div><p>' + t('donate_text') + '</p></div>' +
      '<h3>' + t('donate_choose') + '</h3><div class="grid3">' + DONATE_PRESETS.map(function (x) {
        return '<button class="chip star' + (!pg.custom && n === x ? ' on' : '') + '" data-act="donate-pick" data-v="' + x + '"><b>⭐ ' + x + '</b></button>';
      }).join('') + '</div>' +
      '<h3>' + t('donate_own') + '</h3><input id="donate-in" type="number" inputmode="numeric" min="1" max="10000" placeholder="' + t('donate_ph') + '" value="' + (pg.custom && n ? n : '') + '">' +
      (pg.busy ? spinner(t('loading')) : '<button class="btn big" id="donate-btn" data-act="donate-go" ' + (n ? '' : 'disabled') + '>' + t('donate_btn', { n: n || '…' }) + '</button>') +
      (p.donated ? '<p class="muted small center">' + t('donate_total', { n: p.donated }) + '</p>' : '') +
      '<p class="muted small center">' + t('donate_note') + '</p>';
  };
  async function donate(pg) {
    var n = Math.floor(pg.amount || 0);
    if (!(n >= 1 && n <= 10000)) return UI.toast(t('donate_range'));
    if (!E.inTg || !tg.isVersionAtLeast || !tg.isVersionAtLeast('6.1')) return UI.toast(t('donate_tg_only'), 2500);
    pg.busy = true; rerender();
    try {
      var r = await fetch((window.API_BASE || '') + '/api/donate', { method: 'POST', headers: Api.headers(), body: JSON.stringify({ amount: n, lang: L() }) });
      var j = await r.json();
      if (!r.ok || !j.link) throw new Error(j.error || 'invoice');
      tg.openInvoice(j.link, function (status) {
        if (status === 'paid') {
          State.p.donated = (State.p.donated || 0) + n; Game.checkAch(); State.save(true);
          UI.haptic('success'); UI.toast('💛 ' + t('donate_thanks'), 3000);
        } else if (status === 'failed') UI.toast(t('donate_failed'), 2500);
        if (top() === pg) rerender();
      });
    } catch (e) { UI.toast(t('donate_failed') + ' (' + e.message + ')', 3000); }
    pg.busy = false; if (top() === pg) rerender();
  }

  Pages.settings = function () {
    var p = State.p;
    return head(t('settings')) +
      '<h3>' + t('set_lang') + '</h3>' + seg('lang', [['uk', 'Українська'], ['ru', 'Русский']], p.lang) +
      '<h3>' + t('set_track') + '</h3><div class="grid2">' + window.TRACKS.map(function (tk) { return '<button class="chip' + (p.track === tk.id ? ' on' : '') + '" data-act="set-track" data-v="' + tk.id + '">' + tk.icon + ' ' + esc(tk[L()]) + '</button>'; }).join('') + '</div>' +
      '<h3>' + t('set_level') + '</h3><div class="grid3">' + window.LEVELS.map(function (l) { return '<button class="chip' + (p.cefr === l.id ? ' on' : '') + '" data-act="set-level" data-v="' + l.id + '"><b>' + l.id + '</b><small>' + l.name + '</small></button>'; }).join('') + '</div>' +
      '<h3>' + t('set_rate') + '</h3>' + seg('rate', [['0.7', '0.7×'], ['0.9', '0.9×'], ['1', '1×']], String(p.rate)) +
      '<h3>' + t('set_autoplay') + '</h3>' + seg('autoplay', [['1', t('on')], ['0', t('off')]], p.autoplay ? '1' : '0') +
      '<button class="btn danger big" data-act="reset">' + t('reset') + '</button>' +
      '<p class="muted small center">EnglishUp · ' + (E.inTg ? 'Telegram ' + tg.version : 'web') + '</p>';
  };

  Pages.tense = function (pg) {
    var x = Content.tense(pg.id), lang = L();
    var ex = Content.sentencesFor([x.id]).slice(0, 3);
    return head(x.name, x.level) +
      '<div class="card"><div class="muted small">' + t('when_use') + '</div><p>' + esc(tr(x.use)) + '</p></div>' +
      '<div class="card formula"><div><span class="f pos">+</span><pre>' + esc(x.pos) + '</pre></div><div><span class="f neg">−</span><pre>' + esc(x.neg) + '</pre></div><div><span class="f q">?</span><pre>' + esc(x.q) + '</pre></div></div>' +
      '<div class="card"><div class="muted small">' + t('markers') + '</div><p><i>' + esc(x.markers) + '</i></p></div>' +
      '<div class="card"><div class="muted small">' + t('examples') + '</div>' + x.ex.concat(ex.map(function (s) { var o = { en: Content.sentence(s).text }; o[lang] = s[lang]; return o; }).filter(function (o) { return !x.ex.some(function (e) { return U.norm(e.en) === U.norm(o.en); }); })).map(exLine).join('') + '</div>' +
      '<button class="btn big" data-act="tense-practice" data-v="' + x.id + '">💪 ' + t('practice_tense') + '</button>';
  };

  function exLine(e) {
    return '<div class="exl"><button class="icon speak" data-act="say" data-v="' + esc(e.en) + '">🔊</button><div>' + esc(e.en) + '<div class="muted small">' + esc(e[L()] || '') + '</div></div></div>';
  }

  // ----- Lesson loader -----
  Pages.lesson = function (pg) {
    if (pg.error) return head(pg.level + ' · ' + t('lesson') + ' ' + pg.n) + '<div class="empty">⚠️<p>' + esc(pg.error) + '</p><button class="btn" data-act="lesson-retry">' + t('retry') + '</button></div>';
    return head(pg.level + ' · ' + t('lesson') + ' ' + pg.n) + spinner(t('gen_lesson'));
  };
  async function startLesson(level, n) {
    var pg = { type: 'lesson', level: level, n: n };
    push(pg);
    try {
      var data = await Content.lessonWords(State.p.track, level, n);
      if (!data.words.length) throw new Error(t('ai_fail'));
      if (top() !== pg) return;
      var tid = lessonTense(level, n);
      var items = [];
      var title = level + ' · ' + t('lesson') + ' ' + n;
      items.push({ type: 'words', words: data.words, title: data.title });
      var tids = tid === 'mixed' ? Content.tensesUpTo(level) : [tid];
      if (tid !== 'mixed') items.push({ type: 'rule', id: tid });
      U.pick(data.words, Math.min(5, data.words.length)).forEach(function (w) { items.push(quizItem(w, data.words)); });
      var sents = U.shuffle(Content.sentencesFor(tids));
      sents.slice(0, 4).forEach(function (s) { items.push({ type: 'gap', s: s }); });
      sents.slice(4, 6).forEach(function (s, i) { items.push({ type: 'tr', s: s, dir: i ? 'from_en' : 'to_en' }); });
      replaceTop(newSession(title, items, function (score) {
        var key = lessonKey(level, n), rec = State.p.lessons[key] || {};
        var pass = score >= 0.6;
        rec.best = Math.max(rec.best || 0, score);
        if (pass) { var first = !rec.done; rec.done = true; State.p.lessons[key] = rec; Game.track('lesson', 1); Game.addXP(first ? 30 + Math.round(40 * score) : 15); }
        else { State.p.lessons[key] = rec; Game.addXP(5); }
        State.save();
        return pass ? t('lesson_pass') : t('lesson_fail');
      }));
    } catch (e) {
      if (top() === pg) { pg.error = (e.code ? t('ai_fail') + ' (' + e.message + ')' : e.message || t('ai_fail')); rerender(); }
    }
  }
  function quizItem(w, pool) {
    var others = U.pick(pool.filter(function (x) { return x.w !== w.w; }), 3);
    return { type: 'quiz', w: w, options: U.shuffle([w].concat(others)) };
  }

  async function startExam(level) {
    var lv = window.LEVELS.find(function (x) { return x.id === level; }), li = Content.levelIdx(level);
    var pg = { type: 'lesson', level: level, n: '🏁' };
    push(pg);
    try {
      var words = [];
      for (var i = 1; i <= lv.lessons.length; i++) { var d = await Content.lessonWords(State.p.track, level, i); words = words.concat(d.words); }
      if (top() !== pg) return;
      var own = window.TENSES.filter(function (x) { return x.level === level; }).map(function (x) { return x.id; });
      var tids = own.length ? own.concat(Content.tensesUpTo(level)) : Content.tensesUpTo(level);
      var items = [];
      U.shuffle(Content.sentencesFor(tids)).slice(0, 6).forEach(function (s) { items.push({ type: 'gap', s: s }); });
      U.pick(words, 4).forEach(function (w) { items.push(quizItem(w, words)); });
      items = U.shuffle(items);
      replaceTop(newSession(t('exam') + ' ' + level + ' → ' + window.LEVELS[li + 1].id, items, function (score) {
        if (score >= 0.7) {
          State.p.cefr = window.LEVELS[li + 1].id; State.p.stats.exams++; Game.addXP(200); Game.checkAch(); State.save(true);
          return '🚀 ' + t('exam_pass', { l: State.p.cefr });
        }
        Game.addXP(10); return t('exam_fail');
      }, 0.7));
    } catch (e) { if (top() === pg) { pg.error = e.message || t('ai_fail'); rerender(); } }
  }

  // ----- Exercise engine -----
  function newSession(title, items, onFinish, passMark) {
    return { type: 'session', title: title, items: items, i: 0, correct: 0, graded: 0, onFinish: onFinish, passMark: passMark || 0.6 };
  }
  Pages.session = function (pg) {
    if (pg.finished) {
      var sc = pg.graded ? pg.correct / pg.graded : 1;
      return head(pg.title) + '<div class="card center result"><div class="ti big">' + (sc >= pg.passMark ? '🎉' : '💪') + '</div><h2>' + Math.round(sc * 100) + '%</h2><p>' + t('correct_of', { a: pg.correct, b: pg.graded }) + '</p><p>' + esc(pg.msg || '') + '</p></div>' +
        '<button class="btn big" data-act="back">' + t('done') + '</button>';
    }
    var it = pg.items[pg.i], h = head(pg.title) + '<div class="prog">' + bar(pg.i, pg.items.length) + '<span class="muted small">' + (pg.i + 1) + '/' + pg.items.length + '</span></div>';
    h += '<div class="ex">' + Items[it.type](it) + '</div>';
    if (it.fb) h += '<div class="fb ' + (it.ok === true ? 'good' : it.ok === false ? 'bad' : '') + '">' + it.fb + '</div>';
    if (it.selfCheck) h += '<div class="row2"><button class="btn sec" data-act="self" data-v="0">✗ ' + t('self_wrong') + '</button><button class="btn sec" data-act="self" data-v="1">✓ ' + t('self_right') + '</button></div>';
    else if (it.busy) h += spinner(t('checking'));
    else if (it.done && it.ok === false) {
      var saveObj = mistakeEntry(it), saved = saveObj && Dict.has(saveObj.w);
      if (saveObj) h += '<button class="btn sec big" data-act="save-mistake" ' + (saved ? 'disabled' : '') + '>' + (saved ? '✓ ' + t('in_dict') : '+ ' + t(saveObj.kind === 's' ? 'save_sentence' : 'save_word')) + '</button>';
      h += '<div class="row2"><button class="btn sec" data-act="retry">↻ ' + t('try_again') + '</button><button class="btn" data-act="next">' + (pg.i + 1 < pg.items.length ? t('next') : t('finish')) + '</button></div>';
    }
    else if (it.type === 'words' || it.type === 'rule' || it.done) h += '<button class="btn big" data-act="next">' + (pg.i + 1 < pg.items.length ? t('next') : t('finish')) + '</button>';
    else if (it.type !== 'quiz') h += '<button class="btn big" data-act="check">' + t('check') + '</button>';
    return h;
  };
  var Items = {};
  Items.words = function (it) {
    return '<h3>' + t('new_words') + (it.title ? ' · ' + esc(it.title) : '') + '</h3><p class="muted small">' + t('new_words_hint') + '</p><div class="card">' + it.words.map(function (w) { return wordRow(w); }).join('') + '</div>' +
      '<button class="btn sec" data-act="add-all">' + t('add_all') + '</button>';
  };
  Items.rule = function (it) {
    var x = Content.tense(it.id);
    return '<h3>📘 ' + x.name + '</h3><div class="card"><p>' + esc(tr(x.use)) + '</p></div><div class="card formula"><div><span class="f pos">+</span><pre>' + esc(x.pos) + '</pre></div><div><span class="f neg">−</span><pre>' + esc(x.neg) + '</pre></div><div><span class="f q">?</span><pre>' + esc(x.q) + '</pre></div></div><div class="card small"><i>' + esc(x.markers) + '</i></div>' +
      x.ex.map(exLine).join('');
  };
  Items.quiz = function (it) {
    var id = R(it.w);
    return '<div class="muted small">' + t('choose_tr') + '</div><div class="qword"><button class="icon speak" data-act="speak" data-r="' + id + '">🔊</button><b>' + esc(it.w.w) + '</b>' + (it.w.ipa ? '<span class="ipa">[' + esc(it.w.ipa) + ']</span>' : '') + '</div>' +
      '<div class="opts">' + it.options.map(function (o, i) {
        var cls = it.done ? (o.w === it.w.w ? ' good' : (i === it.picked ? ' bad' : '')) : '';
        return '<button class="opt' + cls + '" data-act="pick" data-v="' + i + '" ' + (it.done ? 'disabled' : '') + '>' + esc(wordTr(o)) + '</button>';
      }).join('') + '</div>';
  };
  Items.gap = function (it) {
    var sp = Content.sentence(it.s), html = '';
    sp.parts.forEach(function (part, i) {
      html += esc(part);
      if (i < sp.answers.length) {
        var v = (it.vals && it.vals[i]) || '';
        html += '<input class="gap-in' + (it.done ? (it.okParts && it.okParts[i] ? ' good' : ' bad') : '') + '" data-gi="' + i + '" value="' + esc(v) + '" size="' + Math.max(6, sp.answers[i].length + 2) + '" autocomplete="off" autocapitalize="off" spellcheck="false" ' + (it.done ? 'disabled' : '') + '>';
      }
    });
    return '<div class="muted small">' + t('fill_gap') + ' · <b>' + esc(Content.tense(it.s.t).name) + '</b></div><div class="gapline">' + html + '</div><div class="hint">💡 (' + esc(it.s.hint) + ')</div><div class="muted small">' + esc(it.s[L()]) + '</div>';
  };
  Items.tr = function (it) {
    var src = it.dir === 'to_en' ? it.s[L()] : Content.sentence(it.s).text;
    return '<div class="muted small">' + (it.dir === 'to_en' ? t('tr_to_en') : t('tr_from_en')) + '</div><div class="src">' + (it.dir === 'from_en' ? '<button class="icon speak" data-act="say" data-v="' + esc(src) + '">🔊</button>' : '') + esc(src) + '</div>' +
      '<textarea id="tr-in" rows="3" placeholder="' + t('your_tr') + '" ' + (it.done || it.busy ? 'disabled' : '') + ' autocapitalize="sentences">' + esc(it.val || '') + '</textarea>';
  };
  Items.verb = function (it) {
    var v = it.v;
    function inp(k) { return '<input class="gap-in vin' + (it.done ? (it.okParts[k] ? ' good' : ' bad') : '') + '" data-gi="' + k + '" value="' + esc((it.vals || [])[k] || '') + '" placeholder="V' + (k + 2) + '" autocomplete="off" autocapitalize="off" spellcheck="false" ' + (it.done ? 'disabled' : '') + '>'; }
    return '<div class="muted small">' + t('verb_task') + '</div><div class="qword"><button class="icon speak" data-act="say" data-v="' + esc(v.v1) + '">🔊</button><b>' + v.v1 + '</b><span class="muted">' + esc(v[L()]) + '</span></div><div class="vins">' + inp(0) + inp(1) + '</div>';
  };

  function collectInputs(it) {
    var ins = root.querySelectorAll('.gap-in'); it.vals = [];
    ins.forEach(function (el) { it.vals[+el.dataset.gi] = el.value; });
    var ta = document.getElementById('tr-in'); if (ta) it.val = ta.value;
  }
  // Що зберегти у словник після помилки: речення (gap/tr), дієслово (verb) або слово (quiz)
  function mistakeEntry(it) {
    if (it.type === 'gap' || it.type === 'tr') return { kind: 's', sid: it.s.id, t: it.s.t, w: Content.sentence(it.s).text, uk: it.s.uk, ru: it.s.ru };
    if (it.type === 'verb') return { w: it.v.v1 + ' – ' + it.v.v2 + ' – ' + it.v.v3, uk: it.v.uk, ru: it.v.ru };
    if (it.type === 'quiz') return it.w;
    return null;
  }
  function grade(pg, it, ok, fb) {
    if (it.retry) { it.done = true; it.ok = ok; it.fb = fb + (ok ? '' : ''); UI.haptic(ok ? 'success' : 'error'); return; }
    it.done = true; it.ok = ok; it.fb = fb; pg.graded++; if (ok) pg.correct++;
    UI.haptic(ok ? 'success' : 'error');
    var ev = { gap: 'gap', tr: 'translate', verb: 'verbs' }[it.type];
    if (ev) Game.track(ev, 1);
    if (ev && ok) Game.addXP(it.type === 'tr' ? 10 : 5);
  }
  async function checkItem() {
    var pg = top(), it = pg.items[pg.i];
    collectInputs(it);
    if (it.type === 'gap') {
      var sp = Content.sentence(it.s);
      if (!it.vals.join('').trim()) return UI.toast(t('enter_answer'));
      it.okParts = sp.answers.map(function (a, i) { return U.sameAnswer(it.vals[i] || '', a); });
      var ok = it.okParts.every(Boolean);
      grade(pg, it, ok, (ok ? '✅ ' + t('right') : '❌ ' + t('wrong')) + '<div class="ans">' + esc(sp.text) + '</div>');
      rerender();
    } else if (it.type === 'verb') {
      var v = it.v;
      if (!it.vals.join('').trim()) return UI.toast(t('enter_answer'));
      it.okParts = [v.v2, v.v3].map(function (f, i) { return f.split('/').some(function (x) { return U.norm(x) === U.norm(it.vals[i] || ''); }); });
      var ok2 = it.okParts[0] && it.okParts[1];
      grade(pg, it, ok2, (ok2 ? '✅ ' : '❌ ') + '<b>' + v.v1 + ' – ' + v.v2 + ' – ' + v.v3 + '</b>');
      Speech.speak(v.v1 + ', ' + v.v2 + ', ' + v.v3);
      rerender();
    } else if (it.type === 'tr') {
      if (!(it.val || '').trim()) return UI.toast(t('enter_answer'));
      var en = Content.sentence(it.s).text, native = it.s[L()];
      var ref = it.dir === 'to_en' ? en : native;
      if (it.dir === 'to_en' && U.sameAnswer(it.val, en)) { grade(pg, it, true, '✅ ' + t('right') + '<div class="ans">' + esc(en) + '</div>'); return rerender(); }
      it.busy = true; rerender();
      try {
        var r = await Api.ai('check_translation', { direction: it.dir, source: it.dir === 'to_en' ? native : en, answer: it.val, reference: ref });
        it.busy = false;
        var ok3 = !!r.correct;
        grade(pg, it, ok3, (ok3 ? '✅ ' : '❌ ') + '<b>' + (r.score != null ? r.score + '/100' : '') + '</b> ' + esc(r.explanation || '') +
          (r.corrected ? '<div class="ans">' + esc(r.corrected) + '</div>' : '') + '<div class="muted small">' + t('reference') + ': ' + esc(ref) + '</div>');
      } catch (e) {
        it.busy = false; it.selfCheck = true;
        it.fb = t('ai_off_self') + '<div class="ans">' + esc(ref) + '</div>';
      }
      if (top() === pg) rerender();
    }
  }
  function nextItem() {
    var pg = top();
    if (pg.i + 1 < pg.items.length) { pg.i++; render(); window.scrollTo(0, 0); var f = root.querySelector('.gap-in, #tr-in'); if (f) f.focus(); return; }
    pg.finished = true;
    var sc = pg.graded ? pg.correct / pg.graded : 1;
    pg.msg = pg.onFinish ? pg.onFinish(sc) : '';
    UI.haptic(sc >= pg.passMark ? 'success' : 'warning');
    render(); window.scrollTo(0, 0);
  }

  function startPractice(kind, tenseId) {
    var p = State.p, items = [];
    var tids = tenseId ? [tenseId] : Content.tensesUpTo(p.cefr);
    var pool = U.shuffle(Content.sentencesFor(tids));
    if (kind === 'gaps') {
      pool.slice(0, tenseId ? 5 : 6).forEach(function (s) { items.push({ type: 'gap', s: s }); });
      push(newSession(tenseId ? Content.tense(tenseId).name : t('p_gaps'), items, function (sc) {
        if (tenseId && sc >= 0.6) { p.grammar[tenseId] = true; Game.checkAch(); State.save(); return t('grammar_done'); }
        return '';
      }));
    } else if (kind === 'translate') {
      pool.slice(0, 5).forEach(function (s, i) { var d = p.dir === 'mixed' ? (i % 2 ? 'from_en' : 'to_en') : p.dir; items.push({ type: 'tr', s: s, dir: d }); });
      push(newSession(t('p_translate'), items));
    } else if (kind === 'verbs') {
      U.pick(window.VERBS, 10).forEach(function (v) { items.push({ type: 'verb', v: v }); });
      push(newSession(t('irregular'), items));
    }
  }

  // ----- Cards -----
  Pages.cards = function (pg) {
    if (pg.i >= pg.deck.length) return head(t('cards')) + '<div class="card center result"><div class="ti big">🎉</div><h2>' + t('cards_done') + '</h2><p>' + t('cards_stat', { a: pg.known, b: pg.learned }) + '</p></div><button class="btn big" data-act="back">' + t('done') + '</button>';
    var w = pg.deck[pg.i], id = R(w), enFront = State.p.cardFront === 'en';
    var cwCls = w.kind === 's' ? 'cw sent' : 'cw';
    var front = enFront ? '<b class="' + cwCls + '">' + esc(w.w) + '</b>' + (w.ipa ? '<div class="ipa">[' + esc(w.ipa) + ']</div>' : '') : '<b class="' + cwCls + '">' + esc(wordTr(w)) + '</b>';
    var back = enFront ? '<b class="' + cwCls + '">' + esc(wordTr(w)) + '</b>' : '<b class="' + cwCls + '">' + esc(w.w) + '</b>' + (w.ipa ? '<div class="ipa">[' + esc(w.ipa) + ']</div>' : '');
    return head(t('cards'), (pg.i + 1) + ' / ' + pg.deck.length) +
      '<div class="flash' + (pg.flip ? ' flip' : '') + '" data-act="flip"><div class="face">' + front + '</div>' + (pg.flip ? '<div class="face back">' + back + '</div>' : '<div class="muted small">' + t('tap_flip') + '</div>') + '</div>' +
      '<div class="center"><button class="icon speak big" data-act="speak" data-r="' + id + '">🔊</button></div>' +
      '<div class="row3"><button class="btn sec" data-act="card" data-v="no">✗ ' + t('dont_know') + '</button><button class="btn sec" data-act="card" data-v="yes">👍 ' + t('know') + '</button><button class="btn" data-act="card" data-v="learned">✓ ' + t('learned') + '</button></div>' +
      '<p class="muted small center">' + t('cards_hint') + '</p>';
  };

  // ----- Essay -----
  var ESSAY_TOPICS = {
    general: ['My typical day', 'My family and friends', 'My hometown', 'My last holiday', 'My plans for next year', 'A book or film I recommend', 'Should people work from home?', 'How technology changes our lives', 'Is social media good or bad?', 'What makes a good leader?'],
    it: ['My job in IT', 'How I started working in tech', 'A project I am proud of', 'Remote work in IT: pros and cons', 'Will AI replace developers?', 'How my team works'],
    travel: ['My dream trip', 'The best city I have visited', 'Travelling alone or with friends?', 'A problem I had while travelling'],
    business: ['My company and my role', 'How to run a good meeting', 'The qualities of a good manager', 'How to negotiate successfully']
  };
  var MIN_WORDS = { A1: 30, A2: 50, B1: 80, B2: 120, C1: 180, C2: 220 };
  function wc(s) { return (s.trim().match(/[A-Za-z’']+/g) || []).length; }
  Pages.essay = function (pg) {
    var p = State.p;
    if (pg.step === 'topics') {
      var list = (ESSAY_TOPICS[p.track] || []).concat(p.track === 'general' ? [] : ESSAY_TOPICS.general);
      return head(t('p_essay'), t('essay_min', { n: MIN_WORDS[p.cefr] })) + '<div class="addrow"><input id="ctopic" placeholder="' + t('own_topic') + '"><button class="btn" data-act="essay-own">→</button></div>' +
        '<div class="card">' + list.map(function (x) { return '<button class="lrow" data-act="essay-topic" data-v="' + esc(x) + '"><span class="ln">✍️</span><span class="lt">' + esc(x) + '</span></button>'; }).join('') + '</div>';
    }
    if (pg.step === 'write') {
      var n = wc(pg.text || ''), min = MIN_WORDS[p.cefr];
      return head(t('p_essay'), pg.topic) + '<div class="card small muted">' + t('essay_tip') + '</div><textarea id="essay-in" rows="12" placeholder="' + t('essay_ph') + '">' + esc(pg.text || '') + '</textarea>' +
        '<div class="muted small" id="wc">' + t('words_count', { n: n, m: min }) + '</div>' + (pg.busy ? spinner(t('checking')) : '<button class="btn big" data-act="essay-send">' + t('essay_check') + '</button>') + (pg.err ? '<div class="fb bad">' + esc(pg.err) + '</div>' : '');
    }
    var r = pg.result || {};
    return head(t('p_essay'), pg.topic) + '<div class="card center"><div class="ti big">' + (r.score >= 70 ? '🏆' : '📝') + '</div><h2>' + (r.score || 0) + '/100</h2>' + (r.level ? '<span class="badge cefr">' + esc(r.level) + '</span>' : '') + '<p>' + esc(r.summary || '') + '</p></div>' +
      (r.mistakes && r.mistakes.length ? '<h3>' + t('mistakes') + '</h3><div class="card">' + r.mistakes.map(function (m) { return '<div class="mist"><s>' + esc(m.orig) + '</s> → <b>' + esc(m.fix) + '</b><div class="muted small">' + esc(m.why) + '</div></div>'; }).join('') + '</div>' : '') +
      (r.corrected ? '<h3>' + t('corrected') + '</h3><div class="card essay-c">' + esc(r.corrected).replace(/\n/g, '<br>') + '</div>' : '') +
      (r.tips && r.tips.length ? '<h3>' + t('tips') + '</h3><div class="card">' + r.tips.map(function (x) { return '<div class="li">• ' + esc(x) + '</div>'; }).join('') + '</div>' : '') +
      '<button class="btn big" data-act="back">' + t('done') + '</button>';
  };

  // ----- Speaking -----
  var SCEN = [
    { id: 'job', icon: '💼' }, { id: 'interview', icon: '🤝' }, { id: 'standup', icon: '🧑‍💻' }, { id: 'airport', icon: '✈️' },
    { id: 'restaurant', icon: '🍽' }, { id: 'smalltalk', icon: '☕' }, { id: 'free', icon: '💬' }
  ];
  Pages.speak = function () {
    return head(t('p_speak'), t('speak_sub')) + '<div class="card">' + SCEN.map(function (s) {
      return '<button class="lrow" data-act="chat" data-v="' + s.id + '"><span class="ln">' + s.icon + '</span><span class="lt">' + t('sc_' + s.id) + '</span><span class="arrow">›</span></button>';
    }).join('') + '</div>' + (Rec.supported() ? '' : '<p class="muted small center">' + t('no_mic') + '</p>');
  };
  Pages.chat = function (pg) {
    var h = head(t('sc_' + pg.scenario), t('chat_sub')) + '<div class="msgs" id="msgs">' + pg.msgs.map(function (m, i) {
      if (m.role === 'assistant') {
        return '<div class="msg ai"><div>' + esc(m.content) + '</div><div class="mtools"><button class="icon speak" data-act="say" data-v="' + esc(m.content) + '">🔊</button>' + (m.tr ? '<button class="icon" data-act="show-tr" data-v="' + i + '">🌐</button>' : '') + '</div>' + (m.showTr ? '<div class="muted small">' + esc(m.tr) + '</div>' : '') + '</div>';
      }
      return '<div class="msg me"><div>' + esc(m.content) + '</div>' + (m.better ? '<div class="corr">✏️ <b>' + esc(m.better) + '</b>' + (m.correction ? '<div class="small">' + esc(m.correction) + '</div>' : '') + '</div>' : (m.checked ? '<div class="corr ok">✓</div>' : '')) + '</div>';
    }).join('') + (pg.busy ? '<div class="msg ai typing"><span></span><span></span><span></span></div>' : '') + '</div>';
    h += '<div class="composer">' + (Rec.supported() ? '<button class="mic' + (pg.rec ? ' rec' : '') + '" data-act="mic">' + (pg.rec ? '■' : '🎙') + '</button>' : '') +
      '<textarea id="chat-in" rows="1" placeholder="' + (pg.rec ? t('recording') : t('say_ph')) + '"></textarea><button class="send" data-act="chat-send">➤</button></div>';
    return h;
  };
  async function chatTurn(pg, text) {
    if (text) { pg.msgs.push({ role: 'user', content: text }); Game.track('speak', 1); Game.addXP(5); }
    pg.busy = true; rerender();
    try {
      var hist = pg.msgs.map(function (m) { return { role: m.role, content: m.content }; });
      var r = await Api.ai('chat', { scenario: pg.scenario, history: hist });
      if (text) { var last = pg.msgs[pg.msgs.length - 1]; last.checked = true; if (r.better && U.norm(r.better) !== U.norm(text)) { last.better = r.better; last.correction = r.correction || ''; } }
      pg.msgs.push({ role: 'assistant', content: r.reply || '...', tr: r.tr || '' });
      if (State.p.autoplay) Speech.speak(r.reply || '');
    } catch (e) { UI.toast(t('ai_fail')); }
    pg.busy = false;
    if (top() === pg) rerender();
  }

  // ----- Grammar Q&A -----
  Pages.qa = function (pg) {
    var chips = ['qa1', 'qa2', 'qa3', 'qa4'];
    var h = head(t('ask'), t('ask_d')) + '<div class="msgs" id="msgs">';
    if (!pg.msgs.length) h += '<div class="card small">' + t('qa_hello') + '</div><div class="chips">' + chips.map(function (c) { return '<button class="chip" data-act="qa-chip" data-v="' + esc(t(c)) + '">' + esc(t(c)) + '</button>'; }).join('') + '</div>';
    h += pg.msgs.map(function (m) { return '<div class="msg ' + (m.role === 'user' ? 'me' : 'ai md') + '">' + (m.role === 'user' ? esc(m.content) : U.md(m.content)) + '</div>'; }).join('');
    h += (pg.busy ? '<div class="msg ai typing"><span></span><span></span><span></span></div>' : '') + '</div>';
    h += '<div class="composer"><textarea id="qa-in" rows="1" placeholder="' + t('qa_ph') + '"></textarea><button class="send" data-act="qa-send">➤</button></div>';
    return h;
  };
  async function qaAsk(pg, q) {
    pg.msgs.push({ role: 'user', content: q }); pg.busy = true; rerender();
    try {
      var r = await Api.ai('grammar_qa', { question: q, history: pg.msgs.slice(-7, -1) });
      pg.msgs.push({ role: 'assistant', content: r.answer || '' });
      Game.track('question', 1); Game.addXP(2);
    } catch (e) { pg.msgs.push({ role: 'assistant', content: '⚠️ ' + t('ai_fail') }); }
    pg.busy = false; if (top() === pg) rerender();
  }

  // ---------- Actions ----------
  var A = {};
  A.back = pop;
  A.tab = function (d) { nav.tab = d.v; nav.stack = []; render(); window.scrollTo(0, 0); };
  A.dictsub = function (d) { nav.tab = 'dict'; nav.sub.dict = d.v; render(); window.scrollTo(0, 0); };
  A.seg = function (d) {
    var p = State.p;
    if (d.k === 'course' || d.k === 'dict') nav.sub[d.k] = d.v;
    else if (d.k === 'lang') p.lang = d.v;
    else if (d.k === 'front') p.cardFront = d.v;
    else if (d.k === 'dir') p.dir = d.v;
    else if (d.k === 'rate') p.rate = parseFloat(d.v);
    else if (d.k === 'autoplay') p.autoplay = d.v === '1';
    State.save(); rerender();
  };
  A['onb-level'] = function (d) { State.p.cefr = d.v; rerender(); };
  A['onb-track'] = function (d) { State.p.track = d.v; rerender(); };
  A['onb-done'] = function () { State.p.onboarded = true; Game.refreshQuests(); State.save(true); render(); };
  A['set-track'] = function (d) { State.p.track = d.v; State.save(); rerender(); };
  A['set-level'] = async function (d) {
    if (d.v === State.p.cefr) return;
    if (await UI.confirm(t('confirm_level', { l: d.v }))) { State.p.cefr = d.v; State.save(); rerender(); }
  };
  A.reset = async function () {
    if (!(await UI.confirm(t('confirm_reset')))) return;
    await E.Store.wipe(); location.reload();
  };
  A.open = function (d) {
    if (d.v === 'essay') push({ type: 'essay', step: 'topics' });
    else if (d.v === 'qa') push({ type: 'qa', msgs: [] });
    else push({ type: d.v });
  };
  A.lesson = function (d) {
    var n = +d.n;
    if (!lessonUnlocked(d.l, n)) return UI.toast(t('locked'));
    startLesson(d.l, n);
  };
  A['lesson-retry'] = function () { var pg = top(); nav.stack.pop(); if (pg.n === '🏁') startExam(pg.level); else startLesson(pg.level, pg.n); };
  A.exam = function (d) {
    var lv = window.LEVELS.find(function (x) { return x.id === d.l; });
    var all = lv.lessons.every(function (x, i) { return (State.p.lessons[lessonKey(d.l, i + 1)] || {}).done; });
    if (!all) return UI.toast(t('exam_lock'));
    startExam(d.l);
  };
  A.tense = function (d) { push({ type: 'tense', id: d.v }); };
  A['tense-practice'] = function (d) { startPractice('gaps', d.v); };
  A.practice = function (d) { startPractice(d.v); };
  A['verbs-quiz'] = function () { startPractice('verbs'); };
  A.speak = function (d) { var w = reg[d.r]; if (w) Speech.speak(w.w); };
  A.say = function (d) { Speech.speak(d.v); };
  A['verb-speak'] = function (d) { var v = reg[d.r]; Speech.speak(v.v1 + ', ' + v.v2 + ', ' + v.v3); };
  A['verb-add'] = function (d) {
    var v = reg[d.r];
    if (Dict.add({ w: v.v1 + ' – ' + v.v2 + ' – ' + v.v3, ipa: '', uk: v.uk, ru: v.ru })) UI.toast(t('added'));
    rerender();
  };
  A['dict-add'] = function (d) {
    var w = reg[d.r];
    if (Dict.has(w.w)) { Dict.remove(w.w); } else { Dict.add(w); UI.toast(t('added')); }
    UI.haptic('light'); rerender();
  };
  A['add-all'] = function () {
    var it = top().items[top().i], n = 0;
    it.words.forEach(function (w) { if (!Dict.has(w.w) && !Dict.isLearned(w.w)) { Dict.add(w); n++; } });
    UI.toast(t('added') + ' ' + n); rerender();
  };
  A['dict-del'] = function (d) { Dict.remove(reg[d.r].w); rerender(); };
  A.learn = function (d) { Dict.learn(reg[d.r].w); UI.haptic('success'); rerender(); };
  A['word-lookup'] = async function () {
    var inp = document.getElementById('newword'), w = (inp.value || '').trim();
    if (!w) return;
    if (Dict.has(w)) return UI.toast(t('already'));
    inp.disabled = true;
    try {
      var r = await Api.ai('word_info', { word: w });
      Dict.add({ w: r.w || w, ipa: r.ipa || '', uk: r.uk || '', ru: r.ru || '' });
      UI.toast(t('added'));
    } catch (e) {
      var manual = window.prompt(t('manual_tr'));
      if (manual) { var o = { w: w }; o[L()] = manual; Dict.add(o); }
    }
    rerender();
  };
  A['cards-start'] = function () {
    var deck = State.dict.items.slice().sort(function (a, b) { return (a.box || 0) - (b.box || 0) || Math.random() - 0.5; }).slice(0, 20);
    if (!deck.length) return;
    push({ type: 'cards', deck: deck, i: 0, flip: false, known: 0, learned: 0 });
  };
  A.flip = function () { var pg = top(); pg.flip = !pg.flip; if (pg.flip && State.p.cardFront !== 'en' && State.p.autoplay) Speech.speak(pg.deck[pg.i].w); UI.haptic('light'); rerender(); };
  A.card = function (d) {
    var pg = top(), w = pg.deck[pg.i];
    var item = State.dict.items.find(function (x) { return x.w === w.w; });
    if (d.v === 'learned') { Dict.learn(w.w); pg.learned++; }
    else if (d.v === 'yes') { if (item) item.box = (item.box || 0) + 1; pg.known++; State.saveDict(); }
    else { if (item) item.box = 0; State.saveDict(); if (pg.deck.filter(function (x) { return x.w === w.w; }).length < 3) pg.deck.push(w); }
    Game.track('cards', 1);
    pg.i++; pg.flip = false;
    if (pg.i >= pg.deck.length) Game.addXP(10);
    else if (State.p.autoplay && State.p.cardFront === 'en') Speech.speak(pg.deck[pg.i].w);
    render();
  };
  A.retry = function () {
    var pg = top(), it = pg.items[pg.i];
    it.done = false; it.ok = null; it.fb = ''; it.okParts = null; it.retry = true; it.picked = null; it.selfCheck = false;
    rerender();
    var f = root.querySelector('.gap-in, #tr-in'); if (f) { f.focus(); if (f.select) f.select(); }
  };
  A['save-mistake'] = function () {
    var e = mistakeEntry(top().items[top().i]);
    if (e && Dict.add(e)) { UI.toast(t('added')); UI.haptic('light'); }
    rerender();
  };
  A['sent-train'] = function () {
    var items = U.shuffle(State.dict.items.filter(function (x) { return x.kind === 's' && window.SENTENCES[x.sid]; }))
      .slice(0, 10).map(function (x) { return { type: 'gap', s: window.SENTENCES[x.sid] }; });
    if (!items.length) return;
    push(newSession(t('sent_train'), items));
  };
  A['donate-pick'] = function (d) { var pg = top(); pg.amount = +d.v; pg.custom = false; UI.haptic('light'); rerender(); };
  A['donate-go'] = function () { donate(top()); };
  A.next = nextItem;
  A.check = checkItem;
  A.pick = function (d) {
    var pg = top(), it = pg.items[pg.i];
    if (it.done) return;
    it.picked = +d.v;
    var ok = it.options[it.picked].w === it.w.w;
    grade(pg, it, ok, ok ? '✅ ' + t('right') : '❌ ' + esc(it.w.w) + ' — ' + esc(wordTr(it.w)));
    if (ok) Speech.speak(it.w.w);
    rerender();
  };
  A.self = function (d) {
    var pg = top(), it = pg.items[pg.i]; it.selfCheck = false;
    var ok = d.v === '1'; var fb = it.fb;
    grade(pg, it, ok, fb); rerender();
  };
  A['essay-topic'] = function (d) { var pg = top(); pg.topic = d.v; pg.step = 'write'; rerender(); window.scrollTo(0, 0); };
  A['essay-own'] = function () { var v = (document.getElementById('ctopic').value || '').trim(); if (!v) return; A['essay-topic']({ v: v }); };
  A['essay-send'] = async function () {
    var pg = top(); pg.text = document.getElementById('essay-in').value;
    var n = wc(pg.text), min = MIN_WORDS[State.p.cefr];
    if (n < min) { pg.err = t('essay_short', { n: n, m: min }); return rerender(); }
    pg.err = ''; pg.busy = true; rerender();
    try {
      var r = await Api.ai('check_essay', { topic: pg.topic, text: pg.text });
      pg.result = r; pg.step = 'result'; pg.busy = false;
      State.p.essays.unshift({ topic: pg.topic, score: r.score || 0, date: U.today() });
      State.p.essays = State.p.essays.slice(0, 20);
      Game.track('essay', 1); Game.addXP(30);
    } catch (e) { pg.busy = false; pg.err = t('ai_fail') + ' (' + e.message + ')'; }
    if (top() === pg) { render(); window.scrollTo(0, 0); }
  };
  A.chat = function (d) { var pg = { type: 'chat', scenario: d.v, msgs: [] }; push(pg); chatTurn(pg, ''); };
  A['chat-send'] = function () {
    var pg = top(), inp = document.getElementById('chat-in'), v = (inp.value || '').trim();
    if (!v || pg.busy) return; chatTurn(pg, v);
  };
  A['show-tr'] = function (d) { var m = top().msgs[+d.v]; m.showTr = !m.showTr; rerender(); };
  A.mic = async function () {
    var pg = top();
    if (pg.busy) return;
    if (!pg.rec) {
      try { await Rec.start(); pg.rec = true; UI.haptic('medium'); rerender(); }
      catch (e) { UI.toast(t('mic_denied'), 2500); }
      return;
    }
    pg.rec = false; pg.busy = true; rerender();
    try {
      var blob = await Rec.stop();
      var text = await Rec.transcribe(blob);
      pg.busy = false;
      if (!text) { UI.toast(t('not_heard')); return rerender(); }
      chatTurn(pg, text);
    } catch (e) { pg.busy = false; UI.toast(t('stt_fail')); rerender(); }
  };
  A['qa-chip'] = function (d) { qaAsk(top(), d.v); };
  A['qa-send'] = function () { var pg = top(), v = (document.getElementById('qa-in').value || '').trim(); if (v && !pg.busy) qaAsk(pg, v); };

  root.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    var fn = A[el.dataset.act];
    if (fn) { e.preventDefault(); fn(el.dataset, el); }
  });
  root.addEventListener('input', function (e) {
    if (e.target.id === 'vsearch') {
      nav.verbQ = e.target.value; var pos = e.target.selectionStart;
      rerender(); var s = document.getElementById('vsearch'); s.focus(); s.setSelectionRange(pos, pos);
    } else if (e.target.id === 'donate-in') {
      var dp = top(); dp.amount = Math.max(0, Math.floor(+e.target.value || 0)); dp.custom = true;
      root.querySelectorAll('.chip.star').forEach(function (c) { c.classList.remove('on'); });
      var b = document.getElementById('donate-btn'); if (b) { b.disabled = !dp.amount; b.textContent = t('donate_btn', { n: dp.amount || '…' }); }
    } else if (e.target.id === 'essay-in') {
      var pg = top(); pg.text = e.target.value;
      var w = document.getElementById('wc'); if (w) w.textContent = t('words_count', { n: wc(pg.text), m: MIN_WORDS[State.p.cefr] });
    } else if (e.target.tagName === 'TEXTAREA' && (e.target.id === 'chat-in' || e.target.id === 'qa-in')) {
      e.target.style.height = 'auto'; e.target.style.height = Math.min(120, e.target.scrollHeight) + 'px';
    }
  });
  root.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    var id = e.target.id;
    if (id === 'newword') { e.preventDefault(); A['word-lookup'](); }
    else if (id === 'ctopic') { e.preventDefault(); A['essay-own'](); }
    else if ((id === 'chat-in' || id === 'qa-in') && !e.shiftKey) { e.preventDefault(); A[id === 'chat-in' ? 'chat-send' : 'qa-send'](); }
    else if (e.target.classList.contains('gap-in')) {
      e.preventDefault();
      var ins = Array.prototype.slice.call(root.querySelectorAll('.gap-in')), i = ins.indexOf(e.target);
      if (i < ins.length - 1) ins[i + 1].focus(); else { var pg = top(), it = pg && pg.items && pg.items[pg.i]; if (it && !it.done) checkItem(); else if (it) nextItem(); }
    }
  });

  // ---------- старт ----------
  async function boot() {
    if (tg) {
      try {
        tg.ready(); tg.expand();
        if (tg.isVersionAtLeast('7.7')) tg.disableVerticalSwipes();
        if (tg.isVersionAtLeast('6.1')) tg.BackButton.onClick(pop);
        if (tg.colorScheme === 'dark') document.documentElement.classList.add('dark');
        tg.onEvent('themeChanged', function () { document.documentElement.classList.toggle('dark', tg.colorScheme === 'dark'); });
      } catch (e) { }
    }
    root.innerHTML = spinner('EnglishUp');
    await State.load();
    if (!State.p.onboarded && E.inTg) {
      var lc = (tg.initDataUnsafe.user || {}).language_code;
      if (lc === 'ru') State.p.lang = 'ru';
    }
    render();
  }
  boot();
})();
