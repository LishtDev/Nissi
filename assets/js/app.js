/* ============================================================
   app.js — orchestration : contenu, scènes, lettre, finale, ciel
   ============================================================ */
(function () {
  'use strict';

  var BG = (window.BG = window.BG || {});
  var C = window.BARBICHOU_CONTENT;
  var $ = function (id) { return document.getElementById(id); };
  var TOTAL = 7;
  var STORE_KEY = 'barbichou-garden-v1';

  var reducedQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  function reduced() { return !!reducedQuery.matches; }

  if (!C) {
    document.body.textContent = 'Contenu introuvable (config/content.js).';
    return;
  }

  /* ---------- état (sessionStorage, local au navigateur, rien n'est envoyé) ---------- */
  var state = { scene: 1, entered: false, unlocked: false, visited: [1], found: [] };

  function loadState() {
    try {
      var raw = window.sessionStorage.getItem(STORE_KEY);
      if (!raw) return;
      var s = JSON.parse(raw);
      if (s && typeof s === 'object') {
        state.scene = Number.isInteger(s.scene) && s.scene >= 1 && s.scene <= TOTAL ? s.scene : 1;
        state.entered = !!s.entered;
        state.unlocked = !!s.unlocked;
        state.visited = Array.isArray(s.visited) ? s.visited.filter(Number.isInteger) : [1];
        state.found = Array.isArray(s.found) ? s.found.filter(Number.isInteger) : [];
        if (!state.entered) state.scene = 1;
        if (state.scene === 7 && !state.unlocked) state.scene = 6;
      }
    } catch (e) { /* stockage indisponible : on continue sans */ }
  }
  function saveState() {
    try { window.sessionStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignoré */ }
  }
  function clearState() {
    state = { scene: 1, entered: false, unlocked: false, visited: [1], found: [] };
    try { window.sessionStorage.removeItem(STORE_KEY); } catch (e) { /* ignoré */ }
  }

  /* ---------- remplissage des textes (textContent uniquement) ---------- */
  function setText(id, text) { var n = $(id); if (n) n.textContent = text == null ? '' : String(text); }

  function fillContent() {
    var s1 = C.invitation, s2 = C.birthday, s3 = C.gallery, s4 = C.letter, s5 = C.music, s7 = C.finale;
    setText('s1-kicker', s1.kicker); setText('s1-title', s1.title);
    setText('btn-enter', s1.button); setText('btn-enter-music', s1.buttonWithMusic); setText('s1-note', s1.note);

    setText('s2-pre', s2.pre); setText('s2-name', s2.name); setText('s2-nick', s2.nicknameLine);
    setText('s2-text', s2.text); setText('btn-s2-next', s2.button);
    $('s2-title').setAttribute('aria-label', s2.pre + ' ' + s2.name);

    setText('s3-title', s3.title); setText('s3-intro', s3.intro); setText('btn-s3-next', s3.button);

    setText('s4-title', s4.title); setText('s4-hint', s4.envelopeHint); setText('btn-s4-next', s4.button);
    $('envelope').setAttribute('aria-label', s4.openLabel);
    setText('btn-close-letter', s4.closeButton);
    setText('letter-greeting', s4.greeting);
    var body = $('letter-body'); body.replaceChildren();
    (s4.paragraphs || []).forEach(function (t) {
      var p = document.createElement('p'); p.textContent = t; body.appendChild(p);
    });
    setText('letter-sign', s4.signature);

    setText('s5-title', s5.title); setText('s5-intro', s5.intro); setText('btn-s5-next', s5.button);

    setText('s7-title', s7.title);
    setText('btn-replay', s7.replay); setText('btn-reread', s7.rereadLetter); setText('btn-restart', s7.restart);

    $('btn-back').setAttribute('aria-label', C.ui.back);
    $('btn-home').setAttribute('aria-label', C.ui.home);
  }

  /* ---------- scènes ---------- */
  var scenes = [];
  var dots = [];
  var finaleTimer = null;
  var current = 0;

  function sceneEl(n) { return $('scene-' + n); }

  function isUnlocked(n) {
    if (n === 1) return true;
    if (!state.entered) return false;
    if (n === 7) return state.unlocked;
    return true;
  }

  function buildDots() {
    var nav = $('dots'); nav.replaceChildren();
    for (var i = 1; i <= TOTAL; i++) {
      (function (n) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'dot';
        b.setAttribute('data-n', String(n));
        b.addEventListener('click', function () {
          if (isUnlocked(n)) go(n); else announceLocked();
        });
        nav.appendChild(b);
        dots[n] = b;
      })(i);
    }
  }

  function announceLocked() {
    var m = $('star-message');
    if (m) m.textContent = C.ui.locked;
    if (current !== 6) go(6);
  }

  function updateChrome() {
    for (var n = 1; n <= TOTAL; n++) {
      var d = dots[n]; if (!d) continue;
      var name = C.ui.sceneNames[n - 1] || ('Scène ' + n);
      var locked = !isUnlocked(n);
      d.classList.toggle('is-current', n === current);
      d.classList.toggle('is-visited', state.visited.indexOf(n) !== -1 && n !== current);
      d.setAttribute('aria-disabled', locked ? 'true' : 'false');
      if (n === current) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current');
      d.setAttribute('aria-label', 'Scène ' + n + ' sur ' + TOTAL + ' : ' + name + (locked ? ' (verrouillée)' : ''));
      d.title = locked ? C.ui.locked : name;
    }
    $('topbar').hidden = current === 1;
    $('btn-back').disabled = current <= 1;
    // mini-lecteur : visible une fois entrée, sauf dans la scène musique (lecteur complet) ou si aucune piste
    $('dock').hidden = !(current >= 2 && current !== 5 && BG.musicAvailable !== false);
  }

  function flashBloom() {
    if (reduced()) return;
    var b = $('bloom');
    b.classList.remove('is-flash'); void b.offsetWidth; b.classList.add('is-flash');
  }

  function go(n, opts) {
    opts = opts || {};
    if (n < 1 || n > TOTAL || !isUnlocked(n)) return;
    var prev = current;
    current = n;
    if (n > 1) state.entered = true;
    if (state.visited.indexOf(n) === -1) state.visited.push(n);
    state.scene = n;
    saveState();

    scenes.forEach(function (el, i) {
      var active = i + 1 === n;
      el.classList.toggle('is-active', active);
      if (active) { el.removeAttribute('inert'); el.removeAttribute('aria-hidden'); }
      else { el.setAttribute('inert', ''); el.setAttribute('aria-hidden', 'true'); }
    });

    var target = sceneEl(n);
    target.scrollTop = 0;
    if (prev === 1 && n === 2) flashBloom();
    if (BG.Gallery && prev === 3 && n !== 3) BG.Gallery.close();

    if (n !== 7) { stopFinale(); }
    if (n === 7) playFinale();
    if (n === 4 && opts.openLetter) openLetter(true);

    updateChrome();

    if (!opts.silent) {
      var h = target.querySelector('h1, h2');
      if (h) setTimeout(function () { try { h.focus({ preventScroll: true }); } catch (e) { /* ignoré */ } }, 60);
    }
  }

  /* ---------- lettre ---------- */
  var letterOpen = false;

  function openLetter(instant) {
    if (letterOpen) return;
    letterOpen = true;
    var env = $('envelope'), letter = $('letter');
    env.setAttribute('aria-expanded', 'true');
    env.classList.add('is-open');
    function reveal() {
      env.classList.add('is-gone');
      env.hidden = true;
      $('s4-hint').hidden = true;
      letter.hidden = false;
      letter.classList.remove('is-shown'); void letter.offsetWidth; letter.classList.add('is-shown');
      $('btn-close-letter').hidden = false;
      try { letter.focus({ preventScroll: true }); } catch (e) { /* ignoré */ }
      sceneEl(4).scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' });
    }
    if (instant || reduced()) reveal(); else setTimeout(reveal, 950);
  }

  function closeLetter() {
    if (!letterOpen) return;
    letterOpen = false;
    var env = $('envelope');
    $('letter').hidden = true;
    $('btn-close-letter').hidden = true;
    env.hidden = false; env.classList.remove('is-gone', 'is-open');
    env.setAttribute('aria-expanded', 'false');
    $('s4-hint').hidden = false;
    env.focus({ preventScroll: true });
  }

  /* ---------- finale ---------- */
  function buildSparks() {
    var box = $('sparks');
    if (box.childNodes.length) return;
    var glyphs = ['✦', '✧', '★', '✦'];
    for (var i = 0; i < 28; i++) {
      var s = document.createElement('span');
      s.className = 'spark';
      s.setAttribute('aria-hidden', 'true');
      s.textContent = glyphs[i % glyphs.length];
      s.style.left = (Math.random() * 100).toFixed(1) + '%';
      s.style.top = (Math.random() * 100).toFixed(1) + '%';
      s.style.fontSize = (10 + Math.random() * 18).toFixed(0) + 'px';
      s.style.setProperty('--delay', (-Math.random() * 8).toFixed(2) + 's');
      s.style.setProperty('--dur', (5 + Math.random() * 6).toFixed(2) + 's');
      box.appendChild(s);
    }
  }

  function buildMessage() {
    var box = $('final-message'); box.replaceChildren();
    var words = String(C.finale.message || '').split(/\s+/).filter(Boolean);
    words.forEach(function (w, i) {
      var sp = document.createElement('span');
      sp.className = 'w'; sp.textContent = w;
      sp.style.setProperty('--i', String(i));
      box.appendChild(sp);
      if (i < words.length - 1) box.appendChild(document.createTextNode(' '));
    });
    return words.length;
  }

  function showFinaleActions() {
    var a = $('final-actions');
    a.hidden = false;
    a.classList.remove('is-shown'); void a.offsetWidth; a.classList.add('is-shown');
  }

  function stopFinale() { clearTimeout(finaleTimer); finaleTimer = null; }

  function playFinale() {
    stopFinale();
    buildSparks();
    var n = buildMessage();
    var msg = $('final-message'), title = $('s7-title'), actions = $('final-actions');
    actions.hidden = true; actions.classList.remove('is-shown');
    msg.classList.remove('is-playing'); title.classList.remove('is-playing');
    if (reduced()) { showFinaleActions(); return; }
    void msg.offsetWidth;
    msg.classList.add('is-playing'); title.classList.add('is-playing');
    finaleTimer = setTimeout(function () { finishFinale(); }, 1800 + n * 85 + 1000);
  }

  function finishFinale() {          // appelée à la fin, ou par un clic pour tout afficher
    stopFinale();
    $('final-message').classList.remove('is-playing');
    $('s7-title').classList.remove('is-playing');
    showFinaleActions();
  }

  /* ---------- ciel étoilé (canvas) ---------- */
  function startSky() {
    var canvas = $('sky');
    var ctx = canvas.getContext && canvas.getContext('2d');
    if (!ctx) return;
    var w = 0, h = 0, dpr = 1, stars = [], dust = [], shooter = null, nextShot = 0, raf = 0;

    function rand(a, b) { return a + Math.random() * (b - a); }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.max(60, Math.min(200, Math.round((w * h) / 9000)));
      stars = []; dust = [];
      for (var i = 0; i < count; i++) {
        stars.push({ x: Math.random() * w, y: Math.random() * h, r: rand(.4, 1.5), a: rand(.35, .9), s: rand(.4, 1.6), p: rand(0, 6.28) });
      }
      for (var j = 0; j < 26; j++) {
        dust.push({ x: Math.random() * w, y: Math.random() * h, r: rand(.8, 2), v: rand(.1, .3), p: rand(0, 6.28) });
      }
      if (reduced()) draw(0);
    }

    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      var still = reduced();
      var i, s;
      for (i = 0; i < stars.length; i++) {
        s = stars[i];
        var a = still ? s.a * .8 : s.a * (.55 + .45 * Math.sin(t / 1000 * s.s + s.p));
        ctx.fillStyle = 'rgba(245,243,250,' + a.toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.2832); ctx.fill();
      }
      for (i = 0; i < dust.length; i++) {
        var d = dust[i];
        if (!still) { d.y -= d.v; d.x += Math.sin(t / 2500 + d.p) * .15; if (d.y < -4) { d.y = h + 4; d.x = Math.random() * w; } }
        var da = still ? .35 : .25 + .25 * Math.sin(t / 900 + d.p);
        ctx.fillStyle = 'rgba(214,183,121,' + da.toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 6.2832); ctx.fill();
      }
      if (!still) {
        if (!shooter && t > nextShot) {
          shooter = { x: rand(w * .2, w), y: rand(0, h * .35), vx: -rand(5, 8), vy: rand(2.5, 4), life: 0 };
        }
        if (shooter) {
          var g = ctx.createLinearGradient(shooter.x, shooter.y, shooter.x - shooter.vx * 9, shooter.y - shooter.vy * 9);
          g.addColorStop(0, 'rgba(255,244,214,' + (0.9 - shooter.life / 60).toFixed(3) + ')');
          g.addColorStop(1, 'rgba(255,244,214,0)');
          ctx.strokeStyle = g; ctx.lineWidth = 1.6;
          ctx.beginPath(); ctx.moveTo(shooter.x, shooter.y); ctx.lineTo(shooter.x - shooter.vx * 9, shooter.y - shooter.vy * 9); ctx.stroke();
          shooter.x += shooter.vx; shooter.y += shooter.vy; shooter.life++;
          if (shooter.life > 50) { shooter = null; nextShot = t + rand(7000, 14000); }
        }
      }
    }

    function loop(t) { draw(t); raf = requestAnimationFrame(loop); }
    function begin() {
      cancelAnimationFrame(raf);
      resize();
      if (!reduced()) { nextShot = performance.now() + 4000; raf = requestAnimationFrame(loop); }
    }

    var rt = 0;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(begin, 150); });
    if (reducedQuery.addEventListener) reducedQuery.addEventListener('change', begin);
    begin();
  }

  /* ---------- reveal : on étage l'apparition des éléments de chaque scène ---------- */
  function markReveals() {
    scenes.forEach(function (sc) {
      var kids = [];
      var moon = sc.querySelector('.moon'); if (moon) kids.push(moon);
      var inner = sc.querySelector('.scene__inner');
      if (inner) Array.prototype.forEach.call(inner.children, function (c) { kids.push(c); });
      kids.forEach(function (k, i) {
        if (sc.id === 'scene-7' && (k.id === 's7-title' || k.id === 'final-message' || k.id === 'final-actions')) return;
        k.classList.add('reveal'); k.style.setProperty('--d', String(i * 160));
      });
    });
  }

  /* ---------- liaison des boutons ---------- */
  function bind() {
    function enter() { state.entered = true; saveState(); go(2); }
    $('btn-enter').addEventListener('click', enter);
    $('btn-enter-music').addEventListener('click', function () {
      if (BG.Music) BG.Music.play();      // geste explicite de l'utilisatrice
      enter();
    });
    $('btn-s2-next').addEventListener('click', function () { go(3); });
    $('btn-s3-next').addEventListener('click', function () { go(4); });
    $('btn-s4-next').addEventListener('click', function () { go(5); });
    $('btn-s5-next').addEventListener('click', function () { go(6); });

    $('btn-back').addEventListener('click', function () { if (current > 1) go(current - 1); });
    $('btn-home').addEventListener('click', function () { go(1); });

    $('envelope').addEventListener('click', function () { openLetter(false); });
    $('btn-close-letter').addEventListener('click', closeLetter);

    $('btn-replay').addEventListener('click', function () { playFinale(); $('s7-title').focus({ preventScroll: true }); });
    $('btn-reread').addEventListener('click', function () { go(4, { openLetter: true }); });
    $('btn-restart').addEventListener('click', function () {
      clearState();
      BG.Game.reset({ focus: false });
      closeLetter();
      updateChrome();
      go(1);
    });
    $('final-message').addEventListener('click', function () { if (finaleTimer) finishFinale(); });

    BG.onMusicChange = function () { updateChrome(); };
  }

  /* ---------- démarrage ---------- */
  function start() {
    loadState();
    fillContent();
    scenes = [];
    for (var i = 1; i <= TOTAL; i++) scenes.push(sceneEl(i));

    buildDots();
    markReveals();
    if (BG.Music) BG.Music.init();
    if (BG.Gallery) BG.Gallery.init();
    BG.Game.init({
      found: state.found,
      onChange: function (found) { state.found = found; saveState(); },
      onComplete: function () {
        if (!state.unlocked) { state.unlocked = true; saveState(); updateChrome(); }
      },
      onUnlock: function () { go(7); }
    });
    bind();
    startSky();

    go(state.scene, { silent: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
