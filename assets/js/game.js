/* ============================================================
   game.js — « Les étoiles de Barbichou »
   Cinq étoiles à découvrir. Souris, tactile et clavier (chaque
   étoile est un vrai bouton). Aucun score, aucun chrono.
   ============================================================ */
(function () {
  'use strict';

  var BG = (window.BG = window.BG || {});
  var cfg = (window.BARBICHOU_CONTENT || {}).game || { stars: [] };
  var NS = 'http://www.w3.org/2000/svg';
  var $ = function (id) { return document.getElementById(id); };

  var field, pips, progressText, message, unlock, constellation, btnHint, btnReset, btnUnlock;
  var stars = [];            // { btn, data, found }
  var hooks = {};
  var hintTimer = null;
  var focusTimer = null;

  function starSvg() {
    var s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('aria-hidden', 'true');
    var p = document.createElementNS(NS, 'path');
    p.setAttribute('d', 'M12 1.8l2.6 6.9 7.4.4-5.8 4.6 2 7.1L12 17l-6.2 3.8 2-7.1L2 9.1l7.4-.4z');
    p.setAttribute('fill', 'currentColor');
    s.appendChild(p);
    return s;
  }

  function foundCount() { return stars.filter(function (s) { return s.found; }).length; }
  function total() { return stars.length; }
  function isComplete() { return total() > 0 && foundCount() === total(); }

  function starLabel(s, i) {
    var base = 'Étoile ' + (i + 1) + ' sur ' + total();
    return s.found ? base + ', découverte : ' + s.data.message : base + ', à découvrir';
  }

  function refresh(announce) {
    var n = foundCount();
    stars.forEach(function (s, i) {
      s.btn.classList.toggle('is-found', s.found);
      s.btn.setAttribute('aria-label', starLabel(s, i));
      s.pip.classList.toggle('is-found', s.found);
      s.pip.setAttribute('aria-label', 'Étoile ' + (i + 1) + (s.found ? ' : découverte' : ' : à découvrir'));
    });
    progressText.textContent = n + ' sur ' + total() + ' étoiles découvertes';
    btnHint.hidden = isComplete();
    if (announce && typeof hooks.onChange === 'function') hooks.onChange(getFound());
  }

  function drawConstellation() {
    constellation.replaceChildren();
    var pl = document.createElementNS(NS, 'polyline');
    pl.setAttribute('points', stars.map(function (s) { return s.data.x + ',' + s.data.y; }).join(' '));
    constellation.appendChild(pl);
  }

  function complete(animate) {
    drawConstellation();
    $('unlock-text').textContent = cfg.completeText || '';
    unlock.hidden = false;
    unlock.classList.remove('is-shown');
    void unlock.offsetWidth;
    unlock.classList.add('is-shown');
    if (typeof hooks.onComplete === 'function') hooks.onComplete();
    if (animate) {
      clearTimeout(focusTimer);
      focusTimer = setTimeout(function () {
        // on déplace le focus seulement si l'utilisatrice était sur une étoile
        if (field.contains(document.activeElement)) btnUnlock.focus({ preventScroll: false });
      }, 1200);
    }
  }

  function onStar(s) {
    message.textContent = s.data.message;
    if (!s.found) {
      s.found = true;
      refresh(true);
      if (isComplete()) complete(true);
    }
  }

  function hint() {
    var next = stars.filter(function (s) { return !s.found; })[0];
    if (!next) return;
    stars.forEach(function (s) { s.btn.classList.remove('is-hint'); });
    void next.btn.offsetWidth;
    next.btn.classList.add('is-hint');
    message.textContent = 'Regarde, une étoile scintille : ' + (stars.indexOf(next) + 1) + ' sur ' + total() + '.';
    clearTimeout(hintTimer);
    hintTimer = setTimeout(function () { next.btn.classList.remove('is-hint'); }, 3600);
  }

  function reset(opts) {
    clearTimeout(hintTimer); clearTimeout(focusTimer);
    stars.forEach(function (s) { s.found = false; s.btn.classList.remove('is-hint'); });
    constellation.replaceChildren();
    unlock.hidden = true;
    unlock.classList.remove('is-shown');
    message.textContent = cfg.idle || '';
    refresh(true);
    if (stars[0] && !(opts && opts.focus === false)) stars[0].btn.focus({ preventScroll: true });
  }

  function getFound() {
    var out = [];
    stars.forEach(function (s, i) { if (s.found) out.push(i); });
    return out;
  }

  /* init(options) — options : { found:[indices], onChange, onComplete, onUnlock } */
  function init(options) {
    hooks = options || {};
    field = $('field'); pips = $('pips'); progressText = $('progress-text'); message = $('star-message');
    unlock = $('unlock'); constellation = $('constellation');
    btnHint = $('btn-hint'); btnReset = $('btn-reset'); btnUnlock = $('btn-unlock');

    $('s6-title').textContent = cfg.title || '';
    $('s6-intro').textContent = cfg.intro || '';
    btnHint.textContent = cfg.hint || 'Indice';
    btnReset.textContent = cfg.reset || 'Recommencer';
    btnUnlock.textContent = cfg.unlockButton || 'Continuer';
    message.textContent = cfg.idle || '';

    var saved = (hooks.found || []).filter(function (i) { return Number.isInteger(i); });

    (cfg.stars || []).forEach(function (d, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'star';
      btn.style.left = d.x + '%';
      btn.style.top = d.y + '%';
      btn.style.setProperty('--i', String(i));
      btn.appendChild(starSvg());
      var badge = document.createElement('span');
      badge.className = 'badge'; badge.setAttribute('aria-hidden', 'true'); badge.textContent = String(i + 1);
      btn.appendChild(badge);

      var pip = document.createElement('li');
      pip.className = 'pip'; pip.textContent = String(i + 1);
      pips.appendChild(pip);

      var s = { btn: btn, data: d, found: saved.indexOf(i) !== -1, pip: pip };
      btn.addEventListener('click', function () { onStar(s); });
      field.appendChild(btn);
      stars.push(s);
    });

    btnHint.addEventListener('click', hint);
    btnReset.addEventListener('click', reset);
    btnUnlock.addEventListener('click', function () { if (typeof hooks.onUnlock === 'function') hooks.onUnlock(); });

    refresh(false);
    if (isComplete()) complete(false);
  }

  BG.Game = { init: init, reset: reset, isComplete: isComplete, getFound: getFound };
})();
