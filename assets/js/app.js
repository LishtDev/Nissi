/* ============================================================
   app.js — Orchestrateur de l'expérience
   - Remplit le contenu depuis config/content.js
   - Gère les chapitres, la progression, la lettre, la finale
   - Anime un ciel étoilé léger (canvas) respectueux des préférences
   ============================================================ */
(function (global) {
  "use strict";

  var BSG = (global.BSG = global.BSG || {});
  var CONTENT = global.CONTENT || {};
  var UI = CONTENT.ui || {};

  var chapitres = [];
  var indexCourant = -1;
  var maxDebloque = 0;
  var commence = false;

  /* ── Utilitaires ────────────────────────────────────────── */
  function t(str) {
    // Remplace {prenom} et {surnom} par les valeurs du profil.
    return String(str == null ? "" : str).replace(/\{(\w+)\}/g, function (m, cle) {
      var p = CONTENT.profile || {};
      return Object.prototype.hasOwnProperty.call(p, cle) ? p[cle] : m;
    });
  }

  function getPath(obj, path) {
    return path.split(".").reduce(function (acc, cle) {
      return acc && acc[cle] != null ? acc[cle] : undefined;
    }, obj);
  }

  function annoncer(texte) {
    var zone = document.getElementById("annonces");
    if (zone) zone.textContent = texte;
  }

  /* ── Remplissage du contenu statique ────────────────────── */
  function remplirContenu() {
    var porteurs = document.querySelectorAll("[data-content]");
    Array.prototype.forEach.call(porteurs, function (el) {
      var valeur = getPath(CONTENT, el.getAttribute("data-content"));
      if (typeof valeur === "string") el.textContent = t(valeur);
    });

    // Finale : plusieurs paragraphes.
    var zoneFinale = document.getElementById("finale-texte");
    if (zoneFinale && CONTENT.finale && CONTENT.finale.texte) {
      CONTENT.finale.texte.forEach(function (para) {
        var p = document.createElement("p");
        p.textContent = t(para);
        zoneFinale.appendChild(p);
      });
    }

    // Lettre : paragraphes + signature.
    var corps = document.getElementById("lettre-corps");
    if (corps && CONTENT.lettre && CONTENT.lettre.paragraphes) {
      CONTENT.lettre.paragraphes.forEach(function (para) {
        var p = document.createElement("p");
        p.textContent = t(para);
        corps.appendChild(p);
      });
    }
    var sign = document.getElementById("lettre-signature");
    if (sign && CONTENT.lettre && CONTENT.lettre.signature) {
      sign.textContent = t(CONTENT.lettre.signature);
    }
  }

  /* ── Progression (points de navigation) ─────────────────── */
  function construireProgression() {
    var liste = document.getElementById("progression-liste");
    if (!liste || !UI.chapitres) return;
    UI.chapitres.forEach(function (nom, i) {
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "progression__point";
      btn.setAttribute("aria-label", "Aller au chapitre " + (i + 1) + " : " + nom);
      btn.setAttribute("aria-current", "false");
      btn.disabled = i > maxDebloque;
      btn.addEventListener("click", function () { allerA(i); });
      li.appendChild(btn);
      liste.appendChild(li);
    });
  }

  function majProgression() {
    var points = document.querySelectorAll(".progression__point");
    Array.prototype.forEach.call(points, function (btn, i) {
      btn.setAttribute("aria-current", i === indexCourant ? "true" : "false");
      btn.disabled = i > maxDebloque;
    });
  }

  /* ── Navigation entre chapitres ─────────────────────────── */
  function allerA(n, options) {
    if (n < 0 || n >= chapitres.length) return;
    options = options || {};

    if (n > maxDebloque) return; // pas d'accès anticipé

    // Unlock du suivant logique lors d'une progression avant.
    if (indexCourant >= 0 && n === indexCourant + 1) {
      maxDebloque = Math.max(maxDebloque, n);
    }

    chapitres.forEach(function (sec, i) {
      var actif = i === n;
      sec.hidden = !actif;
      sec.classList.toggle("est-actif", actif);
    });

    indexCourant = n;

    // La musique n'apparaît qu'une fois l'expérience commencée.
    var marque = document.querySelector(".marque");
    if (marque && commence) marque.classList.add("est-visible");

    majProgression();
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    // Focus sur le titre du chapitre pour les lecteurs d'écran.
    var section = chapitres[n];
    var titre = section.querySelector("h1, h2");
    if (titre) {
      titre.setAttribute("tabindex", "-1");
      try { titre.focus({ preventScroll: true }); } catch (e) { titre.focus(); }
    }

    var nom = (UI.chapitres && UI.chapitres[n]) || ("chapitre " + (n + 1));
    annoncer("Chapitre " + (n + 1) + " : " + nom);

    if (n === chapitres.length - 1) lancerParticules();
  }

  function suivant() {
    var cible = Math.min(indexCourant + 1, chapitres.length - 1);
    maxDebloque = Math.max(maxDebloque, cible);
    allerA(cible);
  }

  /* ── Lettre ─────────────────────────────────────────────── */
  function ouvrirLettre() {
    var env = document.getElementById("enveloppe");
    var papier = document.getElementById("lettre-papier");
    var suite = document.getElementById("lettre-suivant");
    if (papier) {
      papier.hidden = false;
      papier.classList.add("est-ouverte");
    }
    if (env) env.hidden = true;
    if (suite) suite.hidden = false;
    if (papier) {
      try { papier.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (e) {}
    }
  }

  /* ── Particules dorées de la finale ─────────────────────── */
  function lancerParticules() {
    var reduit = global.matchMedia &&
      global.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduit) return;

    var n = 24;
    for (var i = 0; i < n; i++) {
      (function (i) {
        var p = document.createElement("span");
        p.className = "particule";
        p.style.left = Math.random() * 100 + "vw";
        p.style.bottom = "-10px";
        p.style.animationDuration = 4 + Math.random() * 4 + "s";
        p.style.animationDelay = (i * 0.12) + "s";
        document.body.appendChild(p);
        // Retrait après l'animation pour ne pas accumuler les noeuds.
        p.addEventListener("animationend", function () { p.remove(); });
        // Filet de sécurité si l'événement n'arrive pas.
        global.setTimeout(function () { if (p.parentNode) p.remove(); }, 12000);
      })(i);
    }
  }

  /* ── Ciel étoilé (canvas) ───────────────────────────────── */
  function cielEtoile() {
    var canvas = document.getElementById("ciel-canvas");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var reduit = global.matchMedia &&
      global.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var etoiles = [];
    var rayon = 0;
    var dpr = Math.min(global.devicePixelRatio || 1, 2);
    var raf = null;

    function dimensionner() {
      var w = canvas.clientWidth || global.innerWidth;
      var h = canvas.clientHeight || global.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      rayon = w * h;
      var nombre = Math.min(150, Math.round(rayon / 9000));
      etoiles = [];
      for (var i = 0; i < nombre; i++) {
        etoiles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.4 + 0.3,
          base: Math.random() * 0.5 + 0.3,
          phase: Math.random() * Math.PI * 2,
          vitesse: Math.random() * 0.02 + 0.006,
          teinte: Math.random() < 0.25 ? "or" : "blanc",
        });
      }
      if (reduit) dessiner(0);
    }

    function dessiner(temps) {
      var w = canvas.width / dpr;
      var h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < etoiles.length; i++) {
        var s = etoiles[i];
        var alpha = reduit ? s.base : s.base + Math.sin(temps * s.vitesse + s.phase) * 0.28;
        if (alpha < 0.05) alpha = 0.05;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.teinte === "or"
          ? "rgba(214, 183, 121, " + alpha + ")"
          : "rgba(245, 243, 250, " + alpha + ")";
        ctx.fill();
      }
    }

    function boucle(temps) {
      dessiner(temps * 0.06);
      raf = global.requestAnimationFrame(boucle);
    }

    function demarrer() {
      if (reduit) return;
      if (raf == null) raf = global.requestAnimationFrame(boucle);
    }
    function arreter() {
      if (raf != null) { global.cancelAnimationFrame(raf); raf = null; }
    }

    dimensionner();
    if (reduit) { dessiner(0); }
    else { demarrer(); }

    var minuteries;
    global.addEventListener("resize", function () {
      global.clearTimeout(minuteries);
      minuteries = global.setTimeout(function () {
        dimensionner();
        dessiner(0);
      }, 200);
    });

    // Économise les ressources quand l'onglet est masqué.
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) arreter();
      else if (!reduit) demarrer();
    });
  }

  /* ── Écouteurs globaux ──────────────────────────────────── */
  function brancherActions() {
    document.addEventListener("click", function (e) {
      var cible = e.target.closest ? e.target.closest("[data-action]") : null;
      if (!cible) return;
      var action = cible.getAttribute("data-action");

      if (action === "entrer") {
        commence = true;
        if (lecteur && lecteur.montrer) lecteur.montrer();
        var marque = document.querySelector(".marque");
        if (marque) marque.classList.add("est-visible");
        suivant();
        return;
      }
      if (action === "suivant") { suivant(); return; }
      if (action === "precedent") {
        allerA(Math.max(indexCourant - 1, 0));
        return;
      }
      if (action === "ouvrir-lettre") { ouvrirLettre(); return; }
      if (action === "revoir") {
        // Retour au tout début : on rouvre l'invitation.
        indexCourant = -1;
        maxDebloque = Math.max(maxDebloque, 0);
        allerA(0);
        return;
      }
      // "rejouer-jeu" est géré dans game.js
    });
  }

  /* ── Lecteur musical ────────────────────────────────────── */
  var lecteur = null;

  /* ── Démarrage ──────────────────────────────────────────── */
  function init() {
    chapitres = Array.prototype.slice.call(
      document.querySelectorAll(".chapitre")
    );

    remplirContenu();
    construireProgression();
    brancherActions();
    cielEtoile();

    if (BSG.galerie) BSG.galerie.creer(CONTENT.galerie, UI);
    if (BSG.jeu) BSG.jeu.creer(CONTENT.jeu, UI);
    if (BSG.musique) lecteur = BSG.musique.creer(CONTENT.musique, UI);

    // État initial : invitation visible, le reste masqué.
    chapitres.forEach(function (sec, i) {
      sec.hidden = i !== 0;
      sec.classList.toggle("est-actif", i === 0);
    });
    indexCourant = 0;
    maxDebloque = 0;
    majProgression();

    // Titre du document personnalisé avec le prénom.
    document.title = "Barbichou's Secret Garden — Joyeux anniversaire " +
      (CONTENT.profile && CONTENT.profile.prenom ? CONTENT.profile.prenom : "");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window);
