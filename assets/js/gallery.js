/* ============================================================
   gallery.js — grille de souvenirs + visionneuse accessible
   (<dialog> modal : focus piégé, Échap natif, focus restitué)
   ============================================================ */
(function () {
  'use strict';

  var BG = (window.BG = window.BG || {});
  var cfg = (window.BARBICHOU_CONTENT || {}).gallery || { items: [] };
  var $ = function (id) { return document.getElementById(id); };

  var items = [];          // { data, tile, broken }
  var current = 0;
  var opener = null;
  var dlg, mediaBox, caption, count, btnPrev, btnNext, btnClose;
  var touch = null;

  var svgPlay = function () {
    var ns = 'http://www.w3.org/2000/svg';
    var s = document.createElementNS(ns, 'svg');
    s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('aria-hidden', 'true');
    var p = document.createElementNS(ns, 'path');
    p.setAttribute('d', 'M8 5l11 7-11 7z'); p.setAttribute('fill', 'currentColor');
    s.appendChild(p);
    return s;
  };

  function placeholder(label) {
    var d = document.createElement('div');
    d.className = 'tile tile--placeholder';
    d.setAttribute('role', 'img');
    d.setAttribute('aria-label', label);
    d.textContent = label;
    return d;
  }

  function validItems() { return items.filter(function (it) { return !it.broken; }); }

  function markBroken(it) {
    it.broken = true;
    var ph = placeholder(cfg.brokenLabel || 'Fichier introuvable');
    var li = it.tile.parentNode;
    li.replaceChild(ph, it.tile);
    it.tile = ph;
  }

  function buildTile(it, li) {
    var d = it.data;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tile';
    var label = (d.caption || 'Souvenir') + (d.type === 'video' ? ' — vidéo' : '') + ' : agrandir';
    btn.setAttribute('aria-label', label);

    var img = document.createElement('img');
    img.alt = '';                                   // le libellé du bouton décrit déjà la vignette
    img.loading = 'lazy';
    img.decoding = 'async';
    img.src = d.type === 'video' ? (d.poster || '') : d.src;
    img.addEventListener('error', function () { markBroken(it); });
    btn.appendChild(img);

    if (d.type === 'video') {
      var badge = document.createElement('span');
      badge.className = 'tile__badge';
      badge.appendChild(svgPlay());
      badge.appendChild(document.createTextNode('Vidéo'));
      btn.appendChild(badge);
    }
    if (d.caption) {
      var cap = document.createElement('span');
      cap.className = 'tile__cap';
      cap.textContent = d.caption;
      btn.appendChild(cap);
    }
    btn.addEventListener('click', function () { open(it, btn); });
    it.tile = btn;
    li.appendChild(btn);
  }

  /* ---------- Visionneuse ---------- */
  function stopVideo() {
    var v = mediaBox.querySelector('video');
    if (v) { v.pause(); }
  }

  function render() {
    var list = validItems();
    var it = list[current];
    if (!it) return;
    stopVideo();
    var d = it.data;
    var node;
    if (d.type === 'video') {
      node = document.createElement('video');
      node.controls = true;
      node.playsInline = true;
      node.preload = 'metadata';
      if (d.poster) node.poster = d.poster;
      node.src = d.src;
      node.setAttribute('aria-label', d.alt || d.caption || 'Vidéo souvenir');
      node.addEventListener('play', function () { if (BG.Music) BG.Music.suspendForVideo(); });
      node.addEventListener('pause', function () { if (BG.Music) BG.Music.resumeAfterVideo(); });
      node.addEventListener('ended', function () { if (BG.Music) BG.Music.resumeAfterVideo(); });
      node.addEventListener('error', function () {
        var msg = document.createElement('p');
        msg.textContent = cfg.brokenLabel || 'Fichier introuvable';
        mediaBox.replaceChildren(msg);
      });
    } else {
      node = document.createElement('img');
      node.src = d.src;
      node.alt = d.alt || d.caption || '';
      node.addEventListener('error', function () {
        var msg = document.createElement('p');
        msg.textContent = cfg.brokenLabel || 'Fichier introuvable';
        mediaBox.replaceChildren(msg);
      });
    }
    mediaBox.replaceChildren(node);
    caption.textContent = d.caption || '';
    count.textContent = (current + 1) + ' / ' + list.length;
    var multi = list.length > 1;
    btnPrev.hidden = btnNext.hidden = !multi;

    // précharge la voisine
    if (multi) {
      var n = list[(current + 1) % list.length].data;
      if (n.type !== 'video') { var im = new Image(); im.src = n.src; }
    }
  }

  function go(delta) {
    var len = validItems().length;
    if (len < 2) return;
    current = (current + delta + len) % len;
    render();
  }

  function open(it, openerEl) {
    var list = validItems();
    current = Math.max(0, list.indexOf(it));
    opener = openerEl || document.activeElement;
    render();
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    btnClose.focus();
  }

  function onClose() {
    stopVideo();
    mediaBox.replaceChildren();
    if (opener && document.contains(opener) && typeof opener.focus === 'function') opener.focus();
    opener = null;
  }

  function close() {
    if (dlg.open) { if (typeof dlg.close === 'function') dlg.close(); else dlg.removeAttribute('open'); }
  }

  function init() {
    var grid = $('gallery');
    dlg = $('lightbox'); mediaBox = $('lb-media'); caption = $('lb-caption'); count = $('lb-count');
    btnPrev = $('lb-prev'); btnNext = $('lb-next'); btnClose = $('lb-close');

    var data = (cfg.items || []).filter(function (d) { return d && d.src; });
    grid.replaceChildren();

    if (data.length === 0) {
      // Aucune photo fournie : emplacements identifiés, jamais de fausses images.
      for (var k = 0; k < 3; k++) {
        var li0 = document.createElement('li');
        li0.appendChild(placeholder(cfg.emptyLabel || 'Emplacement pour une photo'));
        grid.appendChild(li0);
      }
    } else {
      data.forEach(function (d) {
        var li = document.createElement('li');
        var it = { data: d, tile: null, broken: false };
        items.push(it);
        grid.appendChild(li);
        buildTile(it, li);
      });
    }

    btnPrev.addEventListener('click', function () { go(-1); });
    btnNext.addEventListener('click', function () { go(1); });
    btnClose.addEventListener('click', close);
    dlg.addEventListener('close', onClose);
    dlg.addEventListener('cancel', function () { /* Échap : fermeture native, onClose restitue le focus */ });

    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { go(-1); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { go(1); e.preventDefault(); }
    });

    // clic sur le fond (hors figure et hors boutons) : fermer
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg || e.target.classList.contains('lightbox__stage')) close();
    });

    // balayage tactile
    var fig = $('lb-figure');
    fig.addEventListener('pointerdown', function (e) {
      if (e.target.closest('video')) { touch = null; return; }
      touch = { x: e.clientX, y: e.clientY };
    });
    fig.addEventListener('pointerup', function (e) {
      if (!touch) return;
      var dx = e.clientX - touch.x, dy = e.clientY - touch.y;
      touch = null;
      if (Math.abs(dx) > 50 && Math.abs(dy) < 60) go(dx < 0 ? 1 : -1);
    });
    fig.addEventListener('pointercancel', function () { touch = null; });
  }

  BG.Gallery = { init: init, close: close };
})();
