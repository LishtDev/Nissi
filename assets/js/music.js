/* ============================================================
   music.js — lecteur d'ambiance (liste de pistes, facultatif)
   - Ne démarre JAMAIS tout seul : play() n'est appelé que par un geste.
   - Une piste manquante est ignorée ; sans aucune piste, le site continue.
   ============================================================ */
(function () {
  'use strict';

  var BG = (window.BG = window.BG || {});
  var cfg = (window.BARBICHOU_CONTENT || {}).music || { tracks: [] };

  var tracks = (cfg.tracks || []).filter(function (t) { return t && t.src; });
  var failed = {};            // index -> true quand le fichier est introuvable
  var audio = null;
  var index = 0;
  var wantPlaying = false;    // l'utilisatrice a demandé la lecture
  var pausedByVideo = false;
  var volume = 0.6;
  var muted = false;
  var seeking = false;

  var $ = function (id) { return document.getElementById(id); };
  var el = {};

  function fmt(s) {
    if (!isFinite(s) || s < 0) s = 0;
    var m = Math.floor(s / 60), r = Math.floor(s % 60);
    return m + ':' + (r < 10 ? '0' : '') + r;
  }

  function availableCount() {
    var n = 0;
    for (var i = 0; i < tracks.length; i++) if (!failed[i]) n++;
    return n;
  }

  function ensureAudio() {
    if (audio) return audio;
    audio = new Audio();
    audio.preload = 'none';
    audio.volume = volume;
    audio.muted = muted;
    audio.addEventListener('ended', function () { next(true); });
    audio.addEventListener('error', onError);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onTime);
    audio.addEventListener('play', render);
    audio.addEventListener('pause', render);
    return audio;
  }

  function loadCurrent() {
    var a = ensureAudio();
    var src = tracks[index].src;
    if (a.getAttribute('data-src') !== src) {
      a.setAttribute('data-src', src);
      a.src = src;
    }
  }

  function onError() {
    // Fichier absent ou illisible : on l'écarte et on passe à la suivante.
    failed[index] = true;
    if (availableCount() === 0) {
      wantPlaying = false;
      render();
      return;
    }
    if (wantPlaying) { step(1, true); } else { render(); }
  }

  function step(dir, autoplay) {
    if (!tracks.length || availableCount() === 0) { render(); return; }
    var guard = tracks.length;
    do {
      index = (index + dir + tracks.length) % tracks.length;
      guard--;
    } while (failed[index] && guard > 0);
    if (audio) { audio.removeAttribute('data-src'); }
    if (autoplay || wantPlaying) { start(); } else { render(); }
  }

  function start() {
    if (availableCount() === 0) { wantPlaying = false; render(); return Promise.resolve(false); }
    wantPlaying = true;
    loadCurrent();
    var p;
    try { p = audio.play(); } catch (e) { p = null; }
    if (p && typeof p.then === 'function') {
      return p.then(function () { render(); return true; }).catch(function (err) {
        // Lecture refusée par le navigateur (geste requis…) : on reste en pause, sans erreur bloquante.
        if (err && err.name === 'NotAllowedError') { wantPlaying = false; }
        render();
        return false;
      });
    }
    render();
    return Promise.resolve(true);
  }

  function pause() {
    wantPlaying = false;
    pausedByVideo = false;
    if (audio) audio.pause();
    render();
  }

  function toggle() { return isPlaying() ? (pause(), Promise.resolve(false)) : start(); }
  function next(auto) { step(1, auto || wantPlaying); }
  function prev() {
    if (audio && audio.currentTime > 4) { audio.currentTime = 0; return; }
    step(-1, wantPlaying);
  }
  function isPlaying() { return !!audio && !audio.paused && !audio.ended; }

  function setVolume(v) {
    volume = Math.max(0, Math.min(1, v));
    if (audio) audio.volume = volume;
    if (volume > 0 && muted) setMuted(false); else render();
  }
  function setMuted(m) {
    muted = !!m;
    if (audio) audio.muted = muted;
    render();
  }

  /* Mise en pause automatique pendant la lecture d'une vidéo (avec son). */
  function suspendForVideo() {
    if (isPlaying()) { pausedByVideo = true; audio.pause(); }
  }
  function resumeAfterVideo() {
    if (pausedByVideo) { pausedByVideo = false; if (wantPlaying) start(); }
  }

  function onTime() {
    if (!audio || seeking) return;
    var d = audio.duration, c = audio.currentTime;
    el.cur.textContent = fmt(c);
    el.dur.textContent = isFinite(d) ? fmt(d) : '0:00';
    el.seek.value = isFinite(d) && d > 0 ? Math.round((c / d) * 1000) : 0;
    el.seek.setAttribute('aria-valuetext', fmt(c) + ' sur ' + (isFinite(d) ? fmt(d) : '0:00'));
  }

  function render() {
    var playing = isPlaying();
    var none = tracks.length === 0 || availableCount() === 0;

    var label = playing ? 'Mettre la musique en pause' : 'Lire la musique';
    [el.play, el.dockPlay].forEach(function (b) {
      if (!b) return;
      b.classList.toggle('is-playing', playing);
      b.setAttribute('aria-pressed', playing ? 'true' : 'false');
      b.setAttribute('aria-label', label);
      b.disabled = none;
    });
    if (el.player) el.player.classList.toggle('is-playing', playing);
    var eqs = document.querySelectorAll('.eq');
    for (var i = 0; i < eqs.length; i++) eqs[i].classList.toggle('is-on', playing);

    el.title.textContent = tracks.length && !none ? tracks[index].title || ('Titre ' + (index + 1)) : '—';
    el.state.textContent = none ? 'Indisponible' : (playing ? 'En lecture' : 'En pause');

    el.mute.classList.toggle('is-muted', muted);
    el.mute.setAttribute('aria-pressed', muted ? 'true' : 'false');
    el.mute.setAttribute('aria-label', muted ? 'Réactiver le son' : 'Couper le son');
    el.volume.value = String(Math.round(volume * 100));

    el.prev.disabled = el.next.disabled = el.seek.disabled = none || tracks.length < 1;
    if (tracks.length < 2) { el.prev.hidden = el.next.hidden = true; }

    el.error.hidden = !none;
    if (none) { el.error.textContent = cfg.unavailable || 'Aucune piste disponible.'; }

    BG.musicAvailable = !none;
    if (typeof BG.onMusicChange === 'function') BG.onMusicChange(none);
  }

  function init() {
    el.player = $('player'); el.play = $('p-play'); el.dockPlay = $('dock-play');
    el.prev = $('p-prev'); el.next = $('p-next'); el.mute = $('p-mute'); el.volume = $('p-volume');
    el.seek = $('seek'); el.cur = $('time-cur'); el.dur = $('time-dur');
    el.title = $('player-title'); el.state = $('player-state'); el.error = $('player-error');

    el.seek.max = '1000'; el.seek.value = '0';

    el.play.addEventListener('click', toggle);
    el.dockPlay.addEventListener('click', toggle);
    el.prev.addEventListener('click', prev);
    el.next.addEventListener('click', function () { next(); });
    el.mute.addEventListener('click', function () { setMuted(!muted); });
    el.volume.addEventListener('input', function () { setVolume(Number(el.volume.value) / 100); });

    el.seek.addEventListener('pointerdown', function () { seeking = true; });
    el.seek.addEventListener('input', function () {
      if (!audio || !isFinite(audio.duration)) return;
      seeking = true;
      el.cur.textContent = fmt((Number(el.seek.value) / 1000) * audio.duration);
    });
    el.seek.addEventListener('change', function () {
      if (audio && isFinite(audio.duration)) audio.currentTime = (Number(el.seek.value) / 1000) * audio.duration;
      seeking = false;
    });
    el.seek.addEventListener('pointerup', function () { seeking = false; });

    render();
  }

  BG.Music = {
    init: init,
    play: start,
    pause: pause,
    toggle: toggle,
    isPlaying: isPlaying,
    suspendForVideo: suspendForVideo,
    resumeAfterVideo: resumeAfterVideo
  };
})();
